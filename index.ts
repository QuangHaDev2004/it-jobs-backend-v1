import express, { Request, Response } from "express";

const app = express();
const port = 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
