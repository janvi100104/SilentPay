import { NextRequest, NextResponse } from 'next/server';
import { PayrollService } from '@/services/payroll-service';
import { z } from 'zod';

const createPayrollSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(1).max(120),
  payrollMonth: z.string().datetime(),
  createdBy: z.string().min(1),
  employeeIds: z.array(z.string().uuid()).min(1),
  deployContract: z.boolean().optional().default(false),
  allocations: z.record(z.string(), z.number()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const payrolls = await PayrollService.getByCompanyId(companyId);
    return NextResponse.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payrolls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPayrollSchema.parse(body);

    // Create payroll in database
    const payroll = await PayrollService.create({
      companyId: validatedData.companyId,
      title: validatedData.title,
      payrollMonth: new Date(validatedData.payrollMonth),
      createdBy: validatedData.createdBy,
      employeeIds: validatedData.employeeIds,
    });

    // Optionally deploy Midnight contract for this payroll
    let contractAddress: string | null = null;
    let midnightError: string | null = null;

    if (validatedData.deployContract) {
      try {
        const { createWalletContext, deployPayrollContract } = await import('@/services/midnight-service');
        const { resolveNetwork } = await import('@/midnight/network');
        const network = resolveNetwork().network;
        const walletCtx = await createWalletContext();

        // Convert allocation amounts (in dollars) to bigint cents
        const allocations: Record<string, bigint> = {};
        if (validatedData.allocations) {
          for (const [empId, amount] of Object.entries(validatedData.allocations)) {
            allocations[empId] = BigInt(Math.round(amount * 100));
          }
        }

        const result = await deployPayrollContract(walletCtx, network, allocations);
        contractAddress = result.contractAddress;

        // Update payroll with contract address and transition status
        await PayrollService.updateStatus(payroll.id, 'READY', contractAddress);
      } catch (err) {
        console.error('Midnight contract deployment failed:', err);
        midnightError = err instanceof Error ? err.message : 'Contract deployment failed';
        // Payroll still created in DB, just without on-chain deployment
      }
    }

    return NextResponse.json({
      ...payroll,
      contractAddress,
      midnightError,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating payroll:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll' },
      { status: 500 }
    );
  }
}
