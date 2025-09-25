// auth.ts (ESM)
import pgSimple from 'connect-pg-simple';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy, type Profile } from 'passport-discord';
import pg from 'pg';
import type { Express, Request, Response, NextFunction } from 'express';

import { prisma } from './prisma.js';

declare global {
  namespace Express {
    interface User {
      id: string;
      handle: string;
      avatarUrl: string;
      isExec: boolean;
    }
  }
}

const BUCKS_GUILD_ID = '1223758397124509768';

function getBaseUrl(req: Request) {
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
    secret: process.env.SESSION_SECRET!,
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

export async function configureAuth(app: Express) {
  const scope = ['identify', 'guilds.members.read'];
  app.set('trust proxy', 1);
  app.use(makeSessionMiddleware());

  const discordClientID = process.env.DISCORD_CLIENT_ID;
  const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
  const discordCallbackURL = process.env.DISCORD_CALLBACK_URL;
  if (!discordClientID || !discordClientSecret || !discordCallbackURL) {
    throw new Error('Missing required Discord environment variables');
  }

  passport.use(
    new DiscordStrategy(
      {
        clientID: discordClientID,
        clientSecret: discordClientSecret,
        callbackURL: discordCallbackURL,
        scope: scope,
      },
      async (accessToken, _refreshToken, discordProfile: Profile, done) => {
        try {
          const discordId = discordProfile.id;
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
            memberJson?.nick ||
            discordProfile.global_name ||
            discordProfile.username ||
            `discord_${discordId}`;

          // Build avatar URL
          let avatarUrl;
          if (discordProfile.avatar) {
            avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${discordProfile.avatar}.png?size=256`;
          } else {
            const defaultIndex = parseInt(discordId) >> 22 % 6;
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
          }

          // Persist only for members in the guild
          const member = await prisma.member.upsert({
            where: { id: discordId },
            update: { handle, avatarUrl },
            create: { id: discordId, handle, avatarUrl },
            select: { isExec: true },
          });

          return done(null, { id: discordId, handle, avatarUrl, isExec: member.isExec });
        } catch (e) {
          return done(e);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj as Express.User | null));

  app.use(passport.initialize());
  app.use(passport.session());

  function sanitizeReturnTo(returnTo: string) {
    return returnTo.startsWith('/') ? returnTo : null;
  }
  const toState = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
  const fromState = (s: string) => Buffer.from(s, 'base64url').toString('utf8');

  // Routes
  app.get('/auth/discord', (req: Request, res: Response, next: NextFunction) => {
    const rawReturnTo = req.query.returnTo;
    const returnTo = typeof rawReturnTo === 'string' ? sanitizeReturnTo(rawReturnTo) : null;
    if (!returnTo)
      return res.status(400).send('Missing or invalid ?returnTo (must start with "/")');
    passport.authenticate('discord', { state: toState(returnTo) })(req, res, next);
  });

  app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/presence?auth=failed' }),
    (req: Request, res: Response) => {
      const base = getBaseUrl(req);
      const state = typeof req.query.state === 'string' ? req.query.state : '';
      let returnTo;
      try {
        returnTo = sanitizeReturnTo(fromState(state));
      } catch {
        returnTo = null;
      }
      if (!returnTo)
        return res.status(400).send('Missing or invalid OAuth state return destination.');
      res.redirect(`${base}${returnTo}`);
    },
  );

  app.post('/auth/logout', (req: Request, res: Response) => {
    req.logout(() => {
      req.session.destroy(() => res.status(204).end());
    });
  });

  // Small helper endpoints
  app.get('/auth/me', (req: Request, res: Response) => {
    if (!req.user) return res.json({ authed: false });
    res.json({ authed: true, user: req.user });
  });
}

// Reusable guard
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
