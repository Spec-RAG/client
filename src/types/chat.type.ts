export type ChatRole = "user" | "assistant";

export type ChatMsg = {
  id: string;
  role: ChatRole;
  text: string;
};

export type ChatListItem = {
  id: string;
  title: string;
  active?: boolean;
};
