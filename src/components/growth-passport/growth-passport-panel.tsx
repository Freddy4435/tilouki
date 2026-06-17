"use client";

import { useState } from "react";
import { Baby, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGrowthPassportStore,
  type GrowthProfile,
} from "@/lib/growth-passport/store";
import { cn } from "@/lib/utils";

interface GrowthPassportPanelProps {
  className?: string;
}

export function GrowthPassportPanel({ className }: GrowthPassportPanelProps) {
  const profiles = useGrowthPassportStore((state) => state.profiles);
  const activeProfileId = useGrowthPassportStore((state) => state.activeProfileId);
  const upsertProfile = useGrowthPassportStore((state) => state.upsertProfile);
  const removeProfile = useGrowthPassportStore((state) => state.removeProfile);
  const setActiveProfile = useGrowthPassportStore((state) => state.setActiveProfile);

  const [name, setName] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !sizeLabel.trim()) return;
    upsertProfile({ name: name.trim(), sizeLabel: sizeLabel.trim() });
    setName("");
    setSizeLabel("");
  };

  return (
    <section
      className={cn(
        "border-tilouki-pistache/30 bg-tilouki-pistache-soft/35 space-y-4 rounded-[var(--radius-card)] border p-4 sm:p-5",
        className,
      )}
      aria-labelledby="growth-passport-title"
    >
      <header className="space-y-1">
        <p className="text-retail-label text-tilouki-navy flex items-center gap-1.5">
          <Baby className="size-3.5" aria-hidden />
          Passeport croissance
        </p>
        <h2 id="growth-passport-title" className="text-base font-semibold">
          Mémoriser la taille de votre enfant
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Tilouki pré-sélectionne la taille sur les fiches et personnalise vos favoris —
          données stockées sur cet appareil uniquement.
        </p>
      </header>

      {profiles.length > 0 ? (
        <ul className="space-y-2">
          {profiles.map((profile: GrowthProfile) => (
            <li key={profile.id}>
              <button
                type="button"
                onClick={() => setActiveProfile(profile.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[var(--radius-button)] border px-3 py-2 text-left text-sm transition-colors",
                  activeProfileId === profile.id
                    ? "border-tilouki-navy bg-card"
                    : "border-border/70 bg-card/60 hover:bg-card",
                )}
              >
                <span>
                  <span className="font-semibold">{profile.name}</span>
                  <span className="text-muted-foreground"> · {profile.sizeLabel}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Retirer ${profile.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeProfile(profile.id);
                  }}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="growth-passport-name">Prénom</Label>
          <Input
            id="growth-passport-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Lina"
            maxLength={24}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="growth-passport-size">Taille actuelle</Label>
          <Input
            id="growth-passport-size"
            value={sizeLabel}
            onChange={(event) => setSizeLabel(event.target.value)}
            placeholder="Ex. 4 ans"
            maxLength={32}
          />
        </div>
        <Button type="submit" className="min-h-10">
          Enregistrer
        </Button>
      </form>
    </section>
  );
}
