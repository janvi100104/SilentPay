import { NextRequest, NextResponse } from 'next/server';
import { PayrollService } from '@/services/payroll-service';
import { EmployeeService } from '@/services/employee-service';
import { claimPaymentSchema } from '@/types/claim';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const status = searchParams.get('status');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    // Get employee by wallet address
    const employee = await EmployeeService.getByWalletAddress(walletAddress);
    if (!employee) {
      return NextResponse.json([]);
    }

    // Get payrolls for this employee
    const payrollItems = await PayrollService.getByEmployeeWallet(walletAddress);
    
    // Filter by status if provided
    const filtered = status
      ? payrollItems.filter((item) => item.claimStatus === status)
      : payrollItems;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = claimPaymentSchema.parse(body);

    // 1. Find employee by wallet address
    const employee = await EmployeeService.getByWalletAddress(validatedData.walletAddress);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // 2. Check if payroll exists and is ready
    const payroll = await PayrollService.getById(validatedData.payrollId);
    if (!payroll) {
      return NextResponse.json(
        { error: 'Payroll not found' },
        { status: 404 }
      );
    }

    if (payroll.status !== 'READY') {
      return NextResponse.json(
        { error: 'Payroll is not ready for claims' },
        { status: 400 }
      );
    }

    // 3. Check if employee is part of this payroll
    const payrollItem = payroll.items?.find(
      (item) => item.employeeId === employee.id
    );

    if (!payrollItem) {
      return NextResponse.json(
        { error: 'You are not part of this payroll' },
        { status: 403 }
      );
    }

    // 4. Check for double claim
    if (payrollItem.claimStatus === 'CLAIMED') {
      return NextResponse.json(
        { error: 'You have already claimed this payment' },
        { status: 409 }
      );
    }

    // 5. Try to execute on-chain claim if contract is deployed
    let midnightReference: string | null = null;
    let proofVerified = false;
    let onChainError: string | null = null;

    if (payroll.contractAddress) {
      try {
        const { createWalletContext, connectToPayrollContract } = await import('@/services/midnight-service');
        const walletCtx = await createWalletContext();

        // Load employee allocation from DB and convert dollars to bigint cents
        // so the contract witness getAllocation() returns the real amount
        const allocationDollars = Number(payrollItem.amount ?? 0);
        const allocationCents = BigInt(Math.round(allocationDollars * 100));
        const allocations = { [employee.walletAddress]: allocationCents };

        const { contract } = await connectToPayrollContract(
          walletCtx,
          payroll.contractAddress,
          allocations,
        );

        // Call claimPayment circuit on-chain
        const txResult = await contract.callTx.claimPayment(employee.walletAddress);
        midnightReference = txResult?.txHash ?? `tx-${Date.now()}`;
        proofVerified = true;
      } catch (err) {
        console.error('Midnight claim failed:', err);
        onChainError = err instanceof Error ? err.message : 'On-chain claim failed';
        // Still record the claim in DB, but without proof
      }
    }

    // 6. Record the claim in database
    const updatedItem = await PayrollService.recordClaim(
      validatedData.payrollId,
      employee.id,
      midnightReference ?? undefined,
      proofVerified,
    );

    return NextResponse.json({
      success: true,
      message: midnightReference 
        ? 'Payment claimed and verified on Midnight'
        : 'Payment claimed (on-chain verification pending)',
      claim: {
        id: updatedItem.id,
        claimedAt: updatedItem.claimedAt,
        proofVerified,
        midnightReference,
      },
      ...(onChainError && { warning: onChainError }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing claim:', error);
    return NextResponse.json(
      { error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}
