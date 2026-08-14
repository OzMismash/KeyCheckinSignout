import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { ApiResponse } from "@/lib/types";

interface PropertyDetails {
  id: string;
  address: string;
  description?: string;
  keys: any[];
  recentActivity: any[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storage = getStorage();
    const property = storage.getProperty(id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const keys = storage.getKeysByProperty(id);
    const activities = storage.getActivitiesByProperty(id, 10);

    const details: PropertyDetails = {
      id: property.id,
      address: property.address,
      description: property.description,
      keys,
      recentActivity: activities,
    };

    return NextResponse.json(
      {
        success: true,
        data: details,
      } as ApiResponse<PropertyDetails>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Property details GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
