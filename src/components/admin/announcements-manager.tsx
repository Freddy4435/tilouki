"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_SHOP_ANNOUNCEMENTS } from "@/lib/announcements/defaults";
import type { ShopAnnouncement } from "@/lib/announcements/types";

interface AnnouncementsManagerProps {
  enabled: boolean;
  announcements: ShopAnnouncement[];
  onValidationError?: (message: string | null) => void;
}

function createEmptyAnnouncement(): ShopAnnouncement {
  return { text: "", href: null, active: true };
}

export function AnnouncementsManager({
  enabled: initialEnabled,
  announcements: initialAnnouncements,
  onValidationError,
}: AnnouncementsManagerProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [items, setItems] = useState<ShopAnnouncement[]>(
    initialAnnouncements.length > 0 ? initialAnnouncements : DEFAULT_SHOP_ANNOUNCEMENTS,
  );

  const reportError = (message: string | null) => {
    onValidationError?.(message);
  };

  const updateItem = (index: number, patch: Partial<ShopAnnouncement>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    reportError(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    if (items.length >= 3) return;
    setItems((current) => [...current, createEmptyAnnouncement()]);
  };

  return (
    <fieldset className="space-y-4 rounded-xl border p-4">
      <legend className="px-1 text-sm font-semibold">Barre d&apos;annonces</legend>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Bandeau fin en haut du site (1 à 3 messages rotatifs). Les modèles par défaut
        restent inactifs tant que vous n&apos;activez pas la barre et chaque message.
      </p>

      <div className="flex items-center gap-2">
        <Checkbox
          id="announcementsEnabled"
          checked={enabled}
          onCheckedChange={(checked) => setEnabled(checked === true)}
        />
        <Label htmlFor="announcementsEnabled">Afficher la barre d&apos;annonces</Label>
      </div>

      <input type="hidden" name="announcementsEnabled" value={enabled ? "on" : "off"} />
      <input type="hidden" name="announcements" value={JSON.stringify(items)} />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Message {index + 1}</p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  aria-label={`Monter le message ${index + 1}`}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 1)}
                  aria-label={`Descendre le message ${index + 1}`}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={items.length <= 1}
                  onClick={() => removeItem(index)}
                  aria-label={`Supprimer le message ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`announcement-text-${index}`}>Texte</Label>
              <Input
                id={`announcement-text-${index}`}
                value={item.text}
                maxLength={120}
                placeholder="Ex. Livraison offerte dès 50 €"
                onChange={(event) => updateItem(index, { text: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`announcement-href-${index}`}>Lien (optionnel)</Label>
              <Input
                id={`announcement-href-${index}`}
                type="url"
                value={item.href ?? ""}
                placeholder="https://…"
                onChange={(event) =>
                  updateItem(index, { href: event.target.value || null })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id={`announcement-active-${index}`}
                checked={item.active}
                onCheckedChange={(checked) =>
                  updateItem(index, { active: checked === true })
                }
              />
              <Label htmlFor={`announcement-active-${index}`}>Message actif</Label>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={items.length >= 3}
        onClick={addItem}
      >
        <Plus className="size-4" />
        Ajouter un message
      </Button>
    </fieldset>
  );
}
