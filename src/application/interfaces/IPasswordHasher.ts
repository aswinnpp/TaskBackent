export interface IPasswordHasher {
  hash(value: string): Promise<string>;
}
