export class ApplicationError extends Error {
  constructor(key: string) {
    super(`Required environment variable '${key}' expected!`);
  }
}
