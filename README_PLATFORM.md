# Sen Studio Host

Platforme de déploiement de bots WhatsApp (Sen Bot).

## Prérequis
- Node.js 18+
- NPM

## Installation
1.  Installation des dépendances de la plateforme :
    ```bash
    npm install
    ```
2.  Installation des dépendances du template bot :
    ```bash
    cd templates/sen-bot
    npm install
    cd ../..
    ```
    *(Note : J'ai déjà fait cette étape pour vous)*

3.  Initialisation de la base de données :
    ```bash
    npx prisma migrate dev --name init
    ```
    *(Déjà fait aussi)*

## Lancement
Pour lancer la plateforme en mode production :
```bash
npm run build
npm run start
```
Accédez à `http://localhost:3000`.

Pour le développement :
```bash
npm run dev
```

## Fonctionnalités
- **Landing Page** : Design moderne.
- **Auth** : Inscription/Connexion.
- **Dashboard** : Gestion des bots, Coins, Dark Mode.
- **Déploiement** : Création d'instances isolées, génération de code de pairage.
- **Facturation** : Interface Moneyfusion.
- **Admin** : Route `/steph` (Mot de passe : `stephadmin123@`) pour gérer les coins et voir les stats.

## Scripts Utiles
- `node cron.js` : Lance la déduction journalière des coins (à mettre dans un planificateur de tâches si souhaité).

## Structure
- `src/app` : Code source Next.js.
- `templates/sen-bot` : Le code source du bot qui est cloné.
- `instances/` : Dossier où les bots des utilisateurs sont créés.
- `prisma/` : Base de données SQLite (`dev.db`).
