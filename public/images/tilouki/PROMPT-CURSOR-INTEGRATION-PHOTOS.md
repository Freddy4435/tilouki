# Prompt Cursor - Integration des photos Tilouki

Tu es dans le projet Tilouki. Integre le pack photos fourni dans le site sans utiliser de selection aleatoire.

Objectif :

- Chaque module doit utiliser une image coherente avec son intention.
- Si l'utilisateur clique sur Garcon, afficher une photo de petit garcon.
- Si le module est Nuit calme, afficher l'image d'un enfant qui dort ou d'un rituel du soir.
- Si le module est Jour de pluie, afficher un enfant avec bottes, veste ou flaque.
- Les visuels de blog doivent correspondre au sujet de l'article.

Actions :

1. Copier le dossier `tilouki-pack-photos-2026` dans le dossier public du site, par exemple `public/images/tilouki/`.
2. Lire `manifest-photos-tilouki.json` et creer un mapping central, par exemple `src/lib/tilouki-images.ts`.
3. Remplacer toutes les images placeholder, generiques ou aleatoires par ce mapping.
4. Interdire les affectations aleatoires pour les categories, modules editoriaux, blocs home et articles de blog.
5. Garder les vraies photos produits si elles existent deja. Le pack sert aux categories, ambiances, home, blog et guides.
6. Utiliser les textes `alt` du manifeste pour l'accessibilite.
7. Mettre les images en responsive avec `object-fit: cover`, des ratios stables et aucun etirement.

Mapping prioritaire :

- `garcon` -> `01-categories/categorie-garcon-look-moderne.jpg`
- `fille` -> `01-categories/categorie-fille-look-doux.jpg`
- `bebe` -> `01-categories/categorie-bebe-combinaison-grise.jpg`
- `pyjamas` -> `01-categories/categorie-pyjama-fille-doudou.jpg`
- `pluie` -> `01-categories/categorie-pluie-garcon-bottes.jpg`
- `nuit-calme` -> `02-rituels-et-moments/rituel-nuit-calme-enfant-dort.jpg`
- `jour-de-pluie` -> `02-rituels-et-moments/rituel-jour-de-pluie-flaque.jpg`
- `lecture-soir` -> `02-rituels-et-moments/rituel-lecture-au-lit-pyjama.jpg`
- `cocooning-bebe` -> `02-rituels-et-moments/rituel-bebe-panier-cocon.jpg`
- `hero-home` -> `03-home-et-marque/home-hero-dressing-couleurs.jpg`
- `blog-pyjama` -> `04-blog/blog-bien-choisir-pyjama.jpg`
- `blog-pluie` -> `04-blog/blog-pluie-bottes-et-veste.jpg`
- `blog-dressing` -> `04-blog/blog-organisation-dressing.jpg`

Contraintes qualite :

- Ne pas afficher une image d'adulte seul dans un module enfant.
- Ne pas afficher une photo de vetement pose pour un module emotionnel comme Nuit calme.
- Ne pas afficher une photo de soleil/ete pour Jour de pluie.
- Prevoir un fallback coherent par famille, jamais un fallback random.
- Verifier les pages mobile et desktop apres integration.

Livrable attendu :

- Un mapping d'images centralise.
- Les composants categories, home, rituels et blog branches sur ce mapping.
- Une verification visuelle rapide indiquant les pages modifiees.
