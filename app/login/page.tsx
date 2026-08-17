"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@heroui/react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"staff" | "visitor">("staff");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(phone, role);
      router.push(role === "staff" ? "/dashboard" : "/tablet/checkin");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Key Tracker</h1>
          <p className="text-gray-600">Key Check-In / Check-Out System</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-lg">
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setRole("staff")}
              variant={role === "staff" ? "primary" : "ghost"}
              fullWidth
            >
              Staff Login
            </Button>
            <Button
              onClick={() => setRole("visitor")}
              variant={role === "visitor" ? "primary" : "ghost"}
              fullWidth
            >
              Visitor Login
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-gray-700 mt-1">
                Name
              </p>
              <Input
                type="text"
                placeholder="Enter your name"
                // ToDo: Add add functionality for name input           
              />
              <p className="text-xs font-medium text-gray-700 mt-1">
                {role === "staff" ? "Phone Number" : "Mobile Number"}
              </p>
              <Input
                type="tel"
                placeholder={role === "staff" ? "+1234567890" : "Enter your number"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
              {role === "visitor" && (
                <p className="text-sm text-gray-500 mt-2">
                  We&apos;ll use this to contact you about key returns.
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isDisabled={!phone || loading}
              fullWidth
              className="font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              {role === "staff"
                ? "Staff members use this area to manage keys"
                : "Visitors can check in keys at reception"}
            </p>
          </div>
        </Card>

        {/* Demo Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Demo:</strong> Use any phone number to log in (e.g., +1234567890)
          </p>
        </div>
      </div>
    </div>
  );
}
