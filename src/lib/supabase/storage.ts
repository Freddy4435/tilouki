const PRODUCT_IMAGES_BUCKET = "product-images";

export function getProductImageStoragePath(productId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  return `${productId}/${Date.now()}-${safeName}`;
}

export function extractStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

export { PRODUCT_IMAGES_BUCKET };
