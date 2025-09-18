import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "lib/prisma";
import { generateApiKey } from "lib/authenticateClient";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'client') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const newApiKey = generateApiKey();

    const hashedApiKey = await bcrypt.hash(newApiKey, 12);

    await prisma.client.update({
      where: { email: session.user?.email! },
      data: { apiKey: hashedApiKey },
    });

    return NextResponse.json({ apiKey: newApiKey });

  } catch (error) {
    console.error("API Key Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}