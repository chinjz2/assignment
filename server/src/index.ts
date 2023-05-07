import dotenv from "dotenv";
import swaggerDocs from "./utils/swagger";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
dotenv.config();

const PORT: number = parseInt((process.env.PORT || "3001") as string, 10);
const app: Express = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
swaggerDocs(app);

app.all("*", (req: Request, res: Response) => {
  res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
