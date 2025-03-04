import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user/i-user.repository';
import { IPasswordHasher } from '../../application/auth/services/i-password.hasher';
import { IRoleRepository } from '../../domain/repositories/user/i-role.repository';
import { Role } from '../../domain/entities/user/role/role';
import { ITransactionManager } from '../../application/common/services/i-transaction.manager';
import { ILogger } from '@app/shared';
import { User } from '../../domain/entities/user/user';

type Roles = { member: Role; supervisor: Role; admin: Role };

@Injectable()
export class SeedingService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly logger: ILogger,
  ) {}

  async seedRoles(): Promise<Roles> {
    const memberRole = new Role('Member');
    const supervisorRole = new Role('Supervisor');
    const adminRole = new Role('Admin');

    try {
      await this.transactionManager.execute(async (tx) => {
        await Promise.all([
          this.roleRepository.save(memberRole, tx),
          this.roleRepository.save(supervisorRole, tx),
          this.roleRepository.save(adminRole, tx),
        ]);
      });
    } catch (e) {
      this.logger.logError('An error occurred while trying to save roles', {}, e);
    }

    return { member: memberRole, supervisor: supervisorRole, admin: adminRole };
  }

  async seedUsers(roles: Roles) {
    const members = [];
    const supervisors = [];
    const admins = [];

    for (let i = 0; i < 12; i++) {
      const indexedUser = `user${i}`;
      members.push(new User(`${indexedUser}@user.com`, await this.passwordHasher.hash(indexedUser), indexedUser, roles.member));
    }

    for (let i = 0; i < 5; i++) {
      const indexedSupervisor = `supervisor${i}`;
      supervisors.push(
        new User(
          `${indexedSupervisor}@supervisor.com`,
          await this.passwordHasher.hash(indexedSupervisor),
          indexedSupervisor,
          roles.supervisor,
        ),
      );
    }

    for (let i = 0; i < 3; i++) {
      const indexedAdmin = `admin${i}`;
      admins.push(new User(`${indexedAdmin}@admin.com`, await this.passwordHasher.hash(indexedAdmin), indexedAdmin, roles.admin));
    }

    try {
      await this.transactionManager.execute(async (tx) => {
        const memberPromises = [];
        const supervisorPromises = [];
        const adminPromises = [];

        for (const member of members) {
          memberPromises.push(this.userRepository.save(member, tx));
        }

        for (const supervisor of supervisors) {
          supervisorPromises.push(this.userRepository.save(supervisor, tx));
        }

        for (const admin of admins) {
          adminPromises.push(this.userRepository.save(admin, tx));
        }

        await Promise.all([...memberPromises, ...supervisorPromises, ...adminPromises]);
      });
    } catch (e) {
      this.logger.logError('An error occurred while trying to save users', {}, e);
    }
  }
}
