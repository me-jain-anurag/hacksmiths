// In app/api/client/me/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'client') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { email: session.user?.email! },
      select: {
        id: true,
        name: true,
        email: true,
        apiKey: true,
      }
    });

    if (!client) {
        return new NextResponse("Client not found", { status: 404 });
    }

    const clientData = {
        ...client,
        hasApiKey: !!client.apiKey
    }

    return NextResponse.json(clientData);

  } catch (error) {
    console.error("Fetch client data error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}