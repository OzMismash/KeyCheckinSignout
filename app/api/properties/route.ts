import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { ApiResponse, Property } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    const storage = getStorage();
    let properties: Property[];

    if (query) {
      properties = storage.searchProperties(query);
    } else {
      properties = storage.getAllProperties();
    }

    return NextResponse.json(
      {
        success: true,
        data: properties,
      } as ApiResponse<Property[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Properties GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, description } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address is required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const storage = getStorage();
    const property = storage.createProperty({ address, description });

    return NextResponse.json(
      {
        success: true,
        data: property,
        message: "Property created",
      } as ApiResponse<Property>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Properties POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
