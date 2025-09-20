import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingClient = await prisma.client.findUnique({
      where: { email: email },
    });

    if (existingClient) {
      return NextResponse.json({ message: "A client with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Note: The apiKey is temporary. We will generate a real one on the dashboard.
    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
        apiKey: `temp_key_${Date.now()}`
      },
    });

    return NextResponse.json(newClient, { status: 201 });

  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}