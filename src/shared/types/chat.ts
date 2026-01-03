export type Message = {
  id: string;
  role: "User" | "Assistant";
  content: string;
  status?: "sending" | "error" | "stopped";
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};
