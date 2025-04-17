export type TEMailSend = {
  to: string;
  html?: string;
  subject: string;
  text: string;
};

export type TmailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
};
