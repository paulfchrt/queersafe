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

## Configuration cloud et état réel

- Le client Supabase et les écrans d'inscription/connexion sont présents dans le code mobile.
- Le répertoire lit uniquement les lignes `safe_places` dont `status = published` et `verified = true`.
- Les migrations SQL définissent les tables et activent RLS, mais les politiques doivent encore être testées avec deux comptes et une session anonyme.
- Aucun code mobile ne soumet actuellement de lieux, de signalements ou d'alertes communautaires.
- Aucune notification push, console de modération ou expiration automatisée des alertes n'est configurée.
- La migration garde volontairement les alertes privées. Ne pas les ouvrir à la communauté avant d'avoir conçu et testé un flux serveur sécurisé.

Avant la bêta, appliquer la migration au projet Supabase, confirmer que le client mobile pointe vers le bon projet, tester l'inscription/confirmation e-mail/connexion, puis valider les politiques RLS. Ne jamais ajouter une clé `service_role` dans l'app ou dans Git.

## Publication
Aucun binaire signé n'est généré par ce dépôt. La publication sur App Store / Google Play exige une build, les comptes développeur requis, une politique de confidentialité, des tests et la validation des stores.
