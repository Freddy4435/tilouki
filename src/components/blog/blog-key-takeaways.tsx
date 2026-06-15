import { Sparkles } from "lucide-react";

interface BlogKeyTakeawaysProps {
  items: string[];
}

export function BlogKeyTakeaways({ items }: BlogKeyTakeawaysProps) {
  if (items.length === 0) return null;

  return (
    <aside
      id="a-retenir"
      className="border-tilouki-plum/15 bg-tilouki-plum-soft/80 rounded-2xl border p-6"
      aria-labelledby="blog-key-takeaways-title"
    >
      <h2
        id="blog-key-takeaways-title"
        className="font-heading text-tilouki-plum mb-4 flex items-center gap-2 text-lg font-semibold"
      >
        <Sparkles className="size-5" aria-hidden />
        À retenir
      </h2>
      <ul className="space-y-2 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-tilouki-plum mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
