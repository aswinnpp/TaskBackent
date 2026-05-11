import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { injectable } from "inversify";
import { ISecretCipher } from "../../application/interfaces/ISecretCipher";
import { env } from "../config/env";

@injectable()
export class AesSecretCipher implements ISecretCipher {
  private readonly key: Buffer;

  constructor() {
    if (!env.pendingSecretKey) {
      throw new Error("Missing PENDING_SIGNUP_SECRET in .env");
    }
    this.key = createHash("sha256").update(env.pendingSecretKey).digest();
  }

  encrypt(value: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  decrypt(value: string): string {
    const [ivHex, authTagHex, encryptedHex] = value.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  }
}
