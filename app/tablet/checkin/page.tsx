"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@heroui/react";
import { Property, User } from "@/lib/types";

type Step = "welcome" | "info" | "search" | "confirm" | "reason" | "time" | "signature" | "complete";

const VISIT_REASONS = [
  "Photography",
  "Inspection",
  "Maintenance",
  "Appraisal",
  "Viewing",
  "Cleaning",
  "Staging",
  "Other",
];

const RETURN_TIMES = [
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "End of day", value: 480 },
  { label: "Custom time", value: -1 },
];

export default function TabletCheckinPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);

  // Form data
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorCompany, setVisitorCompany] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [visitReason, setVisitReason] = useState("");
  const [returnTime, setReturnTime] = useState("60");
  const [signature, setSignature] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Handlers
  const handleInfoNext = () => {
    if (visitorName && visitorPhone) {
      setStep("search");
    }
  };

  const handlePropertySearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/properties?q=${encodeURIComponent(searchQuery)}`
      );
      const result = await response.json();

      if (result.success) {
        setProperties(result.data);
        setSearchPerformed(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setStep("confirm");
  };

  const handleConfirmProperty = () => {
    setStep("reason");
  };

  const handleReasonNext = () => {
    if (visitReason) {
      setStep("time");
    }
  };

  const handleTimeNext = () => {
    setStep("signature");
  };

  const handleCheckout = async () => {
    if (!selectedProperty || !visitorName) return;

    try {
      setLoading(true);

      const holder: User = {
        id: `visitor_${Date.now()}`,
        name: visitorName,
        phone: visitorPhone,
        company: visitorCompany || undefined,
        role: "visitor",
      };

      const returnMinutes = parseInt(returnTime);
      const expectedReturn = new Date(Date.now() + returnMinutes * 60000);

      // Get the property details to find the key
      const detailsResponse = await fetch(
        `/api/properties/${selectedProperty.id}`
      );
      const detailsResult = await detailsResponse.json();

      if (!detailsResult.success || !detailsResult.data.keys[0]) {
        alert("No keys available for this property");
        return;
      }

      const key = detailsResult.data.keys[0];

      const response = await fetch("/api/keys/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: key.id,
          propertyId: selectedProperty.id,
          holder,
          expectedReturnAt: expectedReturn,
          reason: visitReason,
          signature,
        }),
      });

      if (response.ok) {
        setStep("complete");
      } else {
        alert("Failed to check out key. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("welcome");
    setVisitorName("");
    setVisitorPhone("");
    setVisitorCompany("");
    setSearchQuery("");
    setProperties([]);
    setSelectedProperty(null);
    setVisitReason("");
    setReturnTime("60");
    setSignature("");
    setSearchPerformed(false);
  };

  // Tablet styling - large touch targets
  const tabletButtonClass =
    "text-xl font-bold py-6 h-24 rounded-xl shadow-lg hover:shadow-xl";
  const tabletInputClass = "text-lg py-3 h-14";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Welcome Step */}
        {step === "welcome" && (
          <Card className="p-8 text-center space-y-8 shadow-2xl">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-blue-600">Key Tracker</h1>
              <p className="text-3xl text-gray-700 font-semibold">
                Reception Desk
              </p>
              <p className="text-xl text-gray-600">
                Check in your keys using this tablet
              </p>
            </div>

            <Button
              onClick={() => setStep("info")}
              color="primary"
              className={`w-full ${tabletButtonClass}`}
            >
              START CHECK-IN
            </Button>

            <p className="text-sm text-gray-500">
              Tap the button above to begin
            </p>
          </Card>
        )}

        {/* Visitor Information Step */}
        {step === "info" && (
          <Card className="p-8 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Enter Your Details
            </h2>

            <Input
              label="Full Name *"
              placeholder="Enter your name"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              size="lg"
              className={tabletInputClass}
              classNames={{ input: "text-lg", label: "text-lg" }}
            />

            <Input
              type="tel"
              label="Mobile Number *"
              placeholder="Enter your phone"
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              size="lg"
              classNames={{ input: "text-lg", label: "text-lg" }}
            />

            <Input
              label="Company (optional)"
              placeholder="Enter company name"
              value={visitorCompany}
              onChange={(e) => setVisitorCompany(e.target.value)}
              size="lg"
              classNames={{ input: "text-lg", label: "text-lg" }}
            />

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("welcome")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                BACK
              </Button>
              <Button
                onClick={handleInfoNext}
                isDisabled={!visitorName || !visitorPhone}
                color="primary"
                className={`flex-1 ${tabletButtonClass}`}
              >
                NEXT
              </Button>
            </div>
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
                <p className="text-red-900 text-lg">No properties found</p>
              </div>
            )}

            {properties.length > 0 && (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-900">
                  Results ({properties.length})
                </p>
                {properties.map((property) => (
                  <Button
                    key={property.id}
                    onClick={() => handlePropertySelect(property)}
                    variant="bordered"
                    className="w-full text-left text-lg py-4 h-20 rounded-xl justify-start px-6"
                  >
                    <div>
                      <p className="font-semibold">{property.address}</p>
                      {property.description && (
                        <p className="text-sm text-gray-500">
                          {property.description}
                        </p>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("info")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                BACK
              </Button>
              <Button
                onClick={handlePropertySearch}
                isLoading={loading}
                color="primary"
                className={`flex-1 ${tabletButtonClass}`}
              >
                SEARCH
              </Button>
            </div>
          </Card>
        )}

        {/* Property Confirmation Step */}
        {step === "confirm" && selectedProperty && (
          <Card className="p-8 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900">Confirm Property</h2>

            <div className="bg-blue-50 border-2 border-blue-500 p-6 rounded-xl">
              <p className="text-2xl font-bold text-blue-900 mb-2">
                {selectedProperty.address}
              </p>
              {selectedProperty.description && (
                <p className="text-lg text-blue-800">
                  {selectedProperty.description}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("search")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                CHANGE
              </Button>
              <Button
                onClick={handleConfirmProperty}
                color="primary"
                className={`flex-1 ${tabletButtonClass}`}
              >
                CORRECT
              </Button>
            </div>
          </Card>
        )}

        {/* Visit Reason Step */}
        {step === "reason" && (
          <Card className="p-8 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Reason for Visit
            </h2>

            <Select
              label="Select reason"
              placeholder="Choose a reason"
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
              size="lg"
              classNames={{ base: "text-lg", label: "text-lg" }}
            >
              {VISIT_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason} className="text-lg">
                  {reason}
                </SelectItem>
              ))}
            </Select>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("confirm")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                BACK
              </Button>
              <Button
                onClick={handleReasonNext}
                isDisabled={!visitReason}
                color="primary"
                className={`flex-1 ${tabletButtonClass}`}
              >
                NEXT
              </Button>
            </div>
          </Card>
        )}

        {/* Expected Return Time Step */}
        {step === "time" && (
          <Card className="p-8 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Expected Return Time
            </h2>

            <p className="text-lg text-gray-600">
              When will you return the keys?
            </p>

            <div className="grid grid-cols-1 gap-4">
              {RETURN_TIMES.map((timeOption) => (
                <Button
                  key={timeOption.value}
                  onClick={() => setReturnTime(timeOption.value.toString())}
                  variant={
                    returnTime === timeOption.value.toString()
                      ? "solid"
                      : "bordered"
                  }
                  color={
                    returnTime === timeOption.value.toString()
                      ? "primary"
                      : "default"
                  }
                  className={`text-xl font-bold py-4 h-16 rounded-xl ${
                    returnTime === timeOption.value.toString()
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  {timeOption.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("reason")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                BACK
              </Button>
              <Button
                onClick={handleTimeNext}
                color="primary"
                className={`flex-1 ${tabletButtonClass}`}
              >
                NEXT
              </Button>
            </div>
          </Card>
        )}

        {/* Signature Step */}
        {step === "signature" && (
          <Card className="p-8 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Digital Signature
            </h2>

            <p className="text-lg text-gray-600">
              Please sign below to confirm receipt of keys
            </p>

            <Textarea
              label="Signature"
              placeholder="Type your name to sign"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              size="lg"
              classNames={{ input: "text-lg", label: "text-lg" }}
            />

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setStep("time")}
                color="default"
                className={`flex-1 ${tabletButtonClass}`}
              >
                BACK
              </Button>
              <Button
                onClick={handleCheckout}
                isLoading={loading}
                isDisabled={!signature || loading}
                color="success"
                className={`flex-1 ${tabletButtonClass}`}
              >
                COMPLETE
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
                Keys Checked Out
              </h1>
              <p className="text-2xl text-green-600">
                Thank you, {visitorName}!
              </p>
              <p className="text-lg text-gray-700">
                Keys for {selectedProperty?.address}
                <br />
                Expected return:{" "}
                {new Date(
                  Date.now() + parseInt(returnTime) * 60000
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <Button
              onClick={handleReset}
              color="primary"
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
