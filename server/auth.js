// auth.js (ESM)
import session from 'express-session';
import passport from 'passport';
import {Strategy as DiscordStrategy} from 'passport-discord';

import {prisma} from './prisma.js';

const scopes = ['identify'];

function getBaseUrl(req) {
  // Vite proxy will set these when xfwd: true
  const proto = (req.headers['x-forwarded-proto'] || req.protocol);
  const host = (req.headers['x-forwarded-host'] || req.headers['host']);
  return `${proto}://${host}`;
}

export function configureAuth(app) {
  // Behind Heroku/Proxies → trust X-Forwarded-* so secure cookies work
  app.set('trust proxy', 1);

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',  // true on prod
      maxAge: 1000 * 60 * 60 * 24 * 30,               // 30 days
    },
  }));

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
