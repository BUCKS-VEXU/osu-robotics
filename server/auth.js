// auth.js (ESM)
import pgSimple from 'connect-pg-simple';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import pg from 'pg';

import { prisma } from './prisma.js';

const BUCKS_GUILD_ID = '1223758397124509768';

function getBaseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers['host'];
  return `${proto}://${host}`;
}

const useSSL =
  process.env.NODE_ENV === 'production' && !/sslmode=require/.test(process.env.DATABASE_URL || '');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
});

const PgStore = pgSimple(session);

function makeSessionMiddleware() {
  return session({
    store: new PgStore({ pool, tableName: 'Auth_Sessions', createTableIfMissing: false }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  });
}

export async function configureAuth(app) {
  const scopes = ['identify', 'guilds.members.read'];
  app.set('trust proxy', 1);
  app.use(makeSessionMiddleware());

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: ['identify', 'guilds.members.read'],
      },
      async (accessToken, _refreshToken, profile, done) => {
        try {
          const id = profile.id;
          let memberJson = null;
          let inGuild = false;

          // Try to fetch the BUCKS guild member object
          const r = await fetch(
            `https://discord.com/api/users/@me/guilds/${BUCKS_GUILD_ID}/member`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );

          if (r.ok) {
            memberJson = await r.json();
            inGuild = true;
          }

          if (!inGuild) {
            return done(null, false, { message: 'not_in_guild' });
          }

          // Prefer nickname → global_name → username
          const handle =
            memberJson?.nick || profile.global_name || profile.username || `discord_${id}`;

          // Build avatar URL
          let avatarUrl;
          if (profile.avatar) {
            avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${profile.avatar}.png?size=256`;
          } else {
            const defaultIndex = parseInt(id) >> 22 % 6;
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
          }

          // Persist only for members in the guild
          await prisma.member.upsert({
            where: { id },
            update: { handle, avatarUrl },
            create: { id, handle, avatarUrl },
          });

          // Keep the session payload minimal
          return done(null, { id, handle, avatarUrl });
        } catch (e) {
          return done(e);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  app.use(passport.initialize());
  app.use(passport.session());

  // Routes
  app.get('/auth/discord', passport.authenticate('discord'));

  app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/presence?auth=failed' }),
    (req, res) => {
      const base = getBaseUrl(req);
      res.redirect(`${base}/presence`);
    },
  );

  app.post('/auth/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy(() => res.status(204).end());
    });
  });

  // Small helper endpoints
  app.get('/auth/me', (req, res) => {
    if (!req.user) return res.json({ authed: false });
    res.json({ authed: true, user: req.user });
  });
}

// Reusable guard
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  // match your prior code that used req.userId
  req.userId = req.user.id;
  next();
}
