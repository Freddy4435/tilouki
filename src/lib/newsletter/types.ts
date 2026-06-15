export type NewsletterSubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  consentAt: string;
  source: string;
  status: NewsletterSubscriberStatus;
  confirmedAt: string | null;
  createdAt: string;
}

export type NewsletterSubscribeResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type NewsletterConfirmResult =
  | { ok: true; message: string }
  | { ok: false; error: string };
