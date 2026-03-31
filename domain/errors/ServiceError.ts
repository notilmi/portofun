export class ServiceError extends Error {
  public errorCode: string;
  public errorStatus: number;
  constructor(message: string, errorCode?: string, errorStatus?: number) {
    super(message);
    this.name = "ServiceError";
    this.errorCode = errorCode ?? "SERVICE_ERROR";
    this.errorStatus = errorStatus ?? 500;
  }
}
