# Politique de tests — Bedrock

## 1. Objectifs

La politique de test de Bedrock vise à garantir la **qualité**, la **stabilité** et la **maintenabilité** de l'application tout au long du cycle de développement. Elle s'articule autour de trois principes :

- **Prévention** : détecter les régressions au plus tôt dans le cycle de développement
- **Confiance** : assurer que chaque livraison respecte les exigences fonctionnelles et visuelles
- **Automatisation** : réduire l'intervention humaine et le risque d'erreur via des pipelines automatisés

---

## 2. Stratégie de test — Pyramide des tests

La stratégie suit le modèle de la **pyramide des tests**, privilégiant un volume élevé de tests rapides à la base et des tests plus ciblés au sommet :

| Niveau            | Type de test                          | Objectif                                                                                     | Fréquence                            |
| ----------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Base**          | Tests unitaires                       | Valider la logique métier isolée (fonctions utilitaires, transformations de données, stores) | À chaque commit                      |
| **Intermédiaire** | Tests de composants                   | Vérifier le comportement et le rendu des composants d'interface en isolation                 | À chaque commit                      |
| **Intermédiaire** | Tests visuels / documentation vivante | Cataloguer les composants, détecter les régressions visuelles, documenter le design system   | À chaque commit                      |
| **Sommet**        | Tests d'intégration                   | Valider les interactions entre modules (services, hooks, pages complètes)                    | À chaque commit                      |
| **Transversal**   | Tests manuels fonctionnels            | Valider le comportement réel de l'application du point de vue utilisateur                    | À chaque livraison de fonctionnalité |

---

## 3. Phases de test

### Phase 1 — Développement local

**Quand** : pendant le développement, avant chaque push

- Exécution des tests unitaires et de composants par le développeur
- Consultation du catalogue de composants pour vérifier la cohérence visuelle
- Linting statique du code pour détecter erreurs de syntaxe et non-conformités
- **Test manuel par le développeur** : vérification fonctionnelle de la feature développée directement dans l'application (navigation, interactions, cas standards et cas limites)

**Critère de passage** : tous les tests passent localement, aucune erreur de lint, comportement vérifié manuellement par le développeur

### Phase 2 — Intégration continue

**Quand** : à chaque pull request ou push sur les branches de développement

L'intégration continue orchestre automatiquement les vérifications suivantes :

1. **Analyse statique** — vérification du respect des règles de code
2. **Tests automatisés** — exécution de l'ensemble de la suite de tests (unitaires, composants, intégration)
3. **Build applicatif** — compilation complète de l'application pour détecter les erreurs de transpilation
4. **Build du catalogue de composants** — compilation du catalogue visuel pour vérifier l'intégrité du design system

**Critère de passage** : les 4 étapes doivent réussir pour qu'une pull request soit éligible à la review

### Phase 3 — Review et validation par les pairs

**Quand** : après le passage de l'intégration continue

- **Revue de code** par un pair (code review) sur la pull request
- **Test manuel par le relecteur** : le pair déploie ou exécute la branche localement et teste la fonctionnalité concernée. Il vérifie :
  - Le bon fonctionnement du scénario nominal
  - Les cas limites et les cas d'erreur
  - L'absence de régressions sur les fonctionnalités adjacentes
  - La conformité visuelle et ergonomique
- Validation visuelle via le catalogue de composants si des composants UI sont impactés

**Critère de passage** : approbation d'au moins un relecteur ayant effectué la revue de code **et** le test manuel fonctionnel

### Phase 4 — Déploiement continu et livraison

**Quand** : après merge sur la branche principale

- Déploiement automatique déclenché par le merge
- Génération automatique des notes de version (release drafting)
- Déploiement de la documentation associée

**Critère de passage** : déploiement réussi, application accessible et fonctionnelle

### Phase 5 — Validation post-déploiement (smoke test)

**Quand** : après chaque déploiement en production

- **Test manuel rapide** par l'équipe sur l'environnement de production : vérification que les parcours critiques de l'application fonctionnent (accès, navigation, opérations principales)
- Vérification de l'absence d'erreurs visibles ou de régressions majeures

**Critère de passage** : les parcours critiques sont fonctionnels, aucune régression bloquante détectée

---

## 4. Couverture et périmètre

| Périmètre                               | Couvert par                            |
| --------------------------------------- | -------------------------------------- |
| Fonctions utilitaires et logique métier | Tests unitaires                        |
| Composants UI (design system)           | Tests de composants + catalogue visuel |
| Hooks et gestion d'état                 | Tests unitaires et d'intégration       |
| Services et appels externes             | Tests d'intégration                    |
| Pages et parcours                       | Tests d'intégration + tests manuels    |
| Conformité du code                      | Analyse statique (linting)             |
| Intégrité du build                      | Build CI                               |
| Expérience utilisateur réelle           | Tests manuels (développeur + pairs)    |

---

## 5. Critères qualité transversaux

- **Non-régression** : aucun test existant ne doit échouer suite à une modification
- **Isolation** : chaque test automatisé est indépendant et reproductible
- **Rapidité** : la suite de tests complète doit s'exécuter en un temps raisonnable pour ne pas freiner le cycle de développement
- **Maintenabilité** : les tests suivent les mêmes conventions de code que l'application
- **Double vérification** : toute fonctionnalité est testée manuellement par son auteur puis par au moins un pair avant livraison

---

## 6. Gouvernance

- Tout nouveau composant ou fonctionnalité doit être accompagné de ses tests automatisés
- Tout bug corrigé doit être couvert par un test de non-régression
- La suite de tests est un **prérequis bloquant** à tout merge de code
- Le test manuel par un pair est un **prérequis bloquant** à la validation d'une pull request
- Le catalogue de composants fait office de **documentation vivante** du design system

---
