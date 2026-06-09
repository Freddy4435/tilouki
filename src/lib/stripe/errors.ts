export class StripeCheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "StripeCheckoutError";
  }
}
