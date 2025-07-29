export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: React.ReactNode;
  createdAt?: Date;
}
