import { PrismaClient, CreationType, AttendanceStatus, VisitStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Users module
  { name: 'USER_VIEW', description: 'View user listings and profiles', module: 'Users' },
  { name: 'USER_CREATE', description: 'Provision system-generated or invited users', module: 'Users' },
  { name: 'USER_UPDATE', description: 'Edit user details, roles, and status', module: 'Users' },
  { name: 'USER_DELETE', description: 'Deactivate or delete users', module: 'Users' },

  // Roles module
  { name: 'ROLE_VIEW', description: 'View roles and role details', module: 'Roles' },
  { name: 'ROLE_CREATE', description: 'Create new custom roles', module: 'Roles' },
  { name: 'ROLE_UPDATE', description: 'Update role definitions and permissions', module: 'Roles' },
  { name: 'ROLE_DELETE', description: 'Delete custom roles', module: 'Roles' },

  // Permissions module
  { name: 'PERMISSION_VIEW', description: 'View permission matrix', module: 'Permissions' },
  { name: 'PERMISSION_ASSIGN', description: 'Assign permissions to roles', module: 'Permissions' },

  // Attendance module
  { name: 'ATTENDANCE_VIEW', description: 'View attendance history and team logs', module: 'Attendance' },
  { name: 'ATTENDANCE_CREATE', description: 'Clock in, clock out, and record attendance', module: 'Attendance' },
  { name: 'ATTENDANCE_UPDATE', description: 'Modify and reconcile attendance records', module: 'Attendance' },

  // Visits module
  { name: 'VISIT_VIEW', description: 'View field visit schedules and records', module: 'Visits' },
  { name: 'VISIT_CREATE', description: 'Schedule and dispatch field visits', module: 'Visits' },
  { name: 'VISIT_UPDATE', description: 'Update visit progress, status, and completion notes', module: 'Visits' },
  { name: 'VISIT_DELETE', description: 'Cancel or delete field visits', module: 'Visits' },

  // Dashboard module
  { name: 'DASHBOARD_VIEW', description: 'Access dashboard analytics and performance metrics', module: 'Dashboard' },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Permissions
  console.log('Upserting permissions...');
  const permissionMap = new Map<string, string>();
  for (const perm of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, module: perm.module },
      create: perm,
    });
    permissionMap.set(record.name, record.id);
  }

  // 2. Seed Default Roles
  console.log('Upserting default roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: { description: 'Full system administrator with uninhibited access' },
    create: {
      name: 'SUPERADMIN',
      description: 'Full system administrator with uninhibited access',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: { description: 'Field operations manager overseeing teams, visits, and attendance' },
    create: {
      name: 'MANAGER',
      description: 'Field operations manager overseeing teams, visits, and attendance',
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'FIELD_EMPLOYEE' },
    update: { description: 'Field employee conducting on-site visits and managing personal attendance' },
    create: {
      name: 'FIELD_EMPLOYEE',
      description: 'Field employee conducting on-site visits and managing personal attendance',
    },
  });

  // 3. Assign Permissions to Roles
  console.log('Assigning permissions to roles...');

  // SuperAdmin gets ALL permissions
  for (const perm of PERMISSIONS) {
    const permId = permissionMap.get(perm.name)!;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permId,
      },
    });
  }

  // Manager permissions
  const managerPermNames = [
    'USER_VIEW',
    'ROLE_VIEW',
    'ATTENDANCE_VIEW',
    'ATTENDANCE_CREATE',
    'VISIT_VIEW',
    'VISIT_CREATE',
    'VISIT_UPDATE',
    'DASHBOARD_VIEW',
  ];
  for (const name of managerPermNames) {
    const permId = permissionMap.get(name)!;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permId,
      },
    });
  }

  // Field Employee permissions
  const employeePermNames = [
    'ATTENDANCE_VIEW',
    'ATTENDANCE_CREATE',
    'VISIT_VIEW',
    'VISIT_UPDATE',
    'DASHBOARD_VIEW',
  ];
  for (const name of employeePermNames) {
    const permId = permissionMap.get(name)!;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: employeeRole.id,
          permissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: employeeRole.id,
        permissionId: permId,
      },
    });
  }

  // 4. Seed SuperAdmin User
  console.log('Upserting SuperAdmin user...');
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'admin@fieldops.local';
  const superAdminPasswordRaw = process.env.SUPERADMIN_PASSWORD || 'AdminPassword@123!';
  const superAdminHashedPassword = await bcrypt.hash(superAdminPasswordRaw, 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      roleId: superAdminRole.id,
      isActive: true,
      name: process.env.SUPERADMIN_NAME || 'Super Administrator',
    },
    create: {
      email: superAdminEmail,
      name: process.env.SUPERADMIN_NAME || 'Super Administrator',
      password: superAdminHashedPassword,
      roleId: superAdminRole.id,
      creationType: CreationType.SYSTEM_GENERATED,
      mustChangePassword: false,
      isActive: true,
    },
  });

  // 5. Seed Demonstration Manager & Field Employee
  console.log('Upserting sample users...');
  const managerPasswordHash = await bcrypt.hash('Manager@123!', 10);
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@fieldops.local' },
    update: {},
    create: {
      email: 'manager@fieldops.local',
      name: 'Marcus Vance',
      password: managerPasswordHash,
      roleId: managerRole.id,
      creationType: CreationType.SYSTEM_GENERATED,
      mustChangePassword: false,
      isActive: true,
    },
  });

  const employeePasswordHash = await bcrypt.hash('Employee@123!', 10);
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@fieldops.local' },
    update: {},
    create: {
      email: 'employee@fieldops.local',
      name: 'Elena Rostova',
      password: employeePasswordHash,
      roleId: employeeRole.id,
      creationType: CreationType.SYSTEM_GENERATED,
      mustChangePassword: false,
      isActive: true,
    },
  });

  // 6. Seed Sample Attendance
  console.log('Upserting sample attendance...');
  const today = new Date();
  const nineAm = new Date(today);
  nineAm.setHours(9, 0, 0, 0);

  const fivePm = new Date(today);
  fivePm.setHours(17, 30, 0, 0);

  await prisma.attendance.createMany({
    data: [
      {
        userId: employeeUser.id,
        checkIn: nineAm,
        checkOut: fivePm,
        status: AttendanceStatus.PRESENT,
        notes: 'Regular on-time shift completed',
      },
      {
        userId: managerUser.id,
        checkIn: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 9 * 3600 * 1000),
        checkOut: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 17 * 3600 * 1000),
        status: AttendanceStatus.PRESENT,
        notes: 'Full day management shift',
      },
    ],
    skipDuplicates: true,
  });

  // 7. Seed Sample Field Visits
  console.log('Upserting sample visits...');
  await prisma.visit.createMany({
    data: [
      {
        assignedTo: employeeUser.id,
        customerName: 'Apex Logistics Hub',
        location: '450 Industrial Parkway, Sector 4',
        date: new Date(today.getTime() + 2 * 3600 * 1000),
        purpose: 'HVAC Sensor Inspection & Routine Telemetry Calibration',
        status: VisitStatus.IN_PROGRESS,
        notes: 'Technician on site with client operations lead.',
      },
      {
        assignedTo: employeeUser.id,
        customerName: 'Metro BioTech Labs',
        location: '78 Research Blvd, Suite 200',
        date: new Date(today.getTime() + 28 * 3600 * 1000),
        purpose: 'Backup Power Distribution Maintenance',
        status: VisitStatus.PLANNED,
        notes: 'Requires visitor security badge upon arrival at gate 2.',
      },
      {
        assignedTo: employeeUser.id,
        customerName: 'Pinnacle Retail Plaza',
        location: '1200 Commercial Way',
        date: new Date(today.getTime() - 48 * 3600 * 1000),
        purpose: 'Emergency Circuit Diagnostic',
        status: VisitStatus.COMPLETED,
        notes: 'Capacitor bank replaced. Voltage normalized and signed off.',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Default Credentials:');
  console.log(`SuperAdmin:     ${superAdminEmail} / ${superAdminPasswordRaw}`);
  console.log('Manager:        manager@fieldops.local / Manager@123!');
  console.log('Field Employee: employee@fieldops.local / Employee@123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
