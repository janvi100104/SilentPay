import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const createCompanySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  ownerWallet: z.string().min(1),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const walletAddress = searchParams.get('walletAddress');

    if (slug) {
      const company = await prisma.company.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true, ownerWallet: true },
      });
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      return NextResponse.json(company);
    }

    if (walletAddress) {
      const company = await prisma.company.findFirst({
        where: { ownerWallet: { equals: walletAddress.trim(), mode: 'insensitive' } },
        select: { id: true, name: true, slug: true, ownerWallet: true },
      });
      if (!company) {
        return NextResponse.json({ error: 'Company not found for this wallet' }, { status: 404 });
      }
      return NextResponse.json(company);
    }

    return NextResponse.json(
      { error: 'walletAddress parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Check if wallet already owns a company
    const existing = await prisma.company.findFirst({
      where: { ownerWallet: validatedData.ownerWallet },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'This wallet already owns a company', company: existing },
        { status: 409 }
      );
    }

    // Check slug uniqueness
    const slugExists = await prisma.company.findUnique({
      where: { slug: validatedData.slug },
    });
    if (slugExists) {
      return NextResponse.json(
        { error: 'This company URL is already taken' },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        ownerWallet: validatedData.ownerWallet.trim(),
        email: validatedData.email,
        website: validatedData.website,
      },
      select: { id: true, name: true, slug: true, ownerWallet: true },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
