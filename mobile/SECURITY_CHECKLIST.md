# QueerSafe — sécurité avant bêta

Ne pas distribuer publiquement tant que les points critiques ne sont pas validés.

## Compte et données
- [ ] Activer l'authentification et la confirmation e-mail.
- [ ] Appliquer la migration SQL sur un projet Supabase neuf.
- [ ] Tester les règles RLS avec au moins deux comptes et un visiteur non connecté.
- [ ] Garder les clés service-role uniquement côté serveur; jamais dans Expo.
- [ ] Ne pas conserver de coordonnées précises après expiration d'une alerte.
- [ ] Ajouter une tâche serveur qui expire automatiquement les alertes.
- [ ] Définir une politique de conservation/suppression des données et une procédure de réponse aux incidents.

## Lieux
- [ ] Aucun lieu visible tant qu'il n'a pas été vérifié.
- [ ] Définir les critères de vérification, la date de vérification et les personnes autorisées à modérer.
- [ ] Prévoir signalement, correction, appel d'une décision et suppression d'informations privées.
- [ ] Ne jamais exposer l'adresse personnelle d'un utilisateur.

## SOS
- [ ] Appels/SMS toujours confirmés par la personne; ne pas simuler une alerte silencieuse.
- [ ] Avertissement clair que les contacts communautaires ne sont ni policiers ni secouristes.
- [ ] Consentement explicite avant partage de localisation; position approximative par défaut.
- [ ] Alertes limitées dans le temps, limitation de débit, blocage et signalement.
- [ ] Pas de diffusion publique d'une position exacte.
- [ ] Tester hors-ligne, permissions refusées, batterie faible, écran verrouillé et app en arrière-plan.
- [ ] Ne pas activer d'alerte de masse en production avant revue sécurité indépendante.

## Publication
- [ ] TestFlight et test fermé Google Play.
- [ ] Politique de confidentialité et conditions d'utilisation accessibles dans l'app.
- [ ] Coordonnées de support et processus de modération.
- [ ] Revue d'accessibilité et test avec des membres LGBTQ+ volontaires.
- [ ] Aucun texte marketing ne doit prétendre que les secours ont été contactés si l'app n'a fait qu'ouvrir SMS/Téléphone.
