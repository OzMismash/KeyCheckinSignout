"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Spinner,
  Textarea,
} from "@heroui/react";
import { Property, Key } from "@/lib/types";

type Step = "welcome" | "search" | "select" | "confirm" | "complete";

interface PropertyWithKey extends Property {
  keys: Key[];
}

export default function TabletReturnPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<PropertyWithKey[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithKey | null>(null);
  const [notes, setNotes] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const tabletButtonClass =
    "text-xl font-bold py-6 h-24 rounded-xl shadow-lg hover:shadow-xl";

  const handlePropertySearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/properties?q=${encodeURIComponent(searchQuery)}`
      );
      const result = await response.json();

      if (result.success) {
        // Enrich with key details
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

        // Filter to only show properties with checked-out keys
        setProperties(
          enriched.filter((p) =>
            p.keys.some((k) => k.status === "checked_out")
          )
        );
        setSearchPerformed(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property: PropertyWithKey) => {
    setSelectedProperty(property);
    setStep("confirm");
  };

  const handleConfirmReturn = async () => {
    if (!selectedProperty) return;

    try {
      setLoading(true);

      const checkedOutKey = selectedProperty.keys.find(
        (k) => k.status === "checked_out"
      );
      if (!checkedOutKey) {
        alert("No checked-out keys found for this property");
        return;
      }

      const response = await fetch("/api/keys/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: checkedOutKey.id,
          propertyId: selectedProperty.id,
          notes,
        }),
      });

      if (response.ok) {
        setStep("complete");
      } else {
        alert("Failed to check in keys. Please try again.");
      }
    } catch (error) {
      console.error("Checkin error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("welcome");
    setSearchQuery("");
    setProperties([]);
    setSelectedProperty(null);
    setNotes("");
    setSearchPerformed(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Welcome Step */}
        {step === "welcome" && (
          <Card className="p-8 text-center space-y-8 shadow-2xl">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-green-600">Key Tracker</h1>
              <p className="text-3xl text-gray-700 font-semibold">
                Return Keys
              </p>
              <p className="text-xl text-gray-600">
                Return your keys at the reception desk
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setStep("search")}
                color="success"
                className={`w-full ${tabletButtonClass}`}
              >
                RETURN KEYS
              </Button>

              <Button
                onClick={() => router.push("/tablet/checkin")}
                variant="bordered"
                className={`w-full ${tabletButtonClass}`}
              >
                CHECK OUT KEYS
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Tap the button above to begin
            </p>
          </Card>
        )}

        {/* Property Search Step */}
        {step === "search" && (
          <Card className="p-8 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Search Property
            </h2>

            <p className="text-lg text-gray-600">
              Enter the property address
            </p>

            <Input
              type="text"
              placeholder="e.g., 12B Smith Street"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
              classNames={{ input: "text-lg", label: "text-lg" }}
            />

            {searchPerformed && properties.length === 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-900 text-lg">
                  No properties with checked-out keys found
                </p>
              </div>
            )}

            {properties.length > 0 && (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-900">
                  Results ({properties.length})
                </p>
                {properties.map((property) => {
                  const checkedOutKey = property.keys.find(
                    (k) => k.status === "checked_out"
                  );
                  return (
                    <Button
                      key={property.id}
                      onClick={() => handlePropertySelect(property)}
                      variant="bordered"
                      className="w-full text-left text-lg py-4 h-24 rounded-xl justify-start px-6"
                    >
                      <div>
                        <p className="font-semibold">{property.address}</p>
                        {checkedOutKey?.currentHolder && (
                          <p className="text-sm text-gray-500">
                            Held by: {checkedOutKey.currentHolder.name}
                          </p>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("welcome")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                BACK
              </Button>
              <Button
                onClick={handlePropertySearch}
                isLoading={loading}
                color="success"
                className={`flex-1 ${tabletButtonClass}`}
              >
                SEARCH
              </Button>
            </div>
          </Card>
        )}

        {/* Confirmation Step */}
        {step === "confirm" && selectedProperty && (
          <Card className="p-8 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Confirm Key Return
            </h2>

            <div className="bg-green-50 border-2 border-green-500 p-6 rounded-xl">
              <p className="text-2xl font-bold text-green-900 mb-2">
                {selectedProperty.address}
              </p>
              {selectedProperty.keys[0]?.currentHolder && (
                <p className="text-lg text-green-800">
                  Holder: {selectedProperty.keys[0].currentHolder.name}
                </p>
              )}
            </div>

            <Textarea
              label="Notes (optional)"
              placeholder="Add any notes about the return..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="lg"
              classNames={{ input: "text-lg", label: "text-lg" }}
            />

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("search")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                BACK
              </Button>
              <Button
                onClick={handleConfirmReturn}
                isLoading={loading}
                color="success"
                className={`flex-1 ${tabletButtonClass}`}
              >
                RETURN
              </Button>
            </div>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <Card className="p-8 text-center space-y-8 shadow-2xl bg-green-50">
            <div className="space-y-4">
              <div className="text-6xl">✓</div>
              <h1 className="text-4xl font-bold text-green-700">
                Keys Returned
              </h1>
              <p className="text-2xl text-green-600">Thank you!</p>
              <p className="text-lg text-gray-700">
                Keys for {selectedProperty?.address}
                <br />
                have been checked in successfully
              </p>
            </div>

            <Button
              onClick={handleReset}
              color="success"
              className={`w-full ${tabletButtonClass}`}
            >
              NEXT VISITOR
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
