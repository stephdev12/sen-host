import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const password = request.headers.get('x-admin-password');
  if (password !== 'stephadmin123@') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
      const users = await prisma.user.findMany({
          where: {
              OR: [
                  { email: { contains: query } },
                  { username: { contains: query } }
              ]
          },
          include: { bots: true },
          orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(users);
  } catch (e) {
      return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    const password = request.headers.get('x-admin-password');
    if (password !== 'stephadmin123@') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        
        // Delete all bots associated with the user first (Prisma should handle if cascade is set, but better be safe)
        // If bots have processes running, they might stay running if not stopped properly.
        // For simplicity here, we just delete from DB.
        
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }
}
