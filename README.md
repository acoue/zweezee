# Zweezee v0.2

MVP multi-projets avec CRUD pour projets, actions, risques, événements, jalons et Timesheet.

## Déploiement serveur sur le port 5000
```bash
docker compose down
docker compose up -d --build
```
Accès : `http://10.10.200.13:5000`

Le démarrage applique les migrations et initialise les données seulement si la base est vide.
