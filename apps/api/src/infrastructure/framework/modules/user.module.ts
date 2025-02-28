import { Module } from '@nestjs/common';
import { RoleRepository } from '../../persistence/user/role/role.repository';
import { IRoleRepository } from '../../../domain/repositories/user/i-role.repository';
import { CachedRoleRepository } from '../../persistence/user/role/role.cached-repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { registerImplementation } from '../utils/register-implementation';
import { IUserRepository } from '../../../domain/repositories/user/i-user.repository';
import { UserRepository } from '../../persistence/user/user.repository';

@Module({
  providers: [
    RoleRepository,
    {
      provide: IRoleRepository,
      useFactory: (cache: Cache, decorated: RoleRepository) => new CachedRoleRepository(cache, decorated),
      inject: [CACHE_MANAGER, RoleRepository],
    },
    registerImplementation(IUserRepository, UserRepository),
  ],
  exports: [IUserRepository, IRoleRepository],
})
export class UserModule {}
