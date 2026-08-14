"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Spinner,
  Chip,
  Link,
} from "@heroui/react";
import { Property, Key } from "@/lib/types";

interface PropertyWithKeys extends Property {
  keys: Key[];
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyWithKeys[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load properties function
  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/properties");
      const result = await response.json();

      if (result.success) {
        // Enrich with key data
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

  // Auth and data loading
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

  const filteredProperties = properties.filter((p) =>
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getKeyStatus = (key: Key) => {
    if (key.status === "available") {
      return <Chip color="success" variant="soft">Available</Chip>;
    } else if (key.status === "checked_out") {
      return <Chip color="warning" variant="soft">Checked Out</Chip>;
    } else {
      return <Chip color="danger" variant="soft">Overdue</Chip>;
    }
  };

  // Check if user is authenticated (client-side only)
  if (typeof window !== "undefined" && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Key Tracker</h1>
            {user && (
              <p className="text-sm text-gray-500">Welcome, {user.name}</p>
            )}
          </div>
          <Button
            isIconOnly
            variant="ghost"
            onClick={logout}
            className="text-gray-600"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search properties by address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Properties List */}
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
            {filteredProperties.map((property) => {
              const key = property.keys[0]; // Show first key for now
              return (
                <Card key={property.id} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Property Name */}
                    <div className="md:col-span-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Property
                      </p>
                      <p className="font-semibold text-gray-900">
                        {property.address}
                      </p>
                      {property.description && (
                        <p className="text-sm text-gray-500">
                          {property.description}
                        </p>
                      )}
                    </div>

                    {/* Key Status */}
                    <div className="md:col-span-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Key Status
                      </p>
                      {key ? (
                        getKeyStatus(key)
                      ) : (
                        <span className="text-gray-500">No keys</span>
                      )}
                    </div>

                    {/* Current Holder */}
                    <div className="md:col-span-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Current Holder
                      </p>
                      {key?.currentHolder ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {key.currentHolder.name}
                          </p>
                          {key.currentHolder.company && (
                            <p className="text-sm text-gray-500">
                              {key.currentHolder.company}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>

                    {/* Expected Return */}
                    <div className="md:col-span-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Expected Return
                      </p>
                      {key?.expectedReturnAt ? (
                        <span className="text-sm">
                          {new Date(key.expectedReturnAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex items-center justify-end">
                      <Link
                        href={`/properties/${property.id}`}
                        className="text-blue-600 font-medium hover:text-blue-700"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
