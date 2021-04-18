import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Database connection error';

  constructor() {
    super('Database connection error');

    // When extending a built-in class, muck with the prototype.
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)

  }

  serializeErrors() {
    return [
      { message: this.reason }
    ];
  }
}