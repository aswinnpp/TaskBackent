import { injectable } from "inversify";
import { INotificationProvider } from "../../domain/repositories/INotificationProvider";

@injectable()
export class ExpoNotificationProvider implements INotificationProvider {
  isExpoToken(token: string): boolean {
    return /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9\-_]+\]$/.test(String(token || "").trim());
  }
}

