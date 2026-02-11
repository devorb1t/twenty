export class CalDavHttpException extends Error {
  public readonly status: number;

  constructor(status: number, statusText: string) {
    super(`CalDAV HTTP error ${status}: ${statusText}`);
    this.name = 'CalDavHttpException';
    this.status = status;
  }
}
