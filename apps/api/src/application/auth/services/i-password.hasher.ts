export abstract class IPasswordHasher {
  abstract hash(password: string): Promise<string>;
  abstract verify(hashed: string, password: string): Promise<boolean>;
}
