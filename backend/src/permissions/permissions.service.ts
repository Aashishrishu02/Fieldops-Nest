import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    });

    // Group by module
    const grouped: Record<string, typeof permissions> = {};
    for (const perm of permissions) {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    }

    return {
      all: permissions,
      grouped,
      modules: Object.keys(grouped),
      totalCount: permissions.length,
    };
  }
}
