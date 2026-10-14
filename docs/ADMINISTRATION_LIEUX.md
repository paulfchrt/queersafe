# Administration des lieux QueerSafe

## Règle de sécurité
Les utilisateurs ne peuvent pas proposer, modifier, valider ou publier des lieux depuis l'application publique. Seuls les administrateurs autorisés peuvent gérer le catalogue.

## État actuel
- Le formulaire public de proposition de lieu a été retiré de `index.html`.
- La liste publique utilise uniquement les lieux marqués publiés et vérifiés.
- L'interface d'administration n'est pas encore activée. Ne pas mettre une clé Supabase service_role dans le site web.

## Mise en place requise avant activation
1. Déployer une Supabase Edge Function utilisant la clé service role uniquement côté serveur.
2. Configurer une variable secrète `QUEERSAFE_ADMIN_EMAILS` avec les adresses e-mail autorisées.
3. Vérifier le jeton de session et l'adresse e-mail côté serveur avant chaque opération d'ajout, de modification, de validation ou de retrait.
4. Conserver les nouveaux lieux en statut `pending` et `verified=false` jusqu'à validation par un administrateur.
5. Tester avec un compte membre et un compte administrateur pour confirmer qu'un membre ne peut pas effectuer les opérations administratives en appelant directement l'API.

## Procédure de vérification des lieux
- Vérifier le lieu et les coordonnées auprès d'une source officielle.
- Vérifier l'existence, les horaires, l'accessibilité et les conditions d'accueil.
- Ne pas publier d'affirmation absolue de sécurité.
- Enregistrer la date et la source de la dernière vérification.
- Retirer ou réexaminer rapidement un lieu lorsqu'une information devient obsolète ou qu'un signalement crédible est reçu.
