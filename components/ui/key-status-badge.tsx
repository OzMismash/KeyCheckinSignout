import { Chip } from "@heroui/react";
import { KeyStatus } from "@/lib/types";

const statusMap: Record<
  KeyStatus,
  { label: string; color: "success" | "warning" | "danger" }
> = {
  available: { label: "Available", color: "success" },
  checked_out: { label: "Checked Out", color: "warning" },
  overdue: { label: "Overdue", color: "danger" },
};

export function KeyStatusBadge({ status }: { status: KeyStatus }) {
  const config = statusMap[status];

  return (
    <Chip color={config.color} variant="soft">
      {config.label}
    </Chip>
  );
}
