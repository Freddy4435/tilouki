/** Modèles HTML éditables — base structurée, non substitut à un conseil juridique. */

const DISCLAIMER = `
<aside class="legal-disclaimer rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 text-sm mb-8">
  <p><strong>Document type</strong> — Ce texte constitue une base claire et structurée pour une boutique en ligne française.
  Il ne constitue pas un conseil juridique. Les passages marqués <em>« À valider avec un professionnel du droit »</em>
  doivent être relus par la vendeuse ou son conseil avant publication définitive.</p>
</aside>
`.trim();

const LEGAL_REVIEW = (text: string) =>
  `<p class="legal-review"><em>À valider avec un professionnel du droit :</em> ${text}</p>`;

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

/** Libellés affichés dans l'admin et les checklists légales. */
export const LEGAL_PAGE_LABELS: Record<LegalPageSlug, string> = {
  "mentions-legales": "Mentions légales",
  cgv: "Conditions générales de vente (CGV)",
  confidentialite: "Politique de confidentialité (RGPD)",
  cookies: "Politique cookies",
  "livraison-retours": "Livraison, retours et remboursements",
  "formulaire-retractation": "Formulaire de rétractation",
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
  "host_email",
  "mediation_name",
  "site_url",
  "currency",
  "vat_notice",
  "vat_section",
  "rep_section",
  "mediation_section",
  "rcs_section",
  "payment_method",
  "delivery_method",
  "shipping_info",
  "delivery_delays_info",
  "withdrawal_info",
  "return_info",
  "exchange_section",
  "analytics_section",
  "recipients_section",
] as const;

const templates: Record<LegalPageSlug, { title: string; content: string }> = {
  "mentions-legales": {
    title: "Mentions légales",
    content: `${DISCLAIMER}

<h2>1. Éditeur du site</h2>
<p>Le site <strong>{{site_url}}</strong> est édité par :</p>
<ul>
  <li><strong>Nom commercial :</strong> {{shop_name}}</li>
  <li><strong>Nom / dénomination :</strong> {{legal_name}}</li>
  <li><strong>Statut :</strong> {{legal_status}}</li>
  <li><strong>SIRET :</strong> {{siret}}</li>
  <li><strong>Adresse :</strong> {{address}}</li>
  <li><strong>E-mail :</strong> <a href="mailto:{{email}}">{{email}}</a></li>
  <li><strong>Téléphone :</strong> {{phone}}</li>
</ul>
{{rcs_section}}
{{vat_section}}
{{rep_section}}

<h2>2. Directeur de la publication</h2>
<p>{{legal_name}}, en qualité de responsable de la publication.</p>

<h2>3. Hébergement</h2>
<p>Le site est hébergé par :</p>
<ul>
  <li><strong>Hébergeur :</strong> {{host_name}}</li>
  <li><strong>Adresse :</strong> {{host_address}}</li>
  <li><strong>E-mail :</strong> {{host_email}}</li>
  <li><strong>Téléphone :</strong> {{host_phone}}</li>
</ul>

<h2>4. Propriété intellectuelle</h2>
<p>L'ensemble des éléments du site (textes, photographies de produits, illustrations, logo, charte graphique)
est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation ou exploitation,
totale ou partielle, sans autorisation écrite préalable de {{legal_name}}, est interdite.</p>

<h2>5. Données personnelles</h2>
<p>Les modalités de collecte et de traitement des données personnelles sont décrites dans la
<a href="/confidentialite">politique de confidentialité</a>.</p>

<h2>6. Cookies</h2>
<p>Pour en savoir plus sur les traceurs utilisés, consultez la <a href="/cookies">politique cookies</a>.</p>

<h2>7. Crédits</h2>
<p>Photographies de vêtements : {{legal_name}}.</p>
${LEGAL_REVIEW("indiquez ici si certaines photos sont sous licence tierce ou crédit photographe.")}`,
  },

  cgv: {
    title: "Conditions générales de vente",
    content: `${DISCLAIMER}

<h2>1. Objet et champ d'application</h2>
<p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les ventes à distance de vêtements pour enfants
proposées sur le site <strong>{{site_url}}</strong> par {{legal_name}} ({{legal_status}}), ci-après « le Vendeur »,
à tout client consommateur au sens du Code de la consommation, ci-après « le Client ».</p>
<p>Le Client reconnaît avoir pris connaissance des présentes CGV avant la validation de sa commande et les accepter sans réserve.</p>

<h2>2. Identité du Vendeur</h2>
<ul>
  <li><strong>Nom commercial :</strong> {{shop_name}}</li>
  <li><strong>Dénomination :</strong> {{legal_name}} — {{legal_status}}</li>
  <li><strong>SIRET :</strong> {{siret}}</li>
  <li><strong>Adresse :</strong> {{address}}</li>
  <li><strong>Contact :</strong> <a href="mailto:{{email}}">{{email}}</a> — {{phone}}</li>
</ul>
{{rcs_section}}
{{vat_section}}
{{rep_section}}

<h2>3. Produits</h2>
<p>Le Vendeur commercialise des vêtements pour enfants (filles, garçons, mixte). Chaque article est décrit avec le plus
de précision possible : matière, taille, âge conseillé, couleur. Les photographies présentées sur le site sont
contractuelles dans la limite des variations d'affichage liées à l'écran du Client.</p>
<p>Les produits sont proposés dans la limite des stocks disponibles. En cas d'indisponibilité après commande,
le Vendeur en informe le Client et procède au remboursement des sommes versées.</p>

<h2>4. Prix</h2>
<p>Les prix sont indiqués en euros ({{currency}}), {{vat_notice}}. Les frais de livraison sont indiqués séparément
avant validation de la commande.</p>
<p>Le Vendeur se réserve le droit de modifier ses prix à tout moment. Le prix facturé est celui en vigueur
au moment de la validation de la commande par le Client.</p>

<h2>5. Commande</h2>
<p>Pour passer commande, le Client sélectionne les articles (taille, couleur), choisit un point relais,
renseigne ses coordonnées, accepte les présentes CGV et procède au paiement.</p>
<h3>5.1 Information précontractuelle</h3>
<p>Avant validation de la commande, un écran récapitulatif présente : le détail des produits (références, tailles,
quantités), le prix TTC de chaque article, les frais et le mode de livraison choisi, ainsi que le montant total à payer,
conformément aux obligations d'information précontractuelle pour les contrats à distance.</p>
<h3>5.2 Obligation de paiement</h3>
<p>La validation de la commande à l'étape de paiement, par le bouton portant la mention « Payer » (ou formulation
équivalente indiquant l'obligation de paiement), vaut acceptation des présentes CGV et emporte obligation de payer
le prix indiqué au récapitulatif.</p>
<p>Une confirmation de commande est adressée par e-mail. Le contrat de vente est conclu à réception de cette confirmation,
sous réserve de l'encaissement effectif du paiement.</p>

<h2>6. Paiement</h2>
<p>{{payment_method}}</p>
<p>Le paiement est exigible immédiatement. Toute commande non payée dans les délais impartis pourra être annulée.</p>

<h2>7. Livraison</h2>
<p>{{delivery_method}}</p>
<p>{{shipping_info}}</p>
{{delivery_delays_info}}
<p>Les délais de livraison sont communiqués à titre indicatif lors de la commande. Le Vendeur ne saurait être tenu
responsable des retards imputables au transporteur, sous réserve des garanties légales applicables.</p>
<p>Le transfert des risques s'effectue au moment où le Client prend physiquement possession du colis.</p>

<h2>8. Droit de rétractation</h2>
<p>{{withdrawal_info}}</p>
<p>Pour exercer ce droit, le Client peut utiliser le <a href="/formulaire-retractation">formulaire type de rétractation</a>
ou adresser une déclaration dénuée d'ambiguïté à {{email}}.</p>
<p>{{return_info}}</p>
<p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les
biens confectionnés selon les spécifications du Client ou nettement personnalisés, ni pour les biens descellés
après livraison et ne pouvant être renvoyés pour des raisons d'hygiène ou de protection de la santé s'ils ont été descellés.</p>

<h2>9. Garanties légales</h2>
<h3>Garantie légale de conformité</h3>
<p>Conformément aux articles L217-4 et suivants du Code de la consommation, le Client dispose d'un délai de deux ans
à compter de la délivrance du bien pour obtenir la mise en conformité ou le remplacement du bien non conforme.
Le Client peut également demander une réduction du prix ou la résolution du contrat selon les conditions légales.</p>
<h3>Garantie des vices cachés</h3>
<p>Conformément aux articles 1641 et suivants du Code civil, le Client peut choisir entre la résolution de la vente
ou une réduction du prix en cas de vice caché rendant le bien impropre à l'usage auquel il est destiné.</p>
<p>Pour toute réclamation : <a href="mailto:{{email}}">{{email}}</a>.</p>

<h2>10. Médiation de la consommation</h2>
{{mediation_section}}

<h2>11. Droit applicable et litiges</h2>
<p>Les présentes CGV sont soumises au droit français. En cas de litige, le Client peut recourir à une procédure
de médiation conformément à l'article 10 ci-dessus, ou saisir les juridictions compétentes conformément aux règles
de droit commun, notamment le tribunal judiciaire du lieu de domicile du consommateur.</p>`,
  },

  confidentialite: {
    title: "Politique de confidentialité",
    content: `${DISCLAIMER}

<h2>1. Responsable du traitement</h2>
<p>{{legal_name}} ({{legal_status}}) — {{address}} — <a href="mailto:{{email}}">{{email}}</a></p>

<h2>2. Données collectées</h2>
<p>Dans le cadre de l'exploitation de la boutique en ligne {{shop_name}}, nous sommes amenés à collecter :</p>
<ul>
  <li><strong>Données d'identité :</strong> nom, prénom, adresse e-mail, numéro de téléphone</li>
  <li><strong>Données de commande :</strong> articles achetés (références, tailles, couleurs), montants, historique</li>
  <li><strong>Données de livraison :</strong> point relais Mondial Relay sélectionné, adresse de facturation le cas échéant</li>
  <li><strong>Données de paiement :</strong> traitées par Stripe ; nous ne conservons pas les numéros de carte bancaires complets</li>
  <li><strong>Données de navigation :</strong> cookies et traceurs (voir <a href="/cookies">politique cookies</a>)</li>
</ul>

<h2>3. Finalités et bases légales</h2>
<table>
  <thead><tr><th>Finalité</th><th>Base légale</th></tr></thead>
  <tbody>
    <tr><td>Gestion des commandes, livraison, facturation</td><td>Exécution du contrat</td></tr>
    <tr><td>Service client et suivi des réclamations</td><td>Exécution du contrat / intérêt légitime</td></tr>
    <tr><td>Obligations comptables et fiscales</td><td>Obligation légale</td></tr>
    <tr><td>Sécurisation du site et prévention de la fraude</td><td>Intérêt légitime</td></tr>
    <tr><td>Newsletter / prospection</td><td>${LEGAL_REVIEW("consentement explicite si une newsletter est activée.")}</td></tr>
  </tbody>
</table>

<h2>4. Durée de conservation</h2>
<ul>
  <li><strong>Données de commande :</strong> 10 ans (obligations comptables)</li>
  <li><strong>Données de contact client :</strong> 3 ans à compter du dernier contact commercial</li>
  <li><strong>Cookies :</strong> selon la durée indiquée dans la politique cookies</li>
</ul>

<h2>5. Destinataires des données</h2>
<p>Vos données peuvent être communiquées aux prestataires suivants, dans la stricte limite de leurs missions :</p>
{{recipients_section}}
<p>Ces prestataires peuvent être situés hors Union européenne ; dans ce cas, des garanties appropriées
(clauses contractuelles types, etc.) sont mises en place le cas échéant.</p>

<h2>6. Vos droits</h2>
<p>Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi « Informatique et Libertés », vous disposez des droits
d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données.</p>
<p>Pour exercer vos droits : <a href="mailto:{{email}}">{{email}}</a> ou via le
<a href="/donnees-personnelles">formulaire de demande RGPD</a>. Une réponse vous sera apportée dans un délai d'un mois.</p>
<p>Vous pouvez introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" rel="noopener noreferrer">www.cnil.fr</a>.</p>

<h2>7. Sécurité</h2>
<p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
(contenu chiffré HTTPS, accès restreint, prestataires certifiés).</p>`,
  },

  cookies: {
    title: "Politique de cookies",
    content: `${DISCLAIMER}

<h2>1. Qu'est-ce qu'un cookie ?</h2>
<p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite
du site <strong>{{site_url}}</strong>. Il permet de mémoriser des informations relatives à votre navigation.</p>

<h2>2. Cookies déposés sur ce site</h2>

<h3>2.1 Cookies strictement nécessaires</h3>
<p>Ces cookies sont indispensables au fonctionnement du site et ne nécessitent pas votre consentement :</p>
<ul>
  <li><strong>Panier et session</strong> — mémorisation des articles sélectionnés</li>
  <li><strong>Authentification admin</strong> — accès sécurisé à l'espace d'administration</li>
  <li><strong>Sécurité</strong> — protection contre les abus</li>
</ul>

<h3>2.2 Cookies de paiement (Stripe)</h3>
<p>Lors du paiement, Stripe peut déposer des cookies nécessaires à la sécurisation de la transaction et à la
prévention de la fraude. Pour plus d'informations : <a href="https://stripe.com/fr/privacy" rel="noopener noreferrer">politique de confidentialité Stripe</a>.</p>

<h3>2.3 Cookies de mesure d'audience</h3>
{{analytics_section}}

<h2>3. Durée de conservation</h2>
<p>Les cookies de session sont supprimés à la fermeture du navigateur. Les cookies persistants ont une durée
maximale de 13 mois conformément aux recommandations de la CNIL.</p>

<h2>4. Gestion de vos préférences (CNIL)</h2>
<p>Conformément aux lignes directrices de la CNIL, les cookies non essentiels (notamment de mesure d'audience)
ne sont déposés qu'après votre consentement via le bandeau affiché lors de votre première visite.
Vous pouvez refuser ou retirer votre consentement à tout moment.</p>
<p>Vous pouvez à tout moment configurer votre navigateur pour accepter ou refuser les cookies.
Le refus des cookies strictement nécessaires peut dégrader certaines fonctionnalités (panier, commande).</p>
<p>Vous pouvez modifier votre choix en supprimant le cookie de consentement (<code>tilouki-cookie-consent</code>)
dans les paramètres de votre navigateur, puis en rechargeant cette page.</p>

<h2>5. Contact</h2>
<p>Questions relatives aux cookies : <a href="mailto:{{email}}">{{email}}</a></p>`,
  },

  "livraison-retours": {
    title: "Livraison et retours",
    content: `${DISCLAIMER}

<h2>1. Zone et mode de livraison</h2>
<p>{{delivery_method}}</p>
<p>{{shipping_info}}</p>
{{delivery_delays_info}}
<p>Les colis sont préparés et expédiés depuis la France. Les délais indiqués lors de la commande sont donnés
à titre indicatif (préparation + acheminement transporteur).</p>

<h2>2. Suivi de commande</h2>
<p>Dès l'expédition, un e-mail de confirmation vous est adressé. Vous pouvez suivre l'état de votre commande
sur la page <a href="/suivi-commande">suivi commande</a> avec votre numéro de commande et votre adresse e-mail.</p>

<h2>3. Réception du colis</h2>
<p>À réception, vérifiez l'état du colis en présence du livreur ou du point relais. En cas de colis endommagé
ou de produit manquant, contactez-nous sous 48 heures à <a href="mailto:{{email}}">{{email}}</a> en joignant
des photographies du colis et de son contenu.</p>

<h2>4. Droit de rétractation (14 jours)</h2>
<p>{{withdrawal_info}}</p>
<p>Utilisez le <a href="/formulaire-retractation">formulaire type de rétractation</a> ou envoyez votre demande
à <a href="mailto:{{email}}">{{email}}</a> en précisant votre numéro de commande et les articles concernés.</p>

<h2>5. Conditions de retour</h2>
<ul>
  <li>Articles non portés, non lavés, en parfait état de revente</li>
  <li>Étiquettes d'origine intactes et emballage soigné</li>
  <li>Retour adressé à : {{legal_name}} — {{address}}</li>
</ul>
<p>Nous vous recommandons d'envoyer le colis en recommandé ou avec preuve de dépôt.</p>

<h2>6. Frais et remboursement</h2>
<p>{{return_info}}</p>
<p>Le remboursement porte sur le prix des articles retournés et les frais de livraison initiaux
(livraison standard la moins chère), conformément à l'article L221-24 du Code de la consommation.</p>

<h2>7. Échange de taille</h2>
{{exchange_section}}

<h2>8. Produits défectueux ou non conformes</h2>
<p>En cas de défaut de conformité ou de vice caché, contactez-nous à <a href="mailto:{{email}}">{{email}}</a>.
Les frais de retour seront à notre charge. Vos droits au titre des garanties légales s'appliquent
(voir <a href="/cgv">CGV</a>).</p>`,
  },

  "formulaire-retractation": {
    title: "Formulaire type de rétractation",
    content: `${DISCLAIMER}

<p><em>Formulaire type conforme à l'annexe de l'article R221-1 du Code de la consommation.
À remplir, dater et envoyer uniquement si vous souhaitez vous rétracter du contrat.</em></p>

<p><strong>Destinataire :</strong><br>
{{legal_name}} — {{legal_status}}<br>
{{address}}<br>
<a href="mailto:{{email}}">{{email}}</a></p>

<hr>

<p>Je/Nous (*) soussigné(s) notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat
portant sur la vente du bien (*) / la prestation de services (*) ci-dessous :</p>

<p><strong>Commandé le (*) / reçu le (*) :</strong> _________________________________</p>
<p><strong>Nom du/des consommateur(s) :</strong> _________________________________</p>
<p><strong>Adresse du/des consommateur(s) :</strong> _________________________________</p>
<p><strong>Signature du/des consommateur(s) (uniquement en cas de notification sur papier) :</strong> _________________________________</p>
<p><strong>Date :</strong> _________________________________</p>

<p><strong>Numéro de commande :</strong> _________________________________</p>

<p><strong>Produit(s) concerné(s) (référence, taille, couleur) :</strong></p>
<p>_________________________________________________________________</p>
<p>_________________________________________________________________</p>

<hr>

<p class="text-sm">(*) Rayez la mention inutile.</p>

<h2>Modalités d'envoi</h2>
<ul>
  <li><strong>Par e-mail :</strong> <a href="mailto:{{email}}">{{email}}</a> (recommandé — conservez une copie)</li>
  <li><strong>Par courrier :</strong> {{legal_name}} — {{address}}</li>
</ul>
<p>{{withdrawal_info}}</p>
<p>{{return_info}}</p>`,
  },
};

export function getDefaultLegalTemplate(
  slug: string,
): { title: string; content: string } | null {
  if (!(slug in templates)) return null;
  return templates[slug as LegalPageSlug];
}

export function getAllDefaultLegalTemplates(): {
  slug: LegalPageSlug;
  title: string;
  content: string;
}[] {
  return LEGAL_PAGE_SLUGS.map((slug) => ({
    slug,
    title: templates[slug].title,
    content: templates[slug].content,
  }));
}
