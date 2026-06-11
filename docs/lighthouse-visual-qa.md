# QA visuelle & Lighthouse — Tilouki

Checklist manuelle avant merge de la PR « crédibilité visuelle ».

## Prérequis

- `npm run build && npm run start` (ou déploiement preview Vercel)
- Chrome DevTools → Lighthouse, mode **Mobile**, catégories **Performance** + **Accessibilité**
- Navigation privée recommandée (extensions désactivées)

## Pages à auditer

| Page | URL | Seuil cible |
|------|-----|-------------|
| Accueil | `/` | Perf ≥ 90, A11y ≥ 90 |
| Fiche produit | `/produit/<slug-avec-images>` | Perf ≥ 90, A11y ≥ 90 |

## Accueil — points de contrôle

- [ ] Hero : photo admin à droite si `hero_image_url` renseigné ; illustration CSS sinon
- [ ] Bandeau réassurance : Stripe, livraison point relais dès X €, retours 14 j, boutique française
- [ ] Cartes produit : légère élévation au survol (desktop)
- [ ] Images catalogue home : `loading="lazy"` sauf 1ère rangée (`priority`)

## Fiche produit — points de contrôle

- [ ] Galerie : zoom au survol (desktop), swipe gauche/droite (mobile)
- [ ] Badge « Dernières pièces » si variante en stock ≤ 2
- [ ] Bouton « Ajouter au panier » : check animé + libellé « Ajouté ! »
- [ ] Drawer panier : sous-total visible en bas pendant le scroll

## Catalogue — points de contrôle

- [ ] Tri (Nouveautés / Prix croissant / Prix décroissant) reflété dans l’URL (`?tri=…`)
- [ ] Puces filtres actifs supprimables + « Tout effacer »
- [ ] Skeleton visible pendant le chargement

## Admin — hero

- [ ] `/admin/parametres` → section vitrine → upload hero
- [ ] Image stockée dans le bucket `product-images` sous `shop/hero/`
- [ ] Revalidation accueil après upload

## Performance (Lighthouse)

Si score < 90 :

1. Vérifier que le hero utilise `priority` et `sizes` adaptés
2. Vérifier que les images produit ont `sizes` cohérents avec la grille
3. Pas d’images LCP hors `next/image`
4. Pas de scripts tiers bloquants sur la home (widget MR uniquement sur checkout)

## Accessibilité

- [ ] Contraste texte / fond conforme (tokens `tilouki-theme.css`)
- [ ] Boutons filtres et tri accessibles au clavier
- [ ] Textes alternatifs sur images produit et hero
- [ ] `sr-only` sur actions icône (retirer filtre, etc.)

## Commande

```bash
npm run check   # lint + typecheck + tests
npm run build
npm run start
# puis Lighthouse sur http://localhost:3000
```
