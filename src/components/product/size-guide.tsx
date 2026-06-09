export function SizeGuide() {
  return (
    <div className="bg-muted/50 rounded-xl border p-4 text-sm">
      <p className="font-medium">Guide des tailles</p>
      <p className="text-muted-foreground mt-2 leading-relaxed">
        Les tailles affichées correspondent aux indications sur chaque étiquette produit.
        En cas de doute entre deux tailles, privilégiez la taille au-dessus pour laisser
        de la marge de croissance.
      </p>
      <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-1 text-xs">
        <li>3M / 6M / 9M : bébé</li>
        <li>12M / 18M / 24M : tout-petit</li>
        <li>2A à 6A : enfant</li>
      </ul>
    </div>
  );
}
