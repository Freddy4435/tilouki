"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminCategory } from "@/lib/supabase/queries/admin/categories";
import { saveCategoryAction } from "@/server/actions/admin/categories";

interface CategoryFormProps {
  category?: AdminCategory;
  onSuccess?: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (category?.id) form.set("id", category.id);
    if (isActive) form.set("isActive", "on");

    startTransition(async () => {
      setError(null);
      const result = await saveCategoryAction(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Nom *</Label>
        <Input id="cat-name" name="name" defaultValue={category?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input
          id="cat-slug"
          name="slug"
          defaultValue={category?.slug}
          placeholder="auto depuis le nom"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-description">Description</Label>
        <textarea
          id="cat-description"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
          className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-sortOrder">Ordre d&apos;affichage</Label>
        <Input
          id="cat-sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={category?.sortOrder ?? 0}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="cat-isActive"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked === true)}
        />
        <Label htmlFor="cat-isActive">Catégorie active</Label>
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement…" : category ? "Mettre à jour" : "Créer la catégorie"}
      </Button>
    </form>
  );
}
