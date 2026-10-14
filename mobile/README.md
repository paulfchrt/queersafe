# QueerSafe Mobile

Application mobile iOS/Android en React Native + Expo. Elle est séparée du prototype web à la racine du dépôt.

## Démarrage local

1. Installer Node.js 20.19+.
2. Dans ce dossier : `npm install`
3. Lancer : `npx expo start`
4. Scanner le QR code avec Expo Go compatible SDK 54. Pour une build native de production, utiliser EAS Build et suivre la documentation officielle.

## Fonctionnalités présentes dans le code
- Navigation native avec identité Pride et logo Q+.
- Préparation et partage d'un plan de rencontre.
- Sélection de contacts depuis le téléphone et stockage local protégé.
- SOS local qui ouvre l'app Messages ou Téléphone après action explicite.
- Position demandée uniquement au moment de préparer un SMS SOS.
- Répertoire vide tant qu'aucun lieu réel n'a été vérifié.
- Schéma SQL initial avec Row Level Security et checklist de sécurité.

## Configuration cloud (à faire par le propriétaire)
1. Créer un projet Supabase.
2. Exécuter `../supabase/migrations/202610140001_initial_schema.sql` dans le SQL Editor.
3. Copier `.env.example` vers `.env` et renseigner l'URL du projet et la clé publishable/anon.
4. Ne jamais ajouter de clé `service_role` dans l'app ou dans Git.
5. Tester les politiques RLS avec deux comptes et un visiteur non connecté avant toute activation.

Le backend n'est pas encore connecté au code mobile : aucune alerte communautaire n'est envoyée et aucune donnée n'est synchronisée. La migration garde les alertes privées par défaut. Une fonction serveur dédiée, des notifications push, une procédure de modération et des tests de sécurité sont nécessaires avant d'activer les alertes de proximité.

## Publication
Aucun binaire signé n'est généré par ce dépôt. La publication sur App Store / Google Play exige une build, les comptes développeur requis, une politique de confidentialité, des tests et la validation des stores.
