import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import session from "express-session";

import "./config/env.js";
import { env } from "./config/env.js";
import passport from "./config/passport.js";

import authRoutes from "./routes/auth.routes.js";

// import inventoryRoutes from "./routes/inventory.routes"
// import itemRoutes      from "./routes/item.routes"
// import commentRoutes   from "./routes/comment.routes"
// import searchRoutes    from "./routes/search.routes"
// import adminRoutes     from "./routes/admin.routes"
// import userRoutes      from "./routes/user.routes"

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, 
  }),
);
app.use(express.json());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
// app.use("/api/inventories", inventoryRoutes)
// app.use("/api/items",       itemRoutes)
// app.use("/api/comments",    commentRoutes)
// app.use("/api/search",      searchRoutes)
// app.use("/api/admin",       adminRoutes)
// app.use("/api/users",       userRoutes)

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ message: "serverError" });
  },
);

httpServer.listen(env.PORT, () => {
  console.log(`✅ Server running on http://localhost:${env.PORT}`);
});
