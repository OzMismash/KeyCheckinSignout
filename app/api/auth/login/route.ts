import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { ApiResponse, User } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, role, name, email, company } = body || {};

    if (!phone || !role) {
      return NextResponse.json(
        { success: false, error: "Phone and role are required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (role !== "staff" && role !== "visitor") {
      return NextResponse.json(
        { success: false, error: "Invalid role" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const storage = getStorage();
    // Try to find existing user by phone
    let user = storage.findUserByPhone(phone);

    if (!user) {
      // Create a simple user record if none exists
      const newUser: Omit<User, "id"> = {
        name: name || (role === "staff" ? `Staff ${phone}` : `Visitor ${phone}`),
        phone,
        email: email || undefined,
        company: company || undefined,
        role,
      };

      user = storage.createUser(newUser);
      return NextResponse.json(
        { success: true, data: user, message: "User created" } as ApiResponse<User>,
        { status: 201 }
      );
    }

    // If user exists, ensure role is up-to-date
    if (user.role !== role) {
      // update via storage.update is not present for users, so create a new user record is not ideal
      // For now, return existing user but include a message
    }

    return NextResponse.json(
      { success: true, data: user } as ApiResponse<User>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
