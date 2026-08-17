import { Button, Card } from "@heroui/react";
import { Activity, Key } from "@/lib/types";
import { KeyStatusBadge } from "@/components/ui/key-status-badge";

export function PropertyHeader({
  address,
  description,
  onBack,
}: {
  address: string;
  description?: string;
  onBack: () => void;
}) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Button variant="ghost" onClick={onBack} className="mb-4 text-blue-600">
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{address}</h1>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
    </header>
  );
}

export function KeyCustodyCard({
  currentKey,
  onCheckout,
  onCheckin,
}: {
  currentKey?: Key;
  onCheckout: () => void;
  onCheckin: () => void;
}) {
  if (!currentKey) {
    return (
      <Card className="p-6 border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Custody</h2>
        <p className="text-gray-500">No keys available for this property.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-l-4 border-blue-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Custody</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
            <KeyStatusBadge status={currentKey.status} />
          </div>

          {currentKey.currentHolder && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Current Holder</p>
                <p className="font-semibold text-gray-900">{currentKey.currentHolder.name}</p>
                {currentKey.currentHolder.company && (
                  <p className="text-sm text-gray-500">{currentKey.currentHolder.company}</p>
                )}
              </div>

              {currentKey.checkedOutAt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Checked Out</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(currentKey.checkedOutAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {currentKey.expectedReturnAt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Expected Return</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(currentKey.expectedReturnAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {currentKey.reason && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Reason for Checkout</p>
            <p className="text-gray-900">{currentKey.reason}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {currentKey.status === "available" ? (
            <Button variant="primary" onClick={onCheckout} size="lg">
              Check Out Keys
            </Button>
          ) : (
            <Button variant="secondary" onClick={onCheckin} size="lg">
              Check In Keys
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ActivityTimelineCard({ activities }: { activities: Activity[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Timeline</h2>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0"
            >
              <div className="shrink-0">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-2" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.description}</p>
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
  );
}
