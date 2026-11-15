# Horizon Digital

Site vitrine d'Horizon Digital, agence marketing, communication & IA portée par une seule personne, basée à Marseille et Aix-en-Provence. Conçu et développé par Antoine Balesi.

Quatre expertises : stratégie de marque, communication & contenu, sites & plateformes web, IA & automatisation. Un seul interlocuteur, du cadrage à la livraison.

## Stack technique

- HTML / CSS / JavaScript vanilla, sans framework
- Typographies Sora + Inter
- Formulaire de contact via Formspree
- Hébergé sur GitHub Pages
- Domaine personnalisé : à définir

## Développement local

```bash
npx serve -l 3000 .
```

## Site

[antoinebale.github.io/horizon-digital](https://antoinebale.github.io/horizon-digital/)

---

Code source du site Horizon Digital — par Antoine Balesi · [Portfolio personnel](https://antoinebale.github.io)

## Étude de cas Belavi

`projet-belavi.html` présente le SaaS personnel d’Antoine, son parcours et sa démonstration. Voir `INTEGRATION_BELAVI.md` pour les modifications, les sources des visuels et les vérifications avant publication.

## Vérifications avant publication

Les changements issus de l’audit du 14 novembre restent en HTML/CSS/JS, sans dépendance supplémentaire. La FAQ utilise les éléments natifs `details/summary`. Les menus sont des boutons de divulgation, sans ouverture implicite au survol. Le décor est statique sur mobile et en mouvement réduit.

```text
python scripts/check-site.py
node scripts/test-contact.cjs
node --check assets/js/main.js
node --check assets/js/contact.js
node --check assets/js/horizon.js
```

Le test du formulaire est entièrement hors ligne : succès, erreurs et reprise utilisent un faux transport, aucun message n’est envoyé.

Pour vérifier les chemins GitHub Pages et la page 404, lancer `python scripts/preview.py`, puis ouvrir `http://127.0.0.1:3002/horizon-digital/` et une URL inexistante sous ce préfixe. Pour la vraie iframe Belavi, conserver l’aperçu sur le port 3000 décrit plus haut.

- Vérifier les huit pages à 390, 768 et 1440 px, ainsi que les boutons à 320 px.
- Vérifier menu, Échap, Tab/Maj+Tab, changement de largeur avec menu ouvert, FAQ et focus du formulaire.
- Tester sans JavaScript et avec la préférence système de réduction des animations ; ne jamais cacher un contenu essentiel derrière un effet.
- Reporter tout changement d’en-tête et de pied de page sur les sept pages principales ; la 404 est autonome.
- Utiliser la même version `?v=…` pour tous les CSS/JS des huit pages.
- Garder le véritable iframe Belavi et le statut terminé du Jardin du Repos, sans ancien lien externe.
- Vérifier les métadonnées, le sitemap et les chemins `/horizon-digital/` avant toute publication. Le robots.txt d’un sous-dossier ne remplace pas celui de la racine de l’hôte.
- Les réglages Formspree, le stockage du document Belavi, les mesures sur téléphone réel et la recette après déploiement restent des vérifications distinctes.
