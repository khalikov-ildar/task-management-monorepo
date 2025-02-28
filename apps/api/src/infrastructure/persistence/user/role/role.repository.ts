import { Injectable } from '@nestjs/common';
import { Role } from '../../../../domain/entities/user/role/role';
import { UserRoles } from '../../../../domain/entities/user/user-roles';
import { IRoleRepository } from '../../../../domain/repositories/user/i-role.repository';
import { UUID } from 'node:crypto';
import { PrismaService } from '../../../common/persistence/prisma.service';
import { RoleMapper } from './role.mapper';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: UUID, tx?: any): Promise<Role | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const result = await prismaTx.role.findUnique({ where: { id } });
    if (!result) {
      return null;
    }

    return RoleMapper.toDomain(result);
  }
  async getByName(name: UserRoles, tx?: any): Promise<Role | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const result = await prismaTx.role.findFirst({ where: { name } });
    if (!result) {
      return null;
    }

    return RoleMapper.toDomain(result);
  }
  async save(role: Role, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormRole = RoleMapper.toOrm(role);
    await prismaTx.role.create({ data: ormRole });
  }
  async update(role: Role, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormRole = RoleMapper.toOrm(role);
    await prismaTx.role.update({ data: ormRole, where: { id: role.id } });
  }
}
