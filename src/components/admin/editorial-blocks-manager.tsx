"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EditorialBlock } from "@/lib/editorial/types";

interface EditorialBlocksManagerProps {
  blocks: EditorialBlock[];
}

function createEmptyBlock(): EditorialBlock {
  return {
    title: "",
    hook: "",
    imageUrl: "",
    href: "",
    active: true,
  };
}

export function EditorialBlocksManager({
  blocks: initialBlocks,
}: EditorialBlocksManagerProps) {
  const [items, setItems] = useState<EditorialBlock[]>(
    initialBlocks.length > 0 ? initialBlocks : [],
  );

  const updateItem = (index: number, patch: Partial<EditorialBlock>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    if (items.length >= 3) return;
    setItems((current) => [...current, createEmptyBlock()]);
  };

  return (
    <fieldset className="space-y-4 rounded-xl border p-4">
      <legend className="px-1 text-sm font-semibold">Notre univers — accueil</legend>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Jusqu&apos;à 3 cartes éditoriales entre les catégories et les petits prix. Si
        moins de 2 blocs actifs sont configurés, des cartes dérivées des catégories sont
        affichées.
      </p>
      <input type="hidden" name="editorialBlocks" value={JSON.stringify(items)} />

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Carte {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                aria-label={`Supprimer la carte ${index + 1}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`editorial-active-${index}`}
                checked={item.active !== false}
                onCheckedChange={(checked) =>
                  updateItem(index, { active: checked === true })
                }
              />
              <Label htmlFor={`editorial-active-${index}`} className="font-normal">
                Afficher sur l&apos;accueil
              </Label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`editorial-title-${index}`}>Titre</Label>
                <Input
                  id={`editorial-title-${index}`}
                  value={item.title}
                  onChange={(event) => updateItem(index, { title: event.target.value })}
                  placeholder="Ex. L'univers bébé"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`editorial-hook-${index}`}>Accroche</Label>
                <Input
                  id={`editorial-hook-${index}`}
                  value={item.hook}
                  onChange={(event) => updateItem(index, { hook: event.target.value })}
                  placeholder="Une phrase d'accroche courte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`editorial-image-${index}`}>Image (URL)</Label>
                <Input
                  id={`editorial-image-${index}`}
                  type="url"
                  value={item.imageUrl ?? ""}
                  onChange={(event) =>
                    updateItem(index, { imageUrl: event.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`editorial-href-${index}`}>Lien</Label>
                <Input
                  id={`editorial-href-${index}`}
                  value={item.href}
                  onChange={(event) => updateItem(index, { href: event.target.value })}
                  placeholder="/categorie/bebe"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length < 3 ? (
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1 size-4" />
          Ajouter une carte
        </Button>
      ) : null}
    </fieldset>
  );
}
