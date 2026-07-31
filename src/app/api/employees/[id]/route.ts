import { NextRequest, NextResponse } from 'next/server';
import { EmployeeService } from '@/services/employee-service';
import { updateEmployeeSchema } from '@/types/employee';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await EmployeeService.getById(id);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEmployeeSchema.parse(body);

    // Clean up empty strings to undefined
    const cleanData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === '' ? undefined : value,
      ])
    );

    const employee = await EmployeeService.update(id, cleanData);
    return NextResponse.json(employee);
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

    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await EmployeeService.archive(id);
    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error('Error archiving employee:', error);
    return NextResponse.json(
      { error: 'Failed to archive employee' },
      { status: 500 }
    );
  }
}
