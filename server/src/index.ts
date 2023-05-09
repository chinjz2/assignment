import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import createServer from "./utils/server";
dotenv.config();

const PORT: number = parseInt((process.env.PORT || "3001") as string, 10);
const app: Express = createServer();

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
