/** Modèles HTML éditables — base structurée, non substitut à un conseil juridique. */

const DISCLAIMER = `
<aside class="legal-disclaimer rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 text-sm mb-8">
  <p><strong>Document type</strong> — Ce texte est une base claire et structurée, fournie à titre indicatif.
  Il doit être relu, complété et validé par un professionnel du droit avant publication définitive.
  Les passages <em>[À PERSONNALISER]</em> et les variables <code>{{…}}</code> sont à adapter.</p>
</aside>
`.trim();

export const LEGAL_PAGE_SLUGS = [
  "mentions-legales",
  "cgv",
  "confidentialite",
  "cookies",
  "livraison-retours",
  "formulaire-retractation",
] as const;

export type LegalPageSlug = (typeof LEGAL_PAGE_SLUGS)[number];

export const LEGAL_PAGE_ROUTES: Record<LegalPageSlug, string> = {
  "mentions-legales": "/mentions-legales",
  cgv: "/cgv",
  confidentialite: "/confidentialite",
  cookies: "/cookies",
  "livraison-retours": "/livraison-retours",
  "formulaire-retractation": "/formulaire-retractation",
};

export const LEGAL_PLACEHOLDER_KEYS = [
  "shop_name",
  "legal_name",
  "legal_status",
  "siret",
  "address",
  "email",
  "phone",
  "host_name",
  "host_address",
  "host_phone",
  "site_url",
  "currency",
  "vat_notice",
  "vat_section",
  "rep_section",
  "mediation_section",
  "payment_method",
  "delivery_method",
  "shipping_info",
] as const;

const templates: Record<LegalPageSlug, { title: string; content: string }> = {
  "mentions-legales": {
    title: "Mentions légales",
    content: `${DISCLAIMER}

<h2>Éditeur du site</h2>
<p><strong>{{shop_name}}</strong> — site {{site_url}}</p>
<ul>
  <li><strong>Statut :</strong> {{legal_status}}</li>
  <li><strong>Nom / dénomination :</strong> {{legal_name}}</li>
  <li><strong>SIRET :</strong> {{siret}}</li>
  <li><strong>Adresse :</strong> {{address}}</li>
  <li><strong>E-mail :</strong> {{email}}</li>
  <li><strong>Téléphone :</strong> {{phone}}</li>
</ul>
{{vat_section}}
{{rep_section}}

<h2>Directeur de la publication</h2>
<p>[À PERSONNALISER : nom du responsable de publication]</p>

<h2>Hébergement</h2>
<ul>
  <li><strong>Hébergeur :</strong> {{host_name}}</li>
  <li><strong>Adresse :</strong> {{host_address}}</li>
  <li><strong>Téléphone :</strong> {{host_phone}}</li>
</ul>

<h2>Propriété intellectuelle</h2>
<p>Les contenus du site (textes, images, graphismes, logo) sont la propriété de {{legal_name}} ou de leurs auteurs respectifs.
Toute reproduction sans autorisation est interdite.</p>

<h2>Données personnelles</h2>
<p>Le traitement des données est décrit dans la <a href="/confidentialite">politique de confidentialité</a>.</p>`,
  },

  cgv: {
    title: "Conditions générales de vente",
    content: `${DISCLAIMER}

<h2>1. Objet</h2>
<p>Les présentes conditions générales de vente (CGV) régissent les ventes de vêtements pour enfants proposées sur {{site_url}}
par {{legal_name}} ({{legal_status}}), ci-après « le Vendeur », au client consommateur.</p>

<h2>2. Identité du Vendeur</h2>
<ul>
  <li>{{legal_name}} — {{legal_status}}</li>
  <li>SIRET : {{siret}}</li>
  <li>Adresse : {{address}}</li>
  <li>E-mail : {{email}} — Téléphone : {{phone}}</li>
</ul>
{{vat_section}}
{{rep_section}}

<h2>3. Produits et prix</h2>
<p>Les produits sont décrits avec le plus de précision possible. Les photographies ne sont pas contractuelles.</p>
<p>Les prix sont indiqués en {{currency}} (euros), toutes taxes comprises le cas échéant. {{vat_notice}}</p>
<p>[À PERSONNALISER : précisions sur promotions, erreurs de prix, disponibilité]</p>

<h2>4. Commande</h2>
<p>Le client sélectionne les articles, le point relais et valide sa commande après acceptation des présentes CGV.</p>
<p>Une confirmation est envoyée par e-mail. Le Vendeur peut annuler une commande en cas d'indisponibilité ou d'incident de paiement.</p>

<h2>5. Paiement</h2>
<p>{{payment_method}}</p>
<p>Le paiement est exigible immédiatement. La commande n'est définitive qu'après encaissement.</p>

<h2>6. Livraison</h2>
<p>{{delivery_method}}</p>
<p>{{shipping_info}}</p>
<p>Délais indicatifs : [À PERSONNALISER : délai moyen de préparation et délai transporteur].</p>

<h2>7. Droit de rétractation</h2>
<p>Conformément aux articles L221-18 et suivants du Code de la consommation, le client dispose d'un délai de <strong>14 jours</strong>
à compter de la réception pour exercer son droit de rétractation, sans motif.</p>
<p>Formulaire type : <a href="/formulaire-retractation">formulaire de rétractation</a>.</p>
<p>[À PERSONNALISER : modalités de retour, état des articles, frais de retour — voir page Livraison et retours]</p>

<h2>8. Garanties légales</h2>
<p><strong>Garantie légale de conformité</strong> (articles L217-4 et suivants du Code de la consommation) :
le client dispose de deux ans pour agir. [À PERSONNALISER : procédure de contact]</p>
<p><strong>Garantie des vices cachés</strong> (articles 1641 et suivants du Code civil) :
le client peut choisir entre la résolution de la vente ou une réduction du prix. [À PERSONNALISER]</p>

<h2>9. Médiation</h2>
{{mediation_section}}

<h2>10. Droit applicable</h2>
<p>Les présentes CGV sont soumises au droit français. [À PERSONNALISER : tribunal compétent si pertinent]</p>`,
  },

  confidentialite: {
    title: "Politique de confidentialité",
    content: `${DISCLAIMER}

<h2>Responsable du traitement</h2>
<p>{{legal_name}} ({{legal_status}}) — {{address}} — {{email}}</p>

<h2>Données collectées</h2>
<ul>
  <li>Identité et coordonnées (nom, prénom, e-mail, téléphone, adresse de livraison / point relais)</li>
  <li>Données de commande et de paiement (traitées par Stripe — le Vendeur ne conserve pas les numéros de carte complets)</li>
  <li>Données de navigation et cookies (voir <a href="/cookies">politique cookies</a>)</li>
</ul>

<h2>Finalités</h2>
<ul>
  <li>Gestion des commandes, livraison et service client</li>
  <li>Facturation et obligations comptables</li>
  <li>Amélioration du site et sécurité</li>
  <li>[À PERSONNALISER : newsletter, prospection si applicable et base légale]</li>
</ul>

<h2>Base légale</h2>
<p>Exécution du contrat, obligations légales, intérêt légitime. [À PERSONNALISER : consentement pour cookies non essentiels / marketing]</p>

<h2>Durée de conservation</h2>
<p>[À PERSONNALISER : durées par type de données — ex. commandes 10 ans comptables, compte client, logs]</p>

<h2>Destinataires</h2>
<ul>
  <li>Stripe (paiement)</li>
  <li>Mondial Relay (livraison point relais)</li>
  <li>Hébergeur : {{host_name}}</li>
  <li>[À PERSONNALISER : outils e-mail, analytics]</li>
</ul>

<h2>Vos droits</h2>
<p>Conformément au RGPD, vous disposez des droits d'accès, rectification, effacement, limitation, opposition et portabilité.
Contact : {{email}}. Réclamation possible auprès de la CNIL (www.cnil.fr).</p>`,
  },

  cookies: {
    title: "Politique de cookies",
    content: `${DISCLAIMER}

<h2>Qu'est-ce qu'un cookie ?</h2>
<p>Un cookie est un petit fichier déposé sur votre terminal lors de la visite du site {{site_url}}.</p>

<h2>Cookies utilisés</h2>
<h3>Cookies strictement nécessaires</h3>
<p>Indispensables au panier, à la session et au paiement. Ils ne nécessitent pas de consentement.</p>

<h3>Cookies de mesure d'audience</h3>
<p>[À PERSONNALISER : lister les outils — ex. aucun, ou Matomo/Plausible avec consentement]</p>

<h3>Cookies tiers</h3>
<p>Stripe peut déposer des cookies lors du paiement. [À PERSONNALISER : détail des cookies Stripe si nécessaire]</p>

<h2>Gestion des cookies</h2>
<p>Vous pouvez configurer votre navigateur pour refuser les cookies. Certaines fonctionnalités du site pourraient être dégradées.</p>
<p>[À PERSONNALISER : bandeau de consentement et lien de gestion si mis en place]</p>

<h2>Contact</h2>
<p>{{email}}</p>`,
  },

  "livraison-retours": {
    title: "Livraison et retours",
    content: `${DISCLAIMER}

<h2>Livraison</h2>
<p>{{delivery_method}}</p>
<p>{{shipping_info}}</p>
<p>Les délais affichés lors de la commande sont indicatifs. [À PERSONNALISER : zone géographique couverte]</p>

<h2>Suivi</h2>
<p>Un numéro de suivi de commande vous est communiqué par e-mail. Page de suivi : <a href="/suivi-commande">suivi commande</a>.</p>

<h2>Colis endommagé ou manquant</h2>
<p>[À PERSONNALISER : délai et procédure de signalement — photos, contact {{email}}]</p>

<h2>Droit de rétractation (14 jours)</h2>
<p>Vous disposez de 14 jours après réception pour retourner les articles non portés, non lavés, dans leur état d'origine avec étiquettes.</p>
<p>Téléchargez le <a href="/formulaire-retractation">formulaire de rétractation</a> et envoyez-le à {{email}}.</p>

<h2>Frais de retour</h2>
<p>[À PERSONNALISER : préciser si les frais de retour sont à la charge du client ou du vendeur, et le mode de remboursement]</p>

<h2>Remboursement</h2>
<p>Le remboursement est effectué via le même moyen de paiement, dans un délai de [À PERSONNALISER : ex. 14 jours] après réception du retour.</p>

<h2>Échanges</h2>
<p>[À PERSONNALISER : politique d'échange de taille si proposée]</p>`,
  },

  "formulaire-retractation": {
    title: "Formulaire type de rétractation",
    content: `${DISCLAIMER}

<p>Conformément à l'article L221-5 du Code de la consommation — à compléter, dater et envoyer à :</p>
<p><strong>{{legal_name}}</strong> — {{address}} — {{email}}</p>

<p>Je soussigné(e) :</p>
<p>Nom : _________________________________</p>
<p>Prénom : _________________________________</p>
<p>Adresse : _________________________________</p>
<p>E-mail : _________________________________</p>

<p>Notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous :</p>

<p>Commande n° : _________________________________</p>
<p>Date de commande : _________________________________</p>
<p>Date de réception : _________________________________</p>

<p>Produit(s) concerné(s) :</p>
<p>_________________________________________________________________</p>
<p>_________________________________________________________________</p>

<p>Date : _________________________________</p>
<p>Signature (uniquement en cas d'envoi papier) : _________________________________</p>

<p class="text-sm">[À PERSONNALISER : préciser les modalités d'envoi — e-mail, courrier recommandé, etc.]</p>`,
  },
};

export function getDefaultLegalTemplate(slug: string): { title: string; content: string } | null {
  if (!(slug in templates)) return null;
  return templates[slug as LegalPageSlug];
}

export function getAllDefaultLegalTemplates(): { slug: LegalPageSlug; title: string; content: string }[] {
  return LEGAL_PAGE_SLUGS.map((slug) => ({
    slug,
    title: templates[slug].title,
    content: templates[slug].content,
  }));
}
