import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

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
        where: { ownerWallet: walletAddress },
        select: { id: true, name: true, slug: true, ownerWallet: true },
      });
      if (!company) {
        return NextResponse.json({ error: 'Company not found for this wallet' }, { status: 404 });
      }
      return NextResponse.json(company);
    }

    // Return the first company (demo mode)
    const company = await prisma.company.findFirst({
      select: { id: true, name: true, slug: true, ownerWallet: true },
    });
    if (!company) {
      return NextResponse.json({ error: 'No companies found. Run seed script first.' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}
