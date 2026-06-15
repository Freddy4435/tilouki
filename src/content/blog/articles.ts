export type BlogCategory =
  | "tailles"
  | "matieres"
  | "bebe"
  | "quotidien"
  | "entretien"
  | "budget";

export type BlogArticle = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  category: BlogCategory;
  readingTime: string;
  publishedAt: string;
  heroImageId: string;
  tags: string[];
  content: string;
  keyTakeaways: string[];
  published?: boolean;
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "choisir-bonne-taille-vetement-enfant",
    title: "Comment choisir la bonne taille sans se tromper",
    excerpt:
      "Choisir une taille enfant peut vite devenir un petit casse-tête. Entre les tailles en mois, les tailles en années, les marques qui taillent petit et les enfants qui…",
    metaDescription:
      "Conseils simples pour choisir la bonne taille de vêtement enfant, anticiper la croissance et éviter les achats trop justes.",
    category: "tailles",
    readingTime: "4 min",
    publishedAt: "2026-03-19",
    heroImageId: "parent-mesure-body-table",
    tags: ["tailles", "guide", "croissance", "confort"],
    content: [
      "Choisir une taille enfant peut vite devenir un petit casse-tête. Entre les tailles en mois, les tailles en années, les marques qui taillent petit et les enfants qui grandissent par poussées, il est normal d'hésiter.",
      "La première règle est simple : ne pas regarder uniquement l'âge indiqué sur l'étiquette. L'âge donne une indication, mais la taille réelle de l'enfant, sa morphologie et l'usage du vêtement comptent autant.",
      "Pour les tout-petits, mieux vaut souvent garder une petite marge. Un body, un pyjama ou une gigoteuse trop juste devient vite inconfortable, surtout si l'enfant porte encore une couche. Si vous hésitez entre deux tailles, la taille au-dessus est souvent le choix le plus prudent pour les pièces du quotidien.",
      "Pour les enfants plus grands, observez surtout la longueur des manches, l'aisance aux épaules et la taille élastique. Un pantalon peut être un peu long si le bas se retrousse proprement. En revanche, un haut trop serré aux épaules sera rarement agréable.",
      "Le type de vêtement change aussi la décision. Pour un pyjama, privilégiez le confort et la liberté de mouvement. Pour une tenue de sortie, vous pouvez choisir une coupe un peu plus ajustée, à condition que l'enfant puisse bouger facilement.",
      "Sur Tilouki, l'objectif est d'afficher les tailles disponibles clairement, sans surprise au moment du panier. Si une fiche produit indique une taille ou un âge précis, prenez le temps de comparer avec un vêtement déjà porté par l'enfant. Posez-le à plat, mesurez la longueur et comparez. C'est souvent plus fiable qu'une estimation rapide.",
    ].join("\n\n"),
    keyTakeaways: [
      "L'âge indiqué est un repère, pas une garantie.",
      "Pour le quotidien, une petite marge est souvent préférable.",
      "Comparez avec un vêtement qui va bien à l'enfant.",
      "Un vêtement confortable donne envie d'être porté plus souvent.",
    ],
  },
  {
    slug: "matieres-douces-vetements-enfants",
    title: "Les matières douces à privilégier pour le quotidien",
    excerpt:
      "Un vêtement enfant doit d'abord accompagner le mouvement. Courir, s'asseoir, dormir, jouer, se relever : les enfants vivent leurs vêtements beaucoup plus…",
    metaDescription:
      "Coton, maille, molleton, lin : quelles matières choisir pour des vêtements enfants confortables au quotidien ?",
    category: "matieres",
    readingTime: "4 min",
    publishedAt: "2026-03-12",
    heroImageId: "gros-plan-matieres-naturelles",
    tags: ["coton", "molleton", "maille", "confort"],
    content: [
      "Un vêtement enfant doit d'abord accompagner le mouvement. Courir, s'asseoir, dormir, jouer, se relever : les enfants vivent leurs vêtements beaucoup plus intensément que les adultes.",
      "Le coton reste une valeur sûre pour le quotidien. Il est facile à porter, facile à laver et agréable sur la peau. Pour les bodies, tee-shirts, pyjamas et sous-couches, c'est souvent le choix le plus simple.",
      "Le molleton est intéressant pour les sweats, joggers et pièces d'intérieur. Il apporte une sensation de chaleur et de confort sans forcément être trop épais. Une pièce en molleton peut devenir le vêtement que l'enfant choisit spontanément le matin.",
      "La maille est parfaite pour les saisons plus fraîches. Elle donne un côté enveloppant et chaleureux, surtout sur un gilet, un bonnet ou un pull. Pour un enfant, l'important est d'éviter les matières trop rêches ou qui grattent.",
      "Le lin et les mélanges légers sont agréables quand il fait plus doux. Ils donnent un rendu naturel, respirant, très joli en photo comme en vrai. Ils peuvent toutefois se froisser davantage : ce n'est pas un défaut, c'est aussi leur charme.",
      "Pour choisir, regardez toujours trois choses : la composition, l'épaisseur et l'usage. Un vêtement très doux mais fragile ne sera pas idéal pour la cour de récréation. Une matière robuste mais raide ne sera pas parfaite pour dormir.",
      "Chez Tilouki, les matières doivent devenir un vrai élément de confiance. Les fiches produit doivent expliquer simplement ce que l'enfant va ressentir : doux, chaud, léger, souple, pratique à enfiler.",
    ].join("\n\n"),
    keyTakeaways: [
      "Le coton est une base fiable.",
      "Le molleton rassure pour le confort.",
      "La maille doit être douce, pas irritante.",
      "La matière doit correspondre au moment de vie.",
    ],
  },
  {
    slug: "indispensables-bebe-premiers-mois",
    title: "Les indispensables bébé pour les premiers mois",
    excerpt:
      "Les premiers mois, le vestiaire bébé doit rester simple. On a souvent envie de tout prévoir, mais les pièces les plus utilisées sont rarement les plus compliquées.",
    metaDescription:
      "Une liste simple pour composer un petit vestiaire bébé utile, doux et facile à utiliser les premiers mois.",
    category: "bebe",
    readingTime: "5 min",
    publishedAt: "2026-03-05",
    heroImageId: "body-bonnet-pyjama-lit",
    tags: ["bébé", "body", "pyjama", "premiers mois"],
    content: [
      "Les premiers mois, le vestiaire bébé doit rester simple. On a souvent envie de tout prévoir, mais les pièces les plus utilisées sont rarement les plus compliquées.",
      "Le body est la base. Il se porte sous presque tout, maintient bien le ventre couvert et accompagne les changes répétés. Les ouvertures pratiques font vraiment la différence : pressions bien placées, encolure facile, matière souple.",
      "Le pyjama est l'autre essentiel. Un bébé passe beaucoup de temps à dormir ou à se reposer. Un pyjama confortable, facile à ouvrir et adapté à la saison est souvent plus utile qu'une tenue habillée.",
      "Une petite maille ou un gilet peut compléter le vestiaire. L'avantage du gilet est qu'il s'enfile et se retire facilement, sans devoir trop manipuler l'enfant. C'est pratique quand la température change dans la journée.",
      "Les chaussettes et bonnets peuvent être utiles selon la saison, surtout pour les sorties. L'objectif n'est pas de multiplier les accessoires, mais d'avoir quelques pièces simples sous la main.",
      "Pour ne pas acheter trop, pensez en rotation : quelques bodies, quelques pyjamas, une ou deux pièces chaudes, et des vêtements faciles à laver. Les premiers mois, le confort et la praticité comptent plus que la quantité.",
      "Le bon vestiaire bébé est celui que l'on utilise vraiment. Des pièces douces, faciles à associer et faciles à entretenir permettent de gagner du temps tout en gardant un univers tendre.",
    ].join("\n\n"),
    keyTakeaways: [
      "Body + pyjama = base du vestiaire bébé.",
      "Les ouvertures pratiques changent tout.",
      "Mieux vaut peu de pièces bien choisies.",
      "La douceur doit aller avec la facilité d'entretien.",
    ],
  },
  {
    slug: "choisir-pyjama-enfant-nuit-confortable",
    title: "Pyjama enfant : comment choisir pour une nuit plus confortable",
    excerpt:
      "Le pyjama est plus qu'un vêtement de nuit. C'est souvent le début du rituel du soir : bain, histoire, lumière douce, moment calme. Un bon pyjama doit donc être…",
    metaDescription:
      "Conseils pour choisir un pyjama enfant confortable selon la saison, la matière et les habitudes du soir.",
    category: "quotidien",
    readingTime: "4 min",
    publishedAt: "2026-02-26",
    heroImageId: "pyjama-plie-lit-soir",
    tags: ["pyjama", "nuit", "rituel", "confort"],
    content: [
      "Le pyjama est plus qu'un vêtement de nuit. C'est souvent le début du rituel du soir : bain, histoire, lumière douce, moment calme. Un bon pyjama doit donc être agréable, simple et rassurant.",
      "La première question est la saison. Quand il fait frais, une matière un peu plus chaude peut être bienvenue. Quand la chambre est tempérée, un coton léger peut suffire. L'important est d'éviter les extrêmes : trop chaud, l'enfant se découvre ; trop léger, il peut se réveiller.",
      "La coupe compte beaucoup. Un pyjama doit permettre de bouger, de se retourner, de s'asseoir dans le lit pour lire une histoire. Les poignets et chevilles peuvent aider à garder le vêtement en place, mais ils ne doivent pas serrer.",
      "La facilité d'enfilage est aussi un point important. Pour les plus petits, les pressions ou fermetures pratiques aident les parents. Pour les enfants qui commencent à s'habiller seuls, une coupe simple les encourage à participer.",
      "Les couleurs peuvent aussi participer au rituel. Les tons doux, les motifs calmes et les matières naturelles créent une sensation plus paisible qu'un pyjama très chargé visuellement.",
      "Sur Tilouki, une sélection pyjama doit pouvoir raconter tout cela : confort, saison, douceur, mouvement. Une fiche produit peut indiquer si le pyjama est plutôt léger, chaud, facile à enfiler ou adapté aux nuits fraîches.",
    ].join("\n\n"),
    keyTakeaways: [
      "Le pyjama accompagne le rituel du soir.",
      "La matière doit suivre la saison.",
      "Une coupe confortable aide l'enfant à bouger librement.",
      "Les couleurs douces renforcent l'ambiance calme.",
    ],
  },
  {
    slug: "composer-tenue-enfant-simple-trois-pieces",
    title: "Composer une tenue enfant simple en trois pièces",
    excerpt:
      "Composer une tenue enfant ne devrait pas prendre trop de temps. Une bonne tenue est celle qui fonctionne dans la vraie vie : elle tient la journée, elle se lave…",
    metaDescription:
      "Une méthode simple pour composer une tenue enfant pratique, jolie et facile à porter.",
    category: "quotidien",
    readingTime: "4 min",
    publishedAt: "2026-02-19",
    heroImageId: "trois-pieces-tenue-enfant",
    tags: ["tenue", "association", "couleurs", "pratique"],
    content: [
      "Composer une tenue enfant ne devrait pas prendre trop de temps. Une bonne tenue est celle qui fonctionne dans la vraie vie : elle tient la journée, elle se lave facilement, et l'enfant peut bouger.",
      "La méthode la plus simple consiste à penser en trois pièces : une base, une pièce confort, une touche utile.",
      "La base peut être un tee-shirt, un body, une blouse ou un haut simple. Elle doit être agréable sur la peau et facile à associer. Les couleurs naturelles ou douces permettent de créer plusieurs tenues sans réfléchir trop longtemps.",
      "La pièce confort est souvent le bas : legging, pantalon souple, jogger, short selon la saison. Pour les enfants, l'aisance est essentielle. Une taille élastique, une coupe souple et une matière qui suit le mouvement font la différence.",
      "La touche utile complète la tenue : gilet, sweat, bonnet, chaussettes, petit accessoire. Elle apporte de la chaleur, du style ou une solution pratique pour la journée.",
      "Pour éviter les associations compliquées, gardez une palette cohérente : deux tons neutres et une couleur douce. Par exemple : écru, jade et jaune beurre ; ou blanc chaud, denim clair et rose poudré.",
      "Les « looks prêts » de Tilouki peuvent partir de cette méthode. Le but n'est pas de figer les enfants dans des tenues parfaites, mais d'aider les parents à choisir vite et bien.",
    ].join("\n\n"),
    keyTakeaways: [
      "Base + confort + touche utile = tenue simple.",
      "Les couleurs cohérentes facilitent le choix.",
      "Le mouvement passe avant la tenue parfaite.",
      "Une tenue réussie doit être facile à vivre.",
    ],
  },
  {
    slug: "entretenir-vetements-enfants-garder-plus-longtemps",
    title: "Entretenir les vêtements enfants pour les garder plus longtemps",
    excerpt:
      "Les vêtements enfants vivent beaucoup : repas, jeux, cour de récréation, siestes, sorties. Un bon entretien permet de les garder plus longtemps et de conserver leur…",
    metaDescription:
      "Des gestes simples pour laver, sécher et ranger les vêtements enfants afin de les garder plus longtemps.",
    category: "entretien",
    readingTime: "5 min",
    publishedAt: "2026-02-12",
    heroImageId: "linge-enfant-etiquette-lavage",
    tags: ["entretien", "lavage", "rangement", "durabilité"],
    content: [
      "Les vêtements enfants vivent beaucoup : repas, jeux, cour de récréation, siestes, sorties. Un bon entretien permet de les garder plus longtemps et de conserver leur douceur.",
      "Le premier réflexe est de lire l'étiquette. Elle indique la température, le séchage et les précautions utiles. Cela prend quelques secondes et évite beaucoup de mauvaises surprises.",
      "Pour le quotidien, un lavage doux suffit souvent. Inutile de laver trop chaud si le vêtement n'est pas très sale. Les couleurs restent plus belles, les fibres fatiguent moins, et les pièces gardent mieux leur forme.",
      "Retourner certains vêtements avant lavage peut aider à protéger les imprimés, broderies ou surfaces visibles. Fermer les pressions, boutons ou zips limite aussi les accrochages.",
      "Le séchage est un autre point important. Le sèche-linge peut être pratique, mais il fatigue parfois les fibres et peut faire rétrécir certaines pièces. Quand c'est possible, un séchage à l'air libre est plus doux.",
      "Pour les taches, mieux vaut agir vite mais sans frotter brutalement. Tamponner, prétraiter doucement, puis laver selon l'étiquette. Une tache traitée calmement a souvent plus de chances de partir qu'une tache frottée trop fort.",
      "Enfin, le rangement compte. Plier les mailles lourdes évite qu'elles se déforment sur cintre. Garder les tailles par piles ou paniers simplifie aussi les matins pressés.",
    ].join("\n\n"),
    keyTakeaways: [
      "Lire l'étiquette reste le meilleur réflexe.",
      "Laver doux prolonge la vie des pièces.",
      "Le séchage à l'air libre est souvent plus respectueux.",
      "Un bon rangement rend le vestiaire plus facile à utiliser.",
    ],
  },
  {
    slug: "reconnaitre-vetement-enfant-qui-dure",
    title: "Reconnaître un vêtement enfant qui va durer",
    excerpt:
      "Un vêtement qui dure ne se reconnaît pas seulement à son prix. Certains détails donnent rapidement des indices : la matière, les coutures, les finitions, la tenue du tissu.",
    metaDescription:
      "Les points à observer pour choisir un vêtement enfant plus durable : coutures, matière, coupe, finitions.",
    category: "matieres",
    readingTime: "4 min",
    publishedAt: "2026-02-05",
    heroImageId: "detail-couture-tissu",
    tags: ["qualité", "coutures", "durabilité", "matières"],
    content: [
      "Un vêtement qui dure ne se reconnaît pas seulement à son prix. Certains détails donnent rapidement des indices : la matière, les coutures, les finitions, la tenue du tissu.",
      "Commencez par toucher la matière. Un tissu trop fin peut être agréable au premier regard, mais il résiste parfois moins bien aux lavages répétés. Une matière souple, stable et pas trop transparente inspire souvent plus confiance.",
      "Regardez les coutures. Elles doivent être régulières, sans fils qui pendent partout. Les zones sollicitées, comme l'entrejambe d'un pantalon ou les épaules d'un haut, méritent une attention particulière.",
      "Les boutons, pressions et fermetures doivent être bien fixés. Pour les enfants, ces éléments sont manipulés souvent, parfois vite. Une pression fragile ou un bouton mal cousu devient vite un problème.",
      "La coupe est aussi un facteur de durée. Un vêtement trop ajusté sera porté moins longtemps. Une coupe confortable, avec un peu d'aisance, accompagne mieux la croissance et les mouvements.",
      "Enfin, pensez à l'entretien. Une pièce très délicate peut être magnifique, mais si elle ne supporte pas le quotidien, elle restera au placard. Pour un vestiaire enfant, la beauté doit rester compatible avec la vraie vie.",
      "Sur Tilouki, chaque fiche produit devrait aider à comprendre ces points : composition, détails, état, conseil d'entretien, coupe. Plus l'information est claire, plus l'achat est rassurant.",
    ].join("\n\n"),
    keyTakeaways: [
      "Les coutures et finitions disent beaucoup.",
      "Une coupe avec aisance dure souvent plus longtemps.",
      "La matière doit être belle et pratique.",
      "La transparence des fiches produit renforce la confiance.",
    ],
  },
  {
    slug: "valise-week-end-enfant-vetements",
    title: "Préparer une petite valise week-end pour enfant",
    excerpt:
      "Préparer une valise enfant peut vite devenir excessif. On ajoute « au cas où », puis encore une tenue, puis un pyjama de plus. Pourtant, une petite organisation suffit…",
    metaDescription:
      "Une checklist simple pour préparer une valise enfant de week-end sans trop emporter.",
    category: "quotidien",
    readingTime: "4 min",
    publishedAt: "2026-01-29",
    heroImageId: "valise-week-end-enfant",
    tags: ["week-end", "valise", "organisation", "voyage"],
    content: [
      "Préparer une valise enfant peut vite devenir excessif. On ajoute « au cas où », puis encore une tenue, puis un pyjama de plus. Pourtant, une petite organisation suffit souvent.",
      "Commencez par les moments de la journée : dormir, jouer, sortir, se changer. Pour un week-end, prévoyez une tenue par jour, une tenue de secours, un pyjama, une pièce chaude et quelques petits essentiels.",
      "Le pyjama doit être confortable et adapté au lieu où l'enfant dort. Chez des proches, en gîte ou à l'hôtel, la température peut changer. Une pièce facile à superposer aide à s'adapter.",
      "Pour la journée, choisissez des vêtements qui vont ensemble. Deux hauts compatibles avec le même pantalon, un gilet qui fonctionne avec tout, des couleurs faciles à associer. Cela évite de devoir recomposer une valise entière.",
      "Les chaussettes et sous-vêtements méritent toujours un petit surplus. Ce sont les pièces qui se salissent ou se perdent le plus facilement.",
      "Ajoutez un sac pour le linge sale. Ce détail tout simple rend le retour beaucoup plus facile. Si un vêtement est mouillé ou taché, il ne se mélange pas au reste.",
      "Une bonne valise n'est pas la plus remplie. C'est celle où chaque pièce a une vraie utilité.",
    ].join("\n\n"),
    keyTakeaways: [
      "Pensez par moments : nuit, journée, sortie, secours.",
      "Choisissez des pièces qui s'associent entre elles.",
      "Prévoyez un sac pour le linge sale.",
      "Une valise simple rend le week-end plus léger.",
    ],
  },
  {
    slug: "couleurs-douces-garde-robe-enfant",
    title: "Les couleurs douces dans la garde-robe enfant",
    excerpt:
      "Les couleurs douces sont rassurantes, mais elles peuvent devenir monotones si elles sont toutes trop proches. Le secret est de créer une palette simple avec quelques contrastes.",
    metaDescription:
      "Comment utiliser les couleurs douces dans une garde-robe enfant sans tomber dans un style monotone.",
    category: "quotidien",
    readingTime: "4 min",
    publishedAt: "2026-01-22",
    heroImageId: "palette-couleurs-douces",
    tags: ["couleurs", "palette", "style", "garde-robe"],
    content: [
      "Les couleurs douces sont rassurantes, mais elles peuvent devenir monotones si elles sont toutes trop proches. Le secret est de créer une palette simple avec quelques contrastes.",
      "Une bonne base commence souvent par des tons clairs : blanc chaud, écru, gris doux, beige léger. Ces couleurs se marient facilement et laissent respirer la tenue.",
      "Ajoutez ensuite une couleur calme : jade, bleu doux, vert sauge, rose poudré. Elle donne une identité sans prendre toute la place. Pour un enfant, ces tons fonctionnent bien sur un sweat, un gilet, une blouse ou un pyjama.",
      "Enfin, une petite touche plus vive peut réveiller l'ensemble : jaune beurre, rouge tomate doux, terracotta, prune. L'idée n'est pas de faire une tenue très colorée, mais d'ajouter un point de joie.",
      "Pour éviter l'effet uniforme, jouez aussi avec les matières. Un coton lisse, une maille, un molleton ou un lin ne renvoient pas la lumière de la même façon. Deux vêtements de même couleur peuvent paraître très différents selon leur texture.",
      "Chez Tilouki, les couleurs peuvent devenir une signature : douce, chaude, rassurante, mais jamais fade. Une palette enfant n'a pas besoin d'être criarde pour être joyeuse.",
    ].join("\n\n"),
    keyTakeaways: [
      "Une palette douce a besoin de contraste.",
      "Le jade, le bleu doux et le jaune beurre fonctionnent bien ensemble.",
      "La texture évite la monotonie.",
      "Une touche vive suffit souvent.",
    ],
  },
  {
    slug: "acheter-vetements-enfants-malin-petits-prix",
    title: "Acheter malin sans perdre en douceur",
    excerpt:
      "Acheter à petit prix ne veut pas dire acheter au hasard. Pour les vêtements enfants, un bon achat est celui qui sera vraiment porté, lavé, reporté, puis peut-être transmis.",
    metaDescription:
      "Comment choisir des vêtements enfants à petit prix sans sacrifier le confort, la qualité et la confiance.",
    category: "budget",
    readingTime: "4 min",
    publishedAt: "2026-01-15",
    heroImageId: "pile-vetements-petits-prix",
    tags: ["budget", "petits prix", "basiques", "achat malin"],
    content: [
      "Acheter à petit prix ne veut pas dire acheter au hasard. Pour les vêtements enfants, un bon achat est celui qui sera vraiment porté, lavé, reporté, puis peut-être transmis.",
      "Avant de regarder le prix, regardez l'usage. Un tee-shirt du quotidien, un pyjama, un jogging ou une paire de chaussettes seront souvent portés plus souvent qu'une pièce très spéciale. Ce sont de bons endroits pour chercher les petits prix.",
      "La composition reste importante. Un prix doux est intéressant si la matière reste agréable et si le vêtement supporte le quotidien. Une pièce inconfortable, même peu chère, finit souvent au fond du tiroir.",
      "Vérifiez aussi les tailles disponibles. Acheter trop petit parce que le prix est attractif n'est pas une bonne affaire. Si l'enfant est entre deux tailles, mieux vaut souvent prendre la taille au-dessus pour les pièces simples.",
      "Les petits prix peuvent aussi servir à compléter une tenue : un legging, un body, un t-shirt, un bonnet, des chaussettes. Ces basiques facilitent le quotidien.",
      "Chez Tilouki, la section « petits prix » doit rester claire : prix lisible, stock visible, taille indiquée, photo honnête. La confiance ne doit pas diminuer quand le prix baisse.",
    ].join("\n\n"),
    keyTakeaways: [
      "Un bon petit prix doit être vraiment utile.",
      "Le confort reste prioritaire.",
      "Attention aux tailles trop justes.",
      "Les basiques sont les meilleurs achats malins.",
    ],
  },
];

export function getPublishedBlogArticles(): BlogArticle[] {
  return blogArticles
    .filter((article) => article.published !== false)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug);
}

export function getBlogArticlesByCategory(category: BlogCategory): BlogArticle[] {
  return getPublishedBlogArticles().filter((article) => article.category === category);
}

export function getAllBlogSlugs(): string[] {
  return getPublishedBlogArticles().map((article) => article.slug);
}
