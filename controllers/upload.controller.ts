import { Request, Response } from "express";

export const imagePost = (req: Request, res: Response) => {
  res.json({
    location: req?.file?.path,
  });
};
