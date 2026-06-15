import type { ReactNode } from "react";

import { AdminHeader } from "@/components/layout/admin-header";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <AdminHeader title={title} description={description} />
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
