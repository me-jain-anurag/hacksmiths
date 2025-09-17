import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'client') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ message: "Password is required for verification." }, { status: 400 });
    }

    // 1. Find the client in the database
    const client = await prisma.client.findUnique({
      where: { email: session.user?.email! },
    });

    if (!client || !client.password) {
        return new NextResponse("Client not found.", { status: 404 });
    }

    // 2. Securely compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, client.password);

    if (!isPasswordValid) {
        return NextResponse.json({ message: "Invalid password." }, { status: 403 }); // 403 Forbidden
    }

    // 3. If password is valid, proceed with deletion
    await prisma.client.update({
      where: { email: session.user?.email! },
      data: { apiKey: null },
    });

    return new NextResponse("API Key deleted successfully", { status: 200 });

  } catch (error) {
    console.error("API Key Deletion Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}