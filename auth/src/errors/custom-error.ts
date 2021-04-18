// We use a TS AC rather than an interface since a TS interface does not
// exist at run time. Since an AC does, we can use instanceof to see if we
// inherit the AC.
export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message); 
    // When extending a built-in class, muck with the prototype.
    Object.setPrototypeOf(this, CustomError.prototype)
  }

  abstract serializeErrors(): { message: string, field?: string }[];
}

