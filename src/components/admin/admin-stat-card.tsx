import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminStatCardTone = "default" | "warning" | "success";

interface AdminStatCardProps {
  title: string;
  value: string;
  description?: string;
  href?: string;
  tone?: AdminStatCardTone;
  className?: string;
}

const toneClasses: Record<AdminStatCardTone, string> = {
  default: "",
  warning: "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/10",
  success: "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/10",
};

export function AdminStatCard({
  title,
  value,
  description,
  href,
  tone = "default",
  className,
}: AdminStatCardProps) {
  const content = (
    <Card className={cn(toneClasses[tone], href && "transition-colors hover:bg-muted/30", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {description ? (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2">
        {content}
      </Link>
    );
  }

  return content;
}
