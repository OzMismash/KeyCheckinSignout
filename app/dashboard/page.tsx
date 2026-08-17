"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Spinner } from "@heroui/react";
import { Property, Key } from "@/lib/types";
import { PropertySummaryCard } from "@/components/dashboard/property-summary-card";

interface PropertyWithKeys extends Property {
  keys: Key[];
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyWithKeys[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/properties");
      const result = await response.json();

      if (result.success) {
        const enriched = await Promise.all(
          result.data.map(async (prop: Property) => {
            const detailsResponse = await fetch(`/api/properties/${prop.id}`);
            const detailsResult = await detailsResponse.json();
            return {
              ...prop,
              keys: detailsResult.data?.keys || [],
            };
          })
        );

        setProperties(enriched);
      }
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "staff") {
      router.push("/login");
      return;
    }

    void loadProperties();
  }, [user, router]);

  const filteredProperties = properties.filter((property) =>
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (typeof window !== "undefined" && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Key Tracker</h1>
            {user && <p className="text-sm text-gray-500">Welcome, {user.name}</p>}
          </div>
          <Button isIconOnly variant="ghost" onClick={logout} className="text-gray-600">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search properties by address..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No properties found.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <PropertySummaryCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
