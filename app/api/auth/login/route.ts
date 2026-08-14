import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { ApiResponse, User } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, role = "staff" } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const storage = getStorage();

    // Find or create user
    let user = storage.findUserByPhone(phone);

    if (!user) {
      user = storage.createUser({
        name: phone,
        phone,
        role,
      });
    }

    // In a real app, this would create a session token
    // For now, we'll just return the user data
    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Login successful",
      } as ApiResponse<User>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
