import { cn } from "@/lib/utils";

interface LegalPageShellProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function LegalPageShell({ title, children, className }: LegalPageShellProps) {
  return (
    <article className={cn("container-tilouki section-tilouki max-w-3xl", className)}>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
      </header>
      <div className="prose prose-neutral text-muted-foreground max-w-none text-sm leading-relaxed [&_.legal-disclaimer]:not-prose [&_.legal-review]:not-prose [&_.legal-disclaimer]:text-amber-950 [&_.legal-review]:rounded-lg [&_.legal-review]:border [&_.legal-review]:border-dashed [&_.legal-review]:border-amber-300 [&_.legal-review]:bg-amber-50/80 [&_.legal-review]:p-3 [&_.legal-review]:text-amber-950 [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold">
        {children}
      </div>
    </article>
  );
}
