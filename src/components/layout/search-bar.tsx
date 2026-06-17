"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, cn } from "@/lib/utils";

interface SearchSuggestion {
  slug: string;
  name: string;
  categoryName: string | null;
  minPriceCents: number;
  primaryImageUrl: string | null;
  sizes: string[];
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  compact?: boolean;
}

interface SearchBarInnerProps extends SearchBarProps {
  initialQuery: string;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function SearchSuggestionsList({
  suggestions,
  listId,
  activeIndex,
  onPick,
}: {
  suggestions: SearchSuggestion[];
  listId: string;
  activeIndex: number;
  onPick: (slug: string) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <ul
      id={listId}
      role="listbox"
      className="bg-card border-border/80 absolute top-[calc(100%+0.35rem)] right-0 left-0 z-50 max-h-72 overflow-y-auto rounded-[var(--radius-card)] border py-1 shadow-[var(--shadow-card)]"
    >
      {suggestions.map((item, index) => (
        <li key={item.slug} role="option" aria-selected={index === activeIndex}>
          <button
            type="button"
            className={cn(
              "hover:bg-muted/60 flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
              index === activeIndex && "bg-muted/50",
            )}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(item.slug)}
          >
            <span className="bg-tilouki-cloud relative size-10 shrink-0 overflow-hidden rounded-md">
              {item.primaryImageUrl ? (
                <Image
                  src={item.primaryImageUrl}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{item.name}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {[item.categoryName, item.sizes.length > 0 ? `Tailles ${item.sizes.join(", ")}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <span className="text-tilouki-navy shrink-0 text-sm font-bold tabular-nums">
              {formatPrice(item.minPriceCents)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SearchBarInner({
  className,
  placeholder = "Rechercher un vêtement, une taille…",
  compact = false,
  initialQuery,
}: SearchBarInnerProps) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(query.trim(), 220);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();

    void fetch(`/api/search/suggest?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { suggestions?: SearchSuggestion[] }) => {
        if (controller.signal.aborted) return;
        setSuggestions(data.suggestions ?? []);
        setActiveIndex(-1);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSuggestions([]);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const visibleSuggestions =
    debouncedQuery.length >= 2 ? suggestions : [];

  const navigateToProduct = (slug: string) => {
    setExpanded(false);
    setSuggestions([]);
    router.push(`/produit/${slug}`);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (activeIndex >= 0 && visibleSuggestions[activeIndex]) {
      navigateToProduct(visibleSuggestions[activeIndex].slug);
      return;
    }

    router.push(`/catalogue?q=${encodeURIComponent(trimmed)}`);
    setExpanded(false);
    setSuggestions([]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (visibleSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visibleSuggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const showSuggestions = visibleSuggestions.length > 0;

  const field = (
    <div ref={containerRef} className="relative w-full">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(
          "bg-background h-10 rounded-full pr-4 pl-10 shadow-[var(--shadow-soft)]",
          compact ? "pr-10 pl-9" : "border-border/80",
        )}
        aria-label="Rechercher dans le catalogue"
        aria-autocomplete="list"
        aria-controls={showSuggestions ? listId : undefined}
        aria-expanded={showSuggestions}
        autoFocus={compact && expanded}
      />
      {showSuggestions ? (
        <SearchSuggestionsList
          suggestions={visibleSuggestions}
          listId={listId}
          activeIndex={activeIndex}
          onPick={navigateToProduct}
        />
      ) : null}
    </div>
  );

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
      <form
        onSubmit={submit}
        className={cn("flex flex-1 items-center gap-2", className)}
      >
        {field}
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
      {field}
    </form>
  );
}

export function SearchBar(props: SearchBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery =
    pathname === "/catalogue"
      ? (searchParams.get("q") ?? "")
      : (props.defaultValue ?? "");

  return <SearchBarInner key={urlQuery} initialQuery={urlQuery} {...props} />;
}
