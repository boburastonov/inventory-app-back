import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import prisma from "./database";
import { env } from "./env";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account has no email"), undefined);
        }

        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          if (user.isBlocked) {
            return done(new Error("Your account has been blocked"), undefined);
          }
          return done(null, user);
        }

        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          if (user.isBlocked) {
            return done(new Error("Your account has been blocked"), undefined);
          }

          user = await prisma.user.update({
            where: { email },
            data: { googleId: profile.id },
          });
          return done(null, user);
        }

        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName || email.split("@")[0],
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value,
            emailVerified: true,
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    },
  ),
);

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.passwordHash) {
          return done(null, false, { message: "invalidCredentials" });
        }

        if (user.isBlocked) {
          return done(null, false, { message: "blocked" });
        }

        if (!user.emailVerified) {
          return done(null, false, { message: "emailNotVerified" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return done(null, false, { message: "invalidCredentials" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export default passport;
