import { Inject, Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../../../domain/repositories/user/i-role.repository';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Role } from '../../../../domain/entities/user/role/role';
import { UUID } from 'node:crypto';
import { UserRoles } from '../../../../domain/entities/user/user-roles';

@Injectable()
export class CachedRoleRepository implements IRoleRepository {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly decorated: IRoleRepository,
  ) {}

  async getById(id: UUID, tx?: any): Promise<Role | null> {
    const key = this.getByIdKey(id);
    const cachedValue = await this.cache.get(key);
    if (cachedValue) {
      return cachedValue as Role;
    }
    const toCache = await this.decorated.getById(id, tx);
    await this.cache.set(key, toCache, 3600);
    return toCache;
  }

  async getByName(name: UserRoles, tx?: any): Promise<Role | null> {
    const key = this.getByNameKey(name);
    const cachedValue = await this.cache.get(key);
    if (cachedValue) {
      return cachedValue as Role;
    }
    const toCache = await this.decorated.getByName(name, tx);
    await this.cache.set(key, toCache, 3600);
    return toCache;
  }

  async save(role: Role, tx?: any): Promise<void> {
    await this.decorated.save(role, tx);
  }

  async update(role: Role, tx?: any): Promise<void> {
    const result = await this.decorated.update(role, tx);
    const idKey = this.getByIdKey(role.id);
    const idUpdate = { key: idKey, value: role, ttl: 3600 };
    const nameKey = this.getByNameKey(role.name);
    const nameUpdate = { key: nameKey, value: role, ttl: 3600 };

    await this.cache.mset([idUpdate, nameUpdate]);

    return result;
  }

  private getByIdKey(id: UUID): string {
    return `roleGetById:${id}`;
  }

  private getByNameKey(name: UserRoles): string {
    return `roleGetByName:${name}`;
  }
}
