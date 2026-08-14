import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { ApiResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId, propertyId, checkedInBy, notes } = body;

    if (!keyId || !propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "keyId and propertyId are required",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const storage = getStorage();

    // Verify key exists and is checked out
    const key = storage.getKey(keyId);
    if (!key) {
      return NextResponse.json(
        { success: false, error: "Key not found" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    if (key.status === "available") {
      return NextResponse.json(
        {
          success: false,
          error: "Key is already available, cannot check in",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create checkin event
    const event = storage.createCheckinEvent({
      keyId,
      propertyId,
      checkedInAt: new Date(),
      checkedInBy,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: "Key checked in successfully",
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
