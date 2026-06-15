import type { Metadata } from "next";
import Link from "next/link";

import { AdminFilterSelect } from "@/components/admin/admin-filter-select";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";
import { ProductRatingStars } from "@/components/product/product-rating-stars";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAdminReviews } from "@/lib/supabase/queries/reviews";
import type { ProductReviewStatus } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Avis clients",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<ProductReviewStatus, string> = {
  pending: "En attente",
  published: "Publié",
  rejected: "Rejeté",
};

interface AdminReviewsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const params = await searchParams;
  const status = params.status as ProductReviewStatus | undefined;
  const reviews = await listAdminReviews({ status });

  const statusOptions = (Object.keys(STATUS_LABELS) as ProductReviewStatus[]).map(
    (value) => ({
      value,
      label: STATUS_LABELS[value],
    }),
  );

  return (
    <>
      <AdminPageHeader
        title="Avis clients"
        description="Modérez les avis avant publication sur les fiches produit."
      />

      <div className="mb-4">
        <AdminFilterSelect
          paramName="status"
          options={statusOptions}
          placeholder="Tous les statuts"
        />
      </div>

      <div className="bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Avis</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center"
                >
                  Aucun avis pour ce filtre.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={`/produit/${review.productSlug}`}
                        className="font-medium hover:underline"
                      >
                        {review.productName}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {review.authorName} — {review.authorEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProductRatingStars
                      average={review.rating}
                      count={1}
                      showCount={false}
                    />
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-medium">{review.title}</p>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {review.body}
                    </p>
                    {review.orderId ? (
                      <Badge
                        variant="secondary"
                        className="mt-2 rounded-full text-[10px]"
                      >
                        Achat vérifié
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={review.status === "pending" ? "default" : "secondary"}
                    >
                      {STATUS_LABELS[review.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ReviewModerationActions
                      reviewId={review.id}
                      currentStatus={review.status}
                      productId={review.productId}
                      productSlug={review.productSlug}
                      publishedAt={review.publishedAt}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
