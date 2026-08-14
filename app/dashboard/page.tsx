"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "staff") {
      router.push("/login");
      return;
    }

    loadProperties();
  }, [user, router]);

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

  const filteredProperties = properties.filter((p) =>
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getKeyStatus = (key: Key) => {
    if (key.status === "available") {
      return <Chip color="success" variant="flat">Available</Chip>;
    } else if (key.status === "checked_out") {
      return <Chip color="warning" variant="flat">Checked Out</Chip>;
    } else {
      return <Chip color="danger" variant="flat">Overdue</Chip>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Key Tracker</h1>
            <p className="text-sm text-gray-500">Welcome, {user.name}</p>
          </div>
          <Button
            isIconOnly
            variant="light"
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
            size="lg"
            startContent="🔍"
          />
        </div>

        {/* Properties Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            <Table aria-label="Properties and keys">
              <TableHeader>
                <TableColumn>Property</TableColumn>
                <TableColumn>Key Status</TableColumn>
                <TableColumn>Current Holder</TableColumn>
                <TableColumn>Expected Return</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No properties found.">
                {filteredProperties.map((property) => {
                  const key = property.keys[0]; // Show first key for now
                  return (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {property.address}
                          </p>
                          {property.description && (
                            <p className="text-sm text-gray-500">
                              {property.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {key ? (
                          getKeyStatus(key)
                        ) : (
                          <span className="text-gray-500">No keys</span>
                        )}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {key?.expectedReturnAt ? (
                          <span className="text-sm">
                            {new Date(key.expectedReturnAt).toLocaleTimeString(
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
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-blue-600 font-medium hover:text-blue-700"
                        >
                          View Details →
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
}
