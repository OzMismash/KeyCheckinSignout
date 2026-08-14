import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { ApiResponse, Key } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      keyId,
      propertyId,
      holder,
      expectedReturnAt,
      reason,
      signature,
      checkedOutBy,
    } = body;

    if (!keyId || !propertyId || !holder) {
      return NextResponse.json(
        {
          success: false,
          error: "keyId, propertyId, and holder are required",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const storage = getStorage();

    // Verify key exists and is available
    const key = storage.getKey(keyId);
    if (!key) {
      return NextResponse.json(
        { success: false, error: "Key not found" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    if (key.status !== "available") {
      return NextResponse.json(
        {
          success: false,
          error: "Key is not available for checkout",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Parse expected return time
    const returnTime = new Date(expectedReturnAt);
    if (isNaN(returnTime.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid expectedReturnAt timestamp",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create checkout event
    const event = storage.createCheckoutEvent({
      keyId,
      propertyId,
      holder,
      checkedOutAt: new Date(),
      expectedReturnAt: returnTime,
      reason: reason || "Not specified",
      signature,
      checkedOutBy,
    });

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: "Key checked out successfully",
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
