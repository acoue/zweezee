# Zweezee

**Zweezee** est un cockpit léger de pilotage multi-projets destiné au suivi quotidien d'un portefeuille de projets, d'évolutions applicatives et d'activités de maintenance / RUN.

L'objectif n'est pas de remplacer Jira, Confluence ou GitLab. Zweezee centralise les informations utiles au chef de projet : actions, risques, échéances, temps passé et indicateurs de pilotage.

## Fonctionnalités

### Portefeuille projets

Chaque projet dispose notamment de :

- nom et description ;
- santé du projet ;
- phase et avancement lorsque le suivi projet est activé ;
- suivi Projet / évolution ;
- suivi Maintenance / RUN ;
- actions, risques et temps passé associés.

Un même projet peut couvrir à la fois une évolution structurée et du RUN.

### Actions

L'Action est l'objet central de Zweezee.

Types disponibles :

| Type | Référence | Usage |
|---|---|---|
| `ACTION` | `ACT-0001` | Action de pilotage ou projet |
| `BUG` | `BUG-0001` | Correction d'anomalie |
| `EVOLUTION` | `EVO-0001` | Évolution fonctionnelle ou technique |
| `JALON` | `JAL-0001` | Jalon projet |

Une action peut contenir :

- titre et description ;
- projet ;
- responsable ;
- date de début ;
- échéance ;
- charge estimée ;
- statut ;
- priorité ;
- origine, par exemple Jira.

Les références sont générées automatiquement côté serveur et restent stables pendant la vie de l'action.

### Risques

Les risques possèdent une référence automatique de type `RIS-0001`.

Le suivi comprend :

- probabilité ;
- impact ;
- criticité ;
- responsable ;
- plan de traitement ;
- rattachement au projet.

Le Dashboard considère actuellement comme élevés les risques dont `probabilité × impact >= 12`.

### Agenda

L'Agenda n'est pas une entité CRUD et ne stocke aucune donnée spécifique.

Il est calculé automatiquement à partir des Actions possédant :

- une date de début ;
- et/ou une échéance.

Il permet notamment :

- navigation mensuelle ;
- filtre par projet ;
- filtre par type d'Action ;
- distinction Début / Échéance ;
- mise en évidence des échéances en retard ;
- accès à la modification de l'Action.

Pour ajouter un élément à l'Agenda, il suffit donc de dater une Action.

### Timesheet

Le Timesheet comptabilise le temps réellement passé.

Une saisie contient :

- date ;
- projet ;
- Action facultative ;
- nombre d'heures ;
- description de l'activité réalisée.

Le rattachement à une Action permet de comparer :

```text
Charge estimée de l'Action
        vs
Temps réellement saisi
```

Le récapitulatif mensuel présente notamment :

- charge totale du mois ;
- ventilation par projet ;
- temps Projet / évolution ;
- temps Maintenance / RUN ;
- détail des activités ;
- comparaison estimé / réalisé pour les Actions disposant d'une estimation.

Le temps Maintenance / RUN est déduit des types `BUG` et `EVOLUTION`. Les types `ACTION` et `JALON` restent rattachés au pilotage Projet / évolution.

### Dashboard

Le Dashboard est une vue de synthèse calculée à partir des données existantes.

Il présente notamment :

- actions en retard ;
- actions bloquées ;
- risques élevés ;
- jalons à venir ;
- portefeuille projets ;
- prochaines échéances ;
- charge du mois par projet ;
- points d'attention.

## Principes fonctionnels

Zweezee repose sur quatre objets métier principaux :

```text
Project
├── Action
├── Risk
└── TimesheetEntry
```

Les autres fonctions sont des vues calculées :

```text
Agenda
  = Actions datées

Maintenance / RUN
  = Actions BUG / EVOLUTION

Jalons
  = Actions de type JALON

Temps consommé d'une Action
  = somme des TimesheetEntry rattachées
```

Cette approche évite de dupliquer l'information et garde Zweezee volontairement plus simple qu'un outil comme Jira.

## Stack technique

- Next.js 15 ;
- React 19 ;
- TypeScript ;
- Prisma ;
- PostgreSQL 16 ;
- Lucide React pour les icônes ;
- Docker / Docker Compose.

## Architecture

```text
zweezee/
├── app/
│   ├── api/
│   │   └── [entity]/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── actions/
│   ├── agenda/
│   ├── crud/
│   ├── dashboard/
│   ├── layout/
│   ├── projects/
│   ├── timesheet/
│   ├── ui/
│   └── App.tsx
│
├── lib/
│   ├── config/
│   │   └── entities.ts
│   ├── entityApi.ts
│   ├── formatters.ts
│   ├── prisma.ts
│   └── referenceGenerator.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── types/
│   └── index.ts
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## API

Le CRUD générique utilise deux routes dynamiques :

```text
POST   /api/{entity}
PUT    /api/{entity}/{id}
DELETE /api/{entity}/{id}
```

Par exemple :

```text
POST   /api/actions
PUT    /api/actions/cm...
DELETE /api/actions/cm...
```

Les routes génériques sont situées dans :

```text
app/api/[entity]/route.ts
app/api/[entity]/[id]/route.ts
```

Éviter de recréer en parallèle des routes telles que `app/api/actions/[id]/route.ts`, qui entreraient en concurrence avec les routes génériques.

## Modèle de données

### Action

Les Actions portent notamment :

```text
reference
 type
 title
 description
 startDate
 dueDate
 estimatedHours
 owner
 status
 priority
 source
 projectId
```

### TimesheetEntry

Le temps réel est stocké indépendamment de la durée calendrier d'une Action :

```text
date
hours
activity
projectId
actionId (facultatif)
```

La durée entre `startDate` et `dueDate` n'est donc jamais utilisée comme temps passé réel.

## Installation locale

### Prérequis

- Node.js 22 ou version compatible avec le projet ;
- npm ;
- Docker et Docker Compose pour PostgreSQL, ou une instance PostgreSQL accessible.

### Variables d'environnement

Créer `.env` à partir du modèle :

```bash
cp .env.example .env
```

Exemple :

```env
DATABASE_URL="postgresql://zweezee:zweezee@localhost:5432/zweezee?schema=public"
```

### Installation

```bash
npm install
```

Puis :

```bash
npx prisma generate
```

Pour initialiser ou faire évoluer la base en développement :

```bash
npx prisma migrate dev
```

### Démarrage développement

```bash
npm run dev
```

L'application Next.js écoute normalement sur :

```text
http://localhost:3000
```

### Build de production

```bash
npm run build
```

Puis :

```bash
npm start
```

## Déploiement Docker

Le conteneur Next.js peut continuer à écouter sur le port `3000` en interne et être publié sur un autre port du serveur.

Pour le serveur actuellement utilisé pour Zweezee :

```yaml
services:
  app:
    ports:
      - "5000:3000"
```

L'accès devient alors :

```text
http://10.10.200.13:5000
```

### Démarrage

```bash
docker compose up -d --build
```

### État des conteneurs

```bash
docker compose ps
```

### Logs applicatifs

```bash
docker compose logs -f app
```

### Logs PostgreSQL

```bash
docker compose logs -f db
```

### Arrêt

```bash
docker compose down
```

Ne pas utiliser `docker compose down -v` si le volume PostgreSQL doit être conservé, car l'option `-v` supprime les volumes déclarés par Compose.

## Prisma

### Vérifier le schéma

```bash
npx prisma format
npx prisma validate
```

### Régénérer le client

Après une modification de `schema.prisma` :

```bash
npx prisma generate
```

### Créer une migration

```bash
npx prisma migrate dev --name nom_de_la_migration
```

### Vérifier les migrations

```bash
npx prisma migrate status
```

## Références automatiques

Les références sont générées côté serveur.

Exemples :

```text
ACT-0001
BUG-0001
EVO-0001
JAL-0001
RIS-0001
```

Le type d'une Action détermine son préfixe lors de la création. Une fois créée, sa référence ne doit plus être modifiée.

## Statuts des Actions

```text
TODO
IN_PROGRESS
BLOCKED
DONE
CANCELLED
```

## Priorités

```text
LOW
MEDIUM
HIGH
CRITICAL
```

## Santé projet

```text
GREEN   → Maîtrisé
ORANGE  → À surveiller
RED     → En difficulté
```

L'interface traduit les valeurs techniques Prisma en libellés et couleurs pastel.

## Workflow de développement recommandé

Avant un commit important :

```bash
npx prisma validate
npm run build
```

Pour vérifier localement :

```bash
npm run dev
```

Après modification de l'arborescence `app/api`, redémarrer le serveur Next.js si nécessaire afin que les routes soient redécouvertes proprement.

## Positionnement de Zweezee

Zweezee est volontairement un **outil de pilotage**.

Il ne doit pas devenir :

- un remplacement de Jira pour la gestion fine du backlog et des sprints ;
- un remplacement de Confluence pour la documentation détaillée ;
- un remplacement de GitLab pour le code, la CI/CD et les releases.

À terme, ces outils pourront être reliés à Zweezee, mais le cockpit doit rester simple et concentré sur les informations utiles au pilotage.

## Évolutions possibles

Les évolutions envisagées pourront notamment concerner :

- amélioration de l'ergonomie après usage réel ;
- recherche et filtres avancés ;
- archivage des projets ;
- historique de la santé projet ;
- règles d'anticipation automatiques ;
- exports de synthèse ;
- génération de documents de gouvernance ;
- authentification via Keycloak ;
- synchronisation ultérieure avec Jira, Confluence ou GitLab.

Le principe reste de prioriser les fonctionnalités apportant une valeur directe au pilotage sans complexifier inutilement l'application.

## Licence

Projet interne. Adapter cette section à la politique de diffusion et de licence retenue pour Zweezee.
