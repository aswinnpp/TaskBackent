import { PushToken, DeviceType } from "../entities/PushToken";

export interface INotificationRepository {
  findByToken(token: string): Promise<PushToken | null>;
  upsertToken(input: {
    userId: string | null;
    pushToken: string;
    deviceType: DeviceType;
  }): Promise<{ saved: boolean; token: PushToken }>;
}

