import { BlogArticleCard } from "@/components/blog/blog-article-card";
import { ButtonLink } from "@/components/ui/button-link";
import type { BlogArticle } from "@/content/blog/articles";

interface HomeCarnetSectionProps {
  articles: BlogArticle[];
}

export function HomeCarnetSection({ articles }: HomeCarnetSectionProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      className="home-maison-section maison-surface maison-surface-plum scroll-mt-20 border-y border-tilouki-brand-blue/15"
      aria-labelledby="home-carnet-title"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <p className="text-carnet-label mb-1.5">Conseils & quotidien</p>
            <h2 id="home-carnet-title" className="text-section-title text-section-title-plum">
              Le Carnet Tilouki
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
              Tailles, matières, entretien — des lectures courtes pour mieux choisir.
            </p>
          </div>
          <ButtonLink
            href="/blog"
            variant="outline"
            className="hidden min-h-10 border-tilouki-brand-blue/30 text-tilouki-navy hover:bg-tilouki-brand-blue-soft/50 sm:inline-flex"
          >
            Voir le carnet
          </ButtonLink>
        </div>

        <ul className="grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <BlogArticleCard article={article} />
            </li>
          ))}
        </ul>

        <div className="mt-6 sm:hidden">
          <ButtonLink href="/blog" variant="outline" className="min-h-11 w-full">
            Voir tout le carnet
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
