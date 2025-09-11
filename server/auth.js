// auth.js (ESM)
import pgSimple from 'connect-pg-simple';
import session from 'express-session';
import passport from 'passport';
import {Strategy as DiscordStrategy} from 'passport-discord';
import pg from 'pg';

import {prisma} from './prisma.js';

function getBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol);
  const host = (req.headers['x-forwarded-host'] || req.headers['host']);
  return `${proto}://${host}`;
}

const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
const PgStore = pgSimple(session);

function makeSessionMiddleware() {
  return session({
    store: new PgStore({pool, tableName: 'Auth_Sessions'}),
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

  passport.use(new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: scopes,
      },
      // Verify callback: create/upsert Member, then pass minimal user object to
      // session
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Discord profile.id is the stable user id (string)
          const id = profile.id;
          const handle =
              profile.global_name || profile.username || `discord_${id}`;

          await prisma.member.upsert({
            where: {id},
            update: {handle},
            create: {id, handle},
          });

          // Keep the session light
          done(null, {id, handle});
        } catch (e) {
          done(e);
        }
      }));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  app.use(passport.initialize());
  app.use(passport.session());

  // Routes
  app.get('/auth/discord', passport.authenticate('discord'));

  app.get(
      '/auth/discord/callback', passport.authenticate('discord', {
        failureRedirect: '/presence?auth=failed',
      }),
      (_req, res) => {
        // Success → bounce back to where we want users to land
        const base = getBaseUrl(_req);
        res.redirect(`${base}/presence`);
      });

  app.post('/auth/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy(() => res.status(204).end());
    });
  });

  // Small helper endpoints
  app.get('/auth/me', (req, res) => {
    if (!req.user) return res.json({authed: false});
    res.json({authed: true, user: req.user});
  });
}

// Reusable guard
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({error: 'Unauthorized'});
  // match your prior code that used req.userId
  req.userId = req.user.id;
  next();
}
