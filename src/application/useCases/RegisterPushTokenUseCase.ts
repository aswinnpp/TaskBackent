import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { AppError } from "../services/AppError";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { INotificationProvider } from "../../domain/repositories/INotificationProvider";
import { ExpoPushToken } from "../../domain/valueObjects/ExpoPushToken";
import { DeviceType } from "../../domain/entities/PushToken";
import { notificationLog } from "../../shared/logging/notificationLog";

@injectable()
export class RegisterPushTokenUseCase {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly notificationRepository: INotificationRepository,
    @inject(TYPES.NotificationProvider)
    private readonly notificationProvider: INotificationProvider
  ) {}

  async execute(input: {
    pushToken: string;
    deviceType?: DeviceType;
    userId?: string | null;
  }): Promise<{ exists: boolean }> {
    notificationLog("REGISTER TOKEN START", "INFO", {
      hasUser: Boolean(input.userId),
      deviceType: input.deviceType || "unknown",
      at: new Date().toISOString(),
    });

    const token = new ExpoPushToken(input.pushToken).getValue();
    if (!this.notificationProvider.isExpoToken(token)) {
      throw new AppError("Invalid Expo push token format", 400);
    }

    const deviceType: DeviceType =
      input.deviceType === "android" || input.deviceType === "ios" ? input.deviceType : "unknown";

    const existing = await this.notificationRepository.findByToken(token);
    if (existing) {
      notificationLog("TOKEN EXISTS", "INFO", {
        tokenId: existing.id,
        hasUser: Boolean(existing.userId),
        at: new Date().toISOString(),
      });
      return { exists: true };
    }

    try {
      await this.notificationRepository.upsertToken({
        userId: input.userId ?? null,
        pushToken: token,
        deviceType,
      });
      notificationLog("TOKEN SAVED", "INFO", { at: new Date().toISOString() });
      return { exists: false };
    } catch (err) {
      notificationLog("REGISTER TOKEN FAILED", "ERROR", {
        error: (err as Error)?.message || String(err),
        at: new Date().toISOString(),
      });
      throw err;
    }
  }
}

