import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check Admin Auth (Simple header check as per existing patterns)
    // Note: ideally this should share the auth logic, but adhering to the pattern in steph/page.tsx
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword !== 'stephadmin123@') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.globalSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          id: 1,
          maxTotalBots: 100,
          minCoinsToCreate: 10,
          maintenanceMode: false
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword !== 'stephadmin123@') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { maxTotalBots, minCoinsToCreate, maintenanceMode } = body;

    const settings = await prisma.globalSettings.upsert({
      where: { id: 1 },
      update: {
        maxTotalBots: maxTotalBots ? parseInt(maxTotalBots) : undefined,
        minCoinsToCreate: minCoinsToCreate ? parseInt(minCoinsToCreate) : undefined,
        maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : undefined
      },
      create: {
        id: 1,
        maxTotalBots: parseInt(maxTotalBots) || 100,
        minCoinsToCreate: parseInt(minCoinsToCreate) || 10,
        maintenanceMode: maintenanceMode || false
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
