"use client";

import Image from "next/image";
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  getProductImageStoragePath,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/storage";
import {
  deleteProductImageAction,
  reorderProductImagesAction,
  saveProductImageAction,
} from "@/server/actions/admin/products";
import type { AdminProductDetail } from "@/lib/supabase/queries/admin/products";
import { cn } from "@/lib/utils";

interface ProductImagesManagerProps {
  productId: string;
  productName: string;
  images: AdminProductDetail["images"];
}

export function ProductImagesManager({
  productId,
  productName,
  images: initialImages,
}: ProductImagesManagerProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState(initialImages);
  const [prevInitialImages, setPrevInitialImages] = useState(initialImages);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  if (initialImages !== prevInitialImages) {
    setPrevInitialImages(initialImages);
    setImages(initialImages);
  }

  const syncFromServer = () => {
    router.refresh();
  };

  const persistOrder = (next: AdminProductDetail["images"]) => {
    setImages(next);
    startTransition(async () => {
      const result = await reorderProductImagesAction(
        productId,
        next.map((img) => img.id),
      );
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const nextSort = images.length;

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const path = getProductImageStoragePath(productId, file.name);
        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, file, { upsert: false });

        if (uploadError) {
          setError(uploadError.message);
          break;
        }

        const { data: publicData } = supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(path);

        const result = await saveProductImageAction(productId, {
          url: publicData.publicUrl,
          alt: productName,
          sortOrder: nextSort + i,
        });

        if (result.error) {
          setError(result.error);
          break;
        }
      }

      syncFromServer();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setDropIndex(null);
    persistOrder(next);
  };

  const updateAlt = (imageId: string, alt: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;
    startTransition(async () => {
      const result = await saveProductImageAction(productId, {
        id: imageId,
        url: image.url,
        alt,
        sortOrder: image.sortOrder,
      });
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const removeImage = (imageId: string) => {
    if (!confirm("Supprimer cette image ?")) return;
    startTransition(async () => {
      const result = await deleteProductImageAction(productId, imageId);
      if (result.error) setError(result.error);
      else syncFromServer();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading || isPending}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Ajouter des photos
        </Button>
        <p className="text-muted-foreground text-xs">
          Plusieurs fichiers à la fois — glissez pour réordonner
        </p>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {images.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
          Aucune photo — ajoutez au moins une image pour publier.
        </p>
      ) : (
        <div className="space-y-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDropIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropIndex(index);
              }}
              onDragLeave={() => setDropIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(index);
              }}
              className={cn(
                "flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-start",
                dragIndex === index && "opacity-50",
                dropIndex === index && dragIndex !== null && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2 sm:flex-col">
                <GripVertical
                  className="text-muted-foreground size-4 shrink-0 cursor-grab active:cursor-grabbing"
                  aria-hidden
                />
                <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={image.url}
                    alt={image.alt ?? productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {index === 0 ? (
                    <span className="bg-primary text-primary-foreground absolute bottom-0 left-0 right-0 py-0.5 text-center text-[10px] font-medium">
                      Principale
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor={`alt-${image.id}`}>Description photo</Label>
                <Input
                  id={`alt-${image.id}`}
                  defaultValue={image.alt ?? ""}
                  placeholder={productName}
                  onBlur={(e) => updateAlt(image.id, e.target.value)}
                />
              </div>
              <div className="flex shrink-0 gap-1 sm:pt-6">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => removeImage(image.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
