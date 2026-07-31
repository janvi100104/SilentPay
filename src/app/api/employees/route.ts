import { NextRequest, NextResponse } from 'next/server';
import { EmployeeService } from '@/services/employee-service';
import { createEmployeeSchema } from '@/types/employee';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const employees = await EmployeeService.getByCompanyId(companyId);
    
    // Filter by status if provided
    const filtered = status && status !== 'all'
      ? employees.filter((emp) => emp.status === status)
      : employees;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    const employee = await EmployeeService.create({
      companyId: validatedData.companyId,
      fullName: validatedData.fullName,
      walletAddress: validatedData.walletAddress,
      email: validatedData.email || undefined,
      designation: validatedData.designation || undefined,
      department: validatedData.department || undefined,
      joinedAt: validatedData.joinedAt ? new Date(validatedData.joinedAt) : undefined,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Wallet address already registered') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
