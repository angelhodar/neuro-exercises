export interface PRComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: "user" | "bot" | "system";
  isInitial?: boolean;
}
