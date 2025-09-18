import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // 1. Ensure the user is an authenticated admin
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const clients = await prisma.client.findMany({
      // Order by creation date, newest first
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        apiKey: true,
      }
    });

    const clientData = clients.map((client: {
      id: string;
      name: string;
      email: string;
      createdAt: Date;
      apiKey?: string;
    }) => ({
      ...client,
      hasApiKey: !!client.apiKey
    }));

    return NextResponse.json(clientData);

  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}