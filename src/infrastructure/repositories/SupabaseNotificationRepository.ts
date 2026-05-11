import { injectable } from "inversify";
import { supabaseAdminClient } from "../database/supabaseAdminClient";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { PushToken, DeviceType } from "../../domain/entities/PushToken";
import { ExpoPushToken } from "../../domain/valueObjects/ExpoPushToken";

type PushTokenRow = {
  id: string;
  userId: string | null;
  pushToken: string;
  deviceType: DeviceType;
  createdAt: string;
  updatedAt: string;
};

@injectable()
export class SupabaseNotificationRepository implements INotificationRepository {
  private readonly table = "push_tokens";

  async findByToken(token: string): Promise<PushToken | null> {
    const { data, error } = await supabaseAdminClient
      .from(this.table)
      .select("*")
      .eq("pushToken", token)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.toEntity(data as unknown as PushTokenRow);
  }

  async upsertToken(input: {
    userId: string | null;
    pushToken: string;
    deviceType: DeviceType;
  }): Promise<{ saved: boolean; token: PushToken }> {
    const now = new Date().toISOString();

    // Upsert by unique pushToken. (Ensure DB has a unique index on pushToken.)
    const { data, error } = await supabaseAdminClient
      .from(this.table)
      .upsert(
        {
          userId: input.userId,
          pushToken: input.pushToken,
          deviceType: input.deviceType,
          updatedAt: now,
        },
        { onConflict: "pushToken" }
      )
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    const token = this.toEntity(data as unknown as PushTokenRow);
    return { saved: true, token };
  }

  private toEntity(row: PushTokenRow): PushToken {
    return new PushToken(
      row.id,
      row.userId,
      new ExpoPushToken(row.pushToken),
      row.deviceType,
      new Date(row.createdAt),
      new Date(row.updatedAt)
    );
  }
}

