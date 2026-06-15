"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { submitProductReviewAction } from "@/server/actions/reviews";

interface ProductReviewFormProps {
  productId: string;
  productSlug: string;
}

export function ProductReviewForm({ productId, productSlug }: ProductReviewFormProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await submitProductReviewAction(formData);
      if (result.error) {
        toast.error("Avis non envoyé", result.error);
        return;
      }

      toast.success(
        "Merci pour votre avis",
        "Il sera publié après modération par notre équipe.",
      );
      form.reset();
      setRating(5);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card space-y-4 rounded-2xl border p-5">
      <div>
        <h3 className="font-heading text-lg font-semibold">Donner votre avis</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Votre avis aide d&apos;autres parents à choisir la bonne taille.
        </p>
      </div>

      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="space-y-2">
        <Label id="review-rating-label">Note</Label>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-labelledby="review-rating-label"
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const selected = value <= rating;
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                aria-pressed={selected}
                onClick={() => setRating(value)}
                className="focus-visible:ring-primary rounded-md p-1 outline-none focus-visible:ring-2"
              >
                <Star
                  className={cn(
                    "size-6",
                    selected
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            );
          })}
          <input type="hidden" name="rating" value={rating} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-author-name">Prénom</Label>
          <Input id="review-author-name" name="authorName" required maxLength={80} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-author-email">E-mail (achat vérifié)</Label>
          <Input
            id="review-author-email"
            name="authorEmail"
            type="email"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">Titre</Label>
        <Input id="review-title" name="title" required maxLength={120} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-body">Votre avis</Label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <Button type="submit" disabled={isPending} className="min-h-11 rounded-xl">
        {isPending ? "Envoi…" : "Envoyer mon avis"}
      </Button>
    </form>
  );
}
