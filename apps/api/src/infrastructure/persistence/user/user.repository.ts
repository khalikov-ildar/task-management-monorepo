import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user/user';
import { IUserRepository } from '../../../domain/repositories/user/i-user.repository';
import { UUID } from 'crypto';
import { PrismaService } from '../../common/persistence/prisma.service';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMultipleByIds(ids: UUID[], tx?: any): Promise<User[]> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormUsers = await prismaTx.user.findMany({ where: { id: { in: ids } }, include: { role: true } });

    return ormUsers.map(UserMapper.toDomainWithRole);
  }

  async getById(id: UUID, tx?: any): Promise<User | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const result = await prismaTx.user.findUnique({ where: { id }, include: { role: true } });

    if (!result) {
      return null;
    }

    return UserMapper.toDomainWithRole(result);
  }

  async getByEmail(email: string, tx?: any): Promise<User | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const result = await prismaTx.user.findUnique({ where: { email }, include: { role: true } });

    if (!result) {
      return null;
    }

    return UserMapper.toDomainWithRole(result);
  }

  async save(user: User, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormUser = UserMapper.toOrm(user);
    await prismaTx.user.create({ data: ormUser });
  }

  async update(user: User, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormUser = UserMapper.toOrm(user);
    await prismaTx.user.update({ data: ormUser, where: { id: user.id } });
  }

  async changePasswordById(userId: UUID, newPassword: string, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.user.update({ data: { password: newPassword }, where: { id: userId } });
  }

  async changeEmailConfirmationByEmail(email: string, isEmailConfirmed: boolean, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.user.update({ data: { isEmailConfirmed }, where: { email } });
  }

  async delete(user: User, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.user.delete({ where: { id: user.id } });
  }
}
