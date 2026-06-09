"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  /** Mode compact : icône qui déploie le champ (mobile header) */
  compact?: boolean;
}

export function SearchBar({
  className,
  placeholder = "Rechercher un vêtement, une taille…",
  defaultValue = "",
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [expanded, setExpanded] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/catalogue?q=${encodeURIComponent(trimmed)}`);
    setExpanded(false);
  };

  if (compact) {
    if (!expanded) {
      return (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={className}
          aria-label="Ouvrir la recherche"
          onClick={() => setExpanded(true)}
        >
          <Search className="size-5" />
        </Button>
      );
    }

    return (
      <form onSubmit={submit} className={cn("flex flex-1 items-center gap-2", className)}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="bg-background h-10 rounded-full pr-10 pl-9"
            autoFocus
            aria-label="Rechercher"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Fermer la recherche"
          onClick={() => setExpanded(false)}
        >
          <X className="size-5" />
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className={cn("relative w-full max-w-md", className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="bg-background h-10 rounded-full border-border/80 pr-4 pl-10 shadow-[var(--shadow-soft)]"
        aria-label="Rechercher dans le catalogue"
      />
    </form>
  );
}
