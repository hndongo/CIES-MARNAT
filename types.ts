export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string; // base64 data URL for display
}
