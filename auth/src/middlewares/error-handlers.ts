import { Request, Response, NextFunction} from 'express';

export const errorHandler = (
  error: Error, req: Request, res: Response, next: NextFunction) => {

    console.log("Oops!");
    console.log(error);

    res.status(400).send({
      message: error.message
    });
};