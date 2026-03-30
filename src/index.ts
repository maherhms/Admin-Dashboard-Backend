import AgentAPI from "apminsight";
AgentAPI.config();

import express, { Request, Response } from 'express';
import cors from "cors"

import subjectsRouter from "./routes/subjects.js";
import securityMiddleware from "./middleware/security.js";

import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth.js";

const app = express();
const port = 8000;

if (!process.env.FRONTEND_URL) { throw new Error("FRONTEND_URL is not defined"); }

app.use(cors({
  origin : process.env.FRONTEND_URL,
  methods : ["GET" , "POST" , "PUT" , "DELETE"],
  credentials : true,
}))

// JSON middleware
app.use(express.json());

// Better Auth
app.all('/api/auth/*splat', toNodeHandler(auth));

// Arcjet Security Middleware
app.use(securityMiddleware);

// Routes
app.use("/api/subjects" , subjectsRouter)

// Root GET route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Admin Dashboard API!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
