import express, { Express, Request, Response } from "express";
import routes from "../route";
import swaggerDocs from "./swagger";
import bodyParser from "body-parser";
import cors from "cors";

function createServer() {
  const app: Express = express();
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
  swaggerDocs(app);

  app.use(routes);
  app.all("*", (req: Request, res: Response) => {
    res.sendStatus(404);
  });
  return app;
}

export default createServer;
