"use client";

import Image from "next/image";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { ImageUploadFeedback } from "@/components/admin/image-upload-feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  HERO_IMAGE_PROFILE,
  IMAGE_UPLOAD_LIMITS,
  validateImageFileForUpload,
} from "@/lib/admin/image-upload";
import { createClient } from "@/lib/supabase/client";
import {
  extractStoragePathFromPublicUrl,
  getShopHeroStoragePath,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/storage";
import { updateShopHeroImageAction } from "@/server/actions/admin/settings";

interface HeroImageUploadProps {
  currentUrl: string | null;
}

export function HeroImageUpload({ currentUrl }: HeroImageUploadProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const busy = uploading || isPending;

  const persistUrl = (url: string | null) => {
    startTransition(async () => {
      setError(null);
      const result = await updateShopHeroImageAction(url);
      if (result.error) {
        setError(result.error);
        setPreviewUrl(currentUrl);
        return;
      }
      setPreviewUrl(url);
      router.refresh();
    });
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setWarning(null);
    setUploading(true);

    try {
      const validation = await validateImageFileForUpload(file, HERO_IMAGE_PROFILE);
      if (!validation.ok) {
        setError(validation.error ?? "Fichier refusé.");
        return;
      }
      if (validation.warning) setWarning(validation.warning);

      const supabase = createClient();
      const path = getShopHeroStoragePath(file.name);
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
      persistUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!previewUrl) return;
    setError(null);
    setWarning(null);

    const path = extractStoragePathFromPublicUrl(previewUrl);
    if (path) {
      const supabase = createClient();
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
    }

    persistUrl(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Photo hero (page d&apos;accueil)</Label>
        <p className="text-muted-foreground max-w-prose text-xs leading-relaxed">
          {HERO_IMAGE_PROFILE.guidance} Sans image, l&apos;illustration CSS par défaut
          s&apos;affiche.
        </p>
      </div>

      {previewUrl ? (
        <div className="relative aspect-[4/5] max-w-xs overflow-hidden rounded-2xl border shadow-[var(--shadow-soft)]">
          <Image
            src={previewUrl}
            alt="Aperçu photo hero"
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>
      ) : (
        <div className="bg-tilouki-beige/50 text-muted-foreground flex aspect-[4/5] max-w-xs items-center justify-center rounded-2xl border border-dashed text-sm">
          Aucune photo — illustration CSS
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_UPLOAD_LIMITS.acceptAttribute}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {previewUrl ? "Remplacer" : "Téléverser une photo"}
        </Button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void removeImage()}
          >
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        ) : null}
      </div>

      <ImageUploadFeedback error={error} warning={warning} />
    </div>
  );
}
