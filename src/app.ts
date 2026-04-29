import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        preferredLanguage?: string;
      };
    }
  }
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "Lingolink backend" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

export default app;
