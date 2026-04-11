import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, orderNumber } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject}, ${message})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
