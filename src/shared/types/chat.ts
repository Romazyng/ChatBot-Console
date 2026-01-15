export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "sending" | "error" | "stopped";
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};
