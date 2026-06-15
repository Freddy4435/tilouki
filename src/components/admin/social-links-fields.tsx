"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShopSocialLinksInput } from "@/lib/social/validation";

interface SocialLinksFieldsProps {
  links: ShopSocialLinksInput;
}

export function SocialLinksFields({ links }: SocialLinksFieldsProps) {
  const [values, setValues] = useState({
    instagram: links.instagram ?? "",
    facebook: links.facebook ?? "",
    tiktok: links.tiktok ?? "",
  });

  const payload = {
    instagram: values.instagram.trim() || null,
    facebook: values.facebook.trim() || null,
    tiktok: values.tiktok.trim() || null,
  };

  return (
    <fieldset className="space-y-4 rounded-xl border p-4">
      <legend className="px-1 text-sm font-semibold">Réseaux sociaux</legend>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Liens affichés dans le pied de page. Laissez vide pour masquer une icône.
      </p>
      <input type="hidden" name="socialLinks" value={JSON.stringify(payload)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="socialInstagram">Instagram</Label>
          <Input
            id="socialInstagram"
            type="url"
            placeholder="https://instagram.com/..."
            value={values.instagram}
            onChange={(event) =>
              setValues((current) => ({ ...current, instagram: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialFacebook">Facebook</Label>
          <Input
            id="socialFacebook"
            type="url"
            placeholder="https://facebook.com/..."
            value={values.facebook}
            onChange={(event) =>
              setValues((current) => ({ ...current, facebook: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="socialTiktok">TikTok</Label>
          <Input
            id="socialTiktok"
            type="url"
            placeholder="https://tiktok.com/@..."
            value={values.tiktok}
            onChange={(event) =>
              setValues((current) => ({ ...current, tiktok: event.target.value }))
            }
          />
        </div>
      </div>
    </fieldset>
  );
}
