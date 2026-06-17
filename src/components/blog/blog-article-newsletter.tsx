import { NewsletterSignupForm } from "@/components/newsletter/newsletter-signup-form";

interface BlogArticleNewsletterProps {
  articleSlug: string;
}

export function BlogArticleNewsletter({ articleSlug }: BlogArticleNewsletterProps) {
  return (
    <section
      aria-labelledby="blog-newsletter-title"
      className="border-tilouki-jade/20 bg-tilouki-cloud/40 rounded-2xl border p-6"
    >
      <NewsletterSignupForm
        id="blog-newsletter"
        source={`blog:${articleSlug}`}
        heading="Newsletter guides d'achat"
        description="Les nouveautés du mercredi, les petits prix et les conseils tailles — une lecture utile, une fois par mois."
      />
    </section>
  );
}
