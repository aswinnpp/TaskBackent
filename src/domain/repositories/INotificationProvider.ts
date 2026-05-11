export interface INotificationProvider {
  // Reserved for future push sending.
  // Keeping as a port so application layer can depend on abstraction.
  isExpoToken(token: string): boolean;
}

