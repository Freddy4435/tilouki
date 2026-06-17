"use client";

import Link from "next/link";
import { User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccountTrigger() {
  return (
    <Link
      href="/compte"
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "shrink-0")}
      aria-label="Mon compte"
    >
      <User className="size-5" aria-hidden />
    </Link>
  );
}
