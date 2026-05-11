import { ExpoPushToken } from "../valueObjects/ExpoPushToken";

export type DeviceType = "android" | "ios" | "unknown";

export class PushToken {
  constructor(
    public readonly id: string | null,
    public readonly userId: string | null,
    public readonly pushToken: ExpoPushToken,
    public readonly deviceType: DeviceType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

