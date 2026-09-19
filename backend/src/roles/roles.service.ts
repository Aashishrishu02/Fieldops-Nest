import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

const SYSTEM_PROTECTED_ROLES = ['SUPERADMIN', 'MANAGER', 'FIELD_EMPLOYEE'];

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userCount: r._count.users,
      permissions: r.permissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        module: rp.permission.module,
      })),
      isProtected: SYSTEM_PROTECTED_ROLES.includes(r.name),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        module: rp.permission.module,
      })),
      isProtected: SYSTEM_PROTECTED_ROLES.includes(role.name),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async create(dto: CreateRoleDto) {
    const cleanName = dto.name.trim().toUpperCase().replace(/\s+/g, '_');
    const existing = await this.prisma.role.findUnique({
      where: { name: cleanName },
    });

    if (existing) {
      throw new ConflictException(`Role with name "${cleanName}" already exists`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: cleanName,
        description: dto.description,
      },
    });

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.assignPermissions(role.id, { permissionIds: dto.permissionIds });
    }

    return this.findOne(role.id);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (dto.name && SYSTEM_PROTECTED_ROLES.includes(role.name) && dto.name !== role.name) {
      throw new ForbiddenException(`System role "${role.name}" cannot be renamed`);
    }

    const dataToUpdate: any = {};
    if (dto.name) {
      const cleanName = dto.name.trim().toUpperCase().replace(/\s+/g, '_');
      if (cleanName !== role.name) {
        const existing = await this.prisma.role.findUnique({ where: { name: cleanName } });
        if (existing) {
          throw new ConflictException(`Role with name "${cleanName}" already exists`);
        }
        dataToUpdate.name = cleanName;
      }
    }

    if (dto.description !== undefined) {
      dataToUpdate.description = dto.description;
    }

    await this.prisma.role.update({
      where: { id },
      data: dataToUpdate,
    });

    if (dto.permissionIds) {
      await this.assignPermissions(id, { permissionIds: dto.permissionIds });
    }

    return this.findOne(id);
  }

  async assignPermissions(roleId: string, dto: AssignPermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Resolve IDs or names
    const permissions = await this.prisma.permission.findMany({
      where: {
        OR: [{ id: { in: dto.permissionIds } }, { name: { in: dto.permissionIds } }],
      },
    });

    // Remove old associations and insert new ones
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId },
      }),
      this.prisma.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      }),
    ]);

    return this.findOne(roleId);
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (SYSTEM_PROTECTED_ROLES.includes(role.name)) {
      throw new ForbiddenException(`System default role "${role.name}" cannot be deleted`);
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}" because it currently has ${role._count.users} user(s) assigned. Reassign users first.`,
      );
    }

    await this.prisma.role.delete({ where: { id } });
    return { message: `Role "${role.name}" deleted successfully` };
  }
}
