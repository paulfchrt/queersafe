# QueerSafe Mobile

Application mobile iOS/Android en React Native + Expo. Cette application native est distincte du prototype web à la racine du dépôt.

## Lancer en développement

1. Installer Node.js LTS.
2. Depuis ce dossier : `npm install`
3. Lancer : `npx expo start`
4. Scanner le QR code avec Expo Go pour tester l'interface. Certaines fonctions natives nécessitent une development build.

## État actuel du MVP

- Navigation native avec identité Pride et logo Q+.
- Préparation d'un rendez-vous et génération/partage d'un message.
- Sélection volontaire d'un contact de confiance via le carnet d'adresses.
- SOS qui prépare un SMS ou ouvre l'appel téléphonique après confirmation de l'utilisateur.
- Position ajoutée au SOS uniquement après autorisation explicite.
- Répertoire de lieux avec un état vide : aucun lieu n'est présenté comme vérifié par défaut.

## Limites de sécurité importantes

- Le SOS n'envoie pas automatiquement un message en arrière-plan et ne contacte pas silencieusement les secours.
- La communauté ne reçoit pas encore d'alertes en temps réel. Cela nécessite un backend sécurisé, une authentification, des règles anti-abus, des notifications push et des tests.
- Le numéro d'urgence dépend du pays; le 911 est proposé par défaut uniquement comme exemple Canada/États-Unis et doit être confirmé par l'utilisateur.
- Les coordonnées de contact sont stockées localement avec SecureStore; aucune donnée n'est envoyée à un serveur par ce MVP.
- Ne pas utiliser ce prototype comme système d'urgence garanti.

## Prochaine étape backend

Créer un projet Supabase, appliquer un schéma SQL avec Row Level Security, puis ajouter l'authentification, les lieux modérés, les alertes expirables et les notifications push. Ne jamais intégrer une clé secrète de service dans l'application. Garder les alertes privées par défaut et divulguer la position uniquement après consentement explicite.

## Publication

Le dépôt ne contient pas encore de binaire signé. Une publication App Store / Google Play nécessite des comptes développeur et des étapes de build/revue qui ne sont pas exécutés par ce commit.