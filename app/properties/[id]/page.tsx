"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Spinner,
  Chip,
  TextArea,
  Label,
  TextField,
} from "@heroui/react";
import { Key, User, Activity } from "@/lib/types";

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

  // Checkout modal state
  const [checkoutForm, setCheckoutForm] = useState({
    holderName: "",
    holderPhone: "",
    reason: "",
    returnTime: "60",
  });
  const [checkingOut, setCheckingOut] = useState(false);

  // Checkin modal state
  const [checkinNote, setCheckinNote] = useState("");
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

      const returnMinutes = parseInt(checkoutForm.returnTime);
      const expectedReturn = new Date(Date.now() + returnMinutes * 60000);

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
          <Button
            variant="primary"
            onClick={() => router.push("/dashboard")}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const key = property.keys[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-blue-600"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {property.address}
          </h1>
          {property.description && (
            <p className="text-gray-500 mt-1">{property.description}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Custody Section */}
        <Card className="p-6 border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Key Custody
          </h2>

          {key ? (
            <div className="space-y-6">
              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Status
                  </p>
                  <Chip
                    color={
                      key.status === "available"
                        ? "success"
                        : key.status === "checked_out"
                          ? "warning"
                          : "danger"
                    }
                    variant="soft"
                  >
                    {key.status === "available"
                      ? "Available"
                      : key.status === "checked_out"
                        ? "Checked Out"
                        : "Overdue"}
                  </Chip>
                </div>

                {key.currentHolder && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Current Holder
                      </p>
                      <p className="font-semibold text-gray-900">
                        {key.currentHolder.name}
                      </p>
                      {key.currentHolder.company && (
                        <p className="text-sm text-gray-500">
                          {key.currentHolder.company}
                        </p>
                      )}
                    </div>

                    {key.checkedOutAt && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Checked Out
                        </p>
                        <p className="font-semibold text-gray-900">
                          {new Date(key.checkedOutAt).toLocaleTimeString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}

                    {key.expectedReturnAt && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Expected Return
                        </p>
                        <p className="font-semibold text-gray-900">
                          {new Date(key.expectedReturnAt).toLocaleTimeString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {key.reason && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Reason for Checkout
                  </p>
                  <p className="text-gray-900">{key.reason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {key.status === "available" ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowCheckoutModal(true)}
                    size="lg"
                  >
                    Check Out Keys
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowCheckinModal(true)}
                    size="lg"
                  >
                    Check In Keys
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No keys available for this property.</p>
          )}
        </Card>

        <div className="border-t border-gray-200" />

        {/* Activity Timeline */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Activity Timeline
          </h2>

          {property.recentActivity && property.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {property.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="shrink-0">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-2" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No activity yet.</p>
          )}
        </Card>
      </main>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-full p-6">
            <h2 className="text-xl font-bold mb-4">Check Out Keys</h2>
            <div className="space-y-4 mb-6">
              <TextField>
                <Label>Visitor Name</Label>
                <Input
                  placeholder="Enter name"
                  value={checkoutForm.holderName}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      holderName: e.target.value,
                    })
                  }
                />
              </TextField>

              <TextField>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="Enter phone"
                  value={checkoutForm.holderPhone}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      holderPhone: e.target.value,
                    })
                  }
                />
              </TextField>

              <div>
                <Label>Reason for Checkout</Label>
                <select
                  value={checkoutForm.reason}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      reason: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                <Label>Expected Return Time</Label>
                <select
                  value={checkoutForm.returnTime}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      returnTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select return time</option>
                  {RETURN_TIME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value.toString()}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowCheckoutModal(false)}
                isDisabled={checkingOut}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckout}
                isDisabled={
                  !checkoutForm.holderName ||
                  !checkoutForm.reason ||
                  checkingOut
                }
              >
                Confirm Checkout
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Checkin Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-full p-6">
            <h2 className="text-xl font-bold mb-4">Check In Keys</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Keys from: {key?.currentHolder?.name}
                </p>
              </div>

              <TextField>
                <Label>Notes (optional)</Label>
                <TextArea
                  placeholder="Add any notes about the return..."
                  value={checkinNote}
                  onChange={(e) => setCheckinNote(e.target.value)}
                />
              </TextField>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowCheckinModal(false)}
                isDisabled={checkingIn}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckin}
                isDisabled={checkingIn}
              >
                Confirm Check-In
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
