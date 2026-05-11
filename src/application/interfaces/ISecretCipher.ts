export interface ISecretCipher {
  encrypt(value: string): string;
  decrypt(value: string): string;
}
