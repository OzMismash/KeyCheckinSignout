import { Card, Link } from "@heroui/react";
import { Key, Property } from "@/lib/types";
import { KeyStatusBadge } from "@/components/ui/key-status-badge";

interface PropertyWithKeys extends Property {
  keys: Key[];
}

export function PropertySummaryCard({ property }: { property: PropertyWithKeys }) {
  const key = property.keys[0];

  return (
    <Card key={property.id} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-600 mb-1">Property</p>
          <p className="font-semibold text-gray-900">{property.address}</p>
          {property.description && (
            <p className="text-sm text-gray-500">{property.description}</p>
          )}
        </div>

        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-600 mb-1">Key Status</p>
          {key ? <KeyStatusBadge status={key.status} /> : <span className="text-gray-500">No keys</span>}
        </div>

        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-600 mb-1">Current Holder</p>
          {key?.currentHolder ? (
            <div>
              <p className="font-medium text-gray-900">{key.currentHolder.name}</p>
              {key.currentHolder.company && (
                <p className="text-sm text-gray-500">{key.currentHolder.company}</p>
              )}
            </div>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>

        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-600 mb-1">Expected Return</p>
          {key?.expectedReturnAt ? (
            <span className="text-sm">
              {new Date(key.expectedReturnAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>

        <div className="md:col-span-1 flex items-center justify-end">
          <Link href={`/properties/${property.id}`} className="text-blue-600 font-medium hover:text-blue-700">
            Details →
          </Link>
        </div>
      </div>
    </Card>
  );
}
