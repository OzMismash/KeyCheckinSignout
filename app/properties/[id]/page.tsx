"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Input, Spinner } from "@heroui/react";
import { Activity, Key, User } from "@/lib/types";
import {
  ActivityTimelineCard,
  KeyCustodyCard,
  PropertyHeader,
} from "@/components/property/property-detail-panels";

interface PropertyDetails {
  id: string;
  address: string;
  description?: string;
  keys: Key[];
  recentActivity: Activity[];
}

const RETURN_TIME_OPTIONS = [
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "End of day", value: 480 },
  { label: "Tomorrow", value: 1440 },
];

const CHECKOUT_REASONS = [
  "Photography",
  "Inspection",
  "Maintenance",
  "Appraisal",
  "Viewing",
  "Cleaning",
  "Staging",
  "Other",
];

export default function PropertyDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    holderName: "",
    holderPhone: "",
    reason: "",
    returnTime: "60",
  });
  const [checkinNote, setCheckinNote] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const loadPropertyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}`);
      const result = await response.json();

      if (result.success) {
        setProperty(result.data);
      }
    } catch (error) {
      console.error("Failed to load property details:", error);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (!user || user.role !== "staff") {
      router.push("/login");
      return;
    }

    void loadPropertyDetails();
  }, [user, router, propertyId, loadPropertyDetails]);

  const handleCheckout = async () => {
    if (!property || !user) return;

    try {
      setCheckingOut(true);

      const holder: User = {
        id: `visitor_${Date.now()}`,
        name: checkoutForm.holderName,
        phone: checkoutForm.holderPhone,
        role: "visitor",
      };

      const expectedReturn = new Date(
        Date.now() + Number.parseInt(checkoutForm.returnTime, 10) * 60000
      );

      const response = await fetch("/api/keys/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: property.keys[0].id,
          propertyId: property.id,
          holder,
          expectedReturnAt: expectedReturn,
          reason: checkoutForm.reason,
          checkedOutBy: user,
        }),
      });

      if (response.ok) {
        setCheckoutForm({ holderName: "", holderPhone: "", reason: "", returnTime: "60" });
        setShowCheckoutModal(false);
        void loadPropertyDetails();
      } else {
        alert("Failed to check out key");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCheckin = async () => {
    if (!property || !user) return;

    try {
      setCheckingIn(true);

      const response = await fetch("/api/keys/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: property.keys[0].id,
          propertyId: property.id,
          checkedInBy: user,
          notes: checkinNote,
        }),
      });

      if (response.ok) {
        setCheckinNote("");
        setShowCheckinModal(false);
        void loadPropertyDetails();
      } else {
        alert("Failed to check in key");
      }
    } catch (error) {
      console.error("Checkin error:", error);
      alert("An error occurred during checkin");
    } finally {
      setCheckingIn(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-900 font-semibold">Property not found</p>
          <Button variant="primary" onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const key = property.keys[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyHeader
        address={property.address}
        description={property.description}
        onBack={() => router.push("/dashboard")}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <KeyCustodyCard
          currentKey={key}
          onCheckout={() => setShowCheckoutModal(true)}
          onCheckin={() => setShowCheckinModal(true)}
        />

        <div className="border-t border-gray-200" />
        <ActivityTimelineCard activities={property.recentActivity ?? []} />
      </main>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-full p-6">
            <h2 className="text-xl font-bold mb-4">Check Out Keys</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name</label>
                <Input
                  placeholder="Enter name"
                  value={checkoutForm.holderName}
                  onChange={(event) =>
                    setCheckoutForm({ ...checkoutForm, holderName: event.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="Enter phone"
                  value={checkoutForm.holderPhone}
                  onChange={(event) =>
                    setCheckoutForm({ ...checkoutForm, holderPhone: event.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <select
                  value={checkoutForm.reason}
                  onChange={(event) =>
                    setCheckoutForm({ ...checkoutForm, reason: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                >
                  <option value="">Select a reason</option>
                  {CHECKOUT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Time</label>
                <select
                  value={checkoutForm.returnTime}
                  onChange={(event) =>
                    setCheckoutForm({ ...checkoutForm, returnTime: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                >
                  {RETURN_TIME_OPTIONS.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCheckoutModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckout}
                isDisabled={checkingOut || !checkoutForm.holderName || !checkoutForm.holderPhone || !checkoutForm.reason}
              >
                Complete Checkout
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-full p-6">
            <h2 className="text-xl font-bold mb-4">Check In Keys</h2>
            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={checkinNote}
                onChange={(event) => setCheckinNote(event.target.value)}
                placeholder="Optional check-in notes"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 min-h-28"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCheckinModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" isDisabled={checkingIn} onClick={handleCheckin}>
                Confirm Check In
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
