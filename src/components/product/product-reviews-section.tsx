import { ProductRatingStars } from "@/components/product/product-rating-stars";
import { ProductReviewForm } from "@/components/product/product-review-form";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { formatRatingAverage } from "@/lib/reviews/ratings";
import {
  REVIEWS_PAGE_SIZE,
  getPublishedReviewsForProduct,
} from "@/lib/supabase/queries/reviews";
import { countPaidPurchasesForProduct } from "@/lib/supabase/queries/product-sales";
import type { ProductReview } from "@/types/catalog";

interface ProductReviewsSectionProps {
  productId: string;
  productSlug: string;
  page?: number;
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article className="border-border/70 space-y-2 border-b py-5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <ProductRatingStars
          average={review.rating}
          count={1}
          showCount={false}
          size="md"
        />
        <p className="font-semibold">{review.title}</p>
        {review.verifiedPurchase ? (
          <Badge variant="secondary" className="rounded-full text-[10px]">
            Achat vérifié
          </Badge>
        ) : null}
      </div>
      <p className="text-muted-foreground text-xs">
        {review.authorName} —{" "}
        {new Date(review.publishedAt ?? review.createdAt).toLocaleDateString("fr-FR")}
      </p>
      <p className="text-sm leading-relaxed">{review.body}</p>
    </article>
  );
}

function RatingDistribution({
  average,
  count,
  distribution,
}: {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}) {
  return (
    <div className="bg-card rounded-[var(--radius-card)] border p-5">
      <div className="flex items-end gap-3">
        <p className="font-heading text-4xl font-bold tabular-nums">
          {formatRatingAverage(average)}
        </p>
        <div>
          <ProductRatingStars average={average} count={count} />
          <p className="text-muted-foreground mt-1 text-sm">
            {count} avis client{count > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {([5, 4, 3, 2, 1] as const).map((bucket) => {
          const value = distribution[bucket];
          const width = count > 0 ? Math.round((value / count) * 100) : 0;
          return (
            <div
              key={bucket}
              className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2 text-xs"
            >
              <span>{bucket}★</span>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-muted-foreground text-right tabular-nums">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function ProductReviewsSection({
  productId,
  productSlug,
  page = 1,
}: ProductReviewsSectionProps) {
  const [{ reviews, total, stats }, purchaseCount] = await Promise.all([
    getPublishedReviewsForProduct(productId, page),
    countPaidPurchasesForProduct(productId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE));
  const hasSocialProof = total > 0 || purchaseCount > 0;

  if (!hasSocialProof) {
    return null;
  }

  if (total === 0 && purchaseCount > 0) {
    return (
      <section
        className="mt-12 border-t pt-8"
        aria-labelledby="product-reviews-heading"
      >
        <p id="product-reviews-heading" className="text-muted-foreground text-sm">
          Article déjà commandé par des familles Tilouki — les premiers avis arrivent
          bientôt.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-16 border-t pt-12" aria-labelledby="product-reviews-heading">
      <h2
        id="product-reviews-heading"
        className="font-heading mb-6 text-2xl font-semibold"
      >
        Avis clients
      </h2>

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-6">
          {stats ? (
            <RatingDistribution
              average={stats.average}
              count={stats.count}
              distribution={stats.distribution}
            />
          ) : null}
          <ProductReviewForm productId={productId} productSlug={productSlug} />
        </div>

        <div>
          {reviews.length > 0 ? (
            <div>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Soyez le premier à partager votre expérience sur cet article.
            </p>
          )}

          {totalPages > 1 ? (
            <nav
              className="mt-6 flex items-center gap-2"
              aria-label="Pagination des avis"
            >
              {page > 1 ? (
                <ButtonLink
                  href={`/produit/${productSlug}?avis_page=${page - 1}#product-reviews-heading`}
                  variant="outline"
                  size="sm"
                >
                  Précédent
                </ButtonLink>
              ) : null}
              <span className="text-muted-foreground text-sm">
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <ButtonLink
                  href={`/produit/${productSlug}?avis_page=${page + 1}#product-reviews-heading`}
                  variant="outline"
                  size="sm"
                >
                  Suivant
                </ButtonLink>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}
