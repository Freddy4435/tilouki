export interface ProviderSendInput {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

export interface ProviderSendResult {
  id: string;
}

export interface EmailProviderAdapter {
  send(input: ProviderSendInput): Promise<ProviderSendResult>;
}
