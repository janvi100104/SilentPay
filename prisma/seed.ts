/**
 * Seed the SilentPay database with demo data.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * Creates:
 *   - 1 company (SilentPay Demo)
 *   - 5 employees with wallet addresses
 *   - 1 draft payroll
 *   - 1 completed payroll with items
 */
import { PrismaClient, PayrollStatus, EmployeeStatus } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_COMPANY = {
  name: 'SilentPay Demo Corp',
  slug: 'silentpay-demo',
  ownerWallet: 'mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s',
};

const DEMO_EMPLOYEES = [
  {
    fullName: 'Alice Johnson',
    walletAddress: 'mn_addr_undeployed1alice000000000000000000000000000000000000000000000',
    email: 'alice@silentpay.demo',
    designation: 'Senior Engineer',
    department: 'Engineering',
  },
  {
    fullName: 'Bob Smith',
    walletAddress: 'mn_addr_undeployed1bob00000000000000000000000000000000000000000000000',
    email: 'bob@silentpay.demo',
    designation: 'Product Manager',
    department: 'Product',
  },
  {
    fullName: 'Carol Davis',
    walletAddress: 'mn_addr_undeployed1carol00000000000000000000000000000000000000000000',
    email: 'carol@silentpay.demo',
    designation: 'Designer',
    department: 'Design',
  },
  {
    fullName: 'David Lee',
    walletAddress: 'mn_addr_undeployed1david00000000000000000000000000000000000000000000',
    email: 'david@silentpay.demo',
    designation: 'DevOps Engineer',
    department: 'Engineering',
  },
  {
    fullName: 'Eva Martinez',
    walletAddress: 'mn_addr_undeployed1eva00000000000000000000000000000000000000000000000',
    email: 'eva@silentpay.demo',
    designation: 'QA Engineer',
    department: 'Engineering',
  },
];

async function main() {
  console.log('🌱 Seeding SilentPay database...\n');

  // 1. Create company
  const company = await prisma.company.upsert({
    where: { slug: DEMO_COMPANY.slug },
    update: {},
    create: DEMO_COMPANY,
  });
  console.log(`  ✅ Company: ${company.name} (${company.id})`);

  // 2. Create employees
  const employees = [];
  for (const emp of DEMO_EMPLOYEES) {
    const existing = await prisma.employee.findUnique({
      where: { walletAddress: emp.walletAddress },
    });

    if (existing) {
      employees.push(existing);
      console.log(`  ⏭ Employee already exists: ${emp.fullName}`);
    } else {
      const created = await prisma.employee.create({
        data: {
          ...emp,
          companyId: company.id,
          status: EmployeeStatus.ACTIVE,
        },
      });
      employees.push(created);
      console.log(`  ✅ Employee: ${emp.fullName} (${created.id})`);
    }
  }

  // 3. Create a draft payroll
  const draftPayroll = await prisma.payroll.create({
    data: {
      companyId: company.id,
      title: 'July 2026 Payroll (Draft)',
      payrollMonth: new Date('2026-07-01'),
      createdBy: DEMO_COMPANY.ownerWallet,
      employeeCount: employees.length,
      status: PayrollStatus.DRAFT,
    },
  });
  console.log(`  ✅ Draft payroll: ${draftPayroll.title} (${draftPayroll.id})`);

  // 4. Create a completed payroll with items
  const completedPayroll = await prisma.payroll.create({
    data: {
      companyId: company.id,
      title: 'June 2026 Payroll (Completed)',
      payrollMonth: new Date('2026-06-01'),
      createdBy: DEMO_COMPANY.ownerWallet,
      employeeCount: employees.length,
      claimedCount: employees.length,
      status: PayrollStatus.COMPLETED,
    },
  });

  for (const emp of employees) {
    await prisma.payrollItem.create({
      data: {
        payrollId: completedPayroll.id,
        employeeId: emp.id,
        claimStatus: 'CLAIMED',
        claimedAt: new Date(),
      },
    });
  }
  console.log(`  ✅ Completed payroll: ${completedPayroll.title} (${completedPayroll.id})`);

  // 5. Create audit logs
  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      action: 'PAYROLL_CREATED',
      entity: 'payroll',
      entityId: completedPayroll.id,
      actorWallet: DEMO_COMPANY.ownerWallet,
      metadata: JSON.stringify({ title: completedPayroll.title }),
    },
  });

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Company:  ${company.id}`);
  console.log(`   Employees: ${employees.length}`);
  console.log(`   Payrolls:  2 (1 draft, 1 completed)\n`);
}

main()
  .catch(async (err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
