export class StripeCheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    /** true si le message peut être renvoyé tel quel au client. */
    readonly expose = false,
  ) {
    super(message);
    this.name = "StripeCheckoutError";
  }
}
