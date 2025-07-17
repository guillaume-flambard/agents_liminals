# 🚀 Guide de Déploiement - Agents Liminals

## 📋 Prérequis VPS

### Serveur Requirements
- **OS**: Ubuntu 20.04+ ou Debian 11+
- **RAM**: Minimum 4GB, recommandé 8GB
- **CPU**: 2 cores minimum
- **Stockage**: 50GB SSD minimum
- **Domaines**: Configurés pour pointer vers votre IP

### Domaines Requis
Configurez ces sous-domaines pour pointer vers votre VPS :
- `agents-liminals.memoapp.eu` - Application principale
- `n8n.memoapp.eu` - Interface n8n
- `traefik.memoapp.eu` - Dashboard Traefik
- `portainer.memoapp.eu` - Interface Portainer

## 🔧 Installation

### 1. Préparation du VPS

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Installation de Node.js (pour les scripts)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Redémarrer pour appliquer les groupes
logout # puis se reconnecter
```

### 2. Clone du Projet

```bash
# Cloner le dépôt
git clone [VOTRE_REPO_URL] agents-liminals
cd agents-liminals

# Donner les permissions d'exécution
chmod +x scripts/deploy.sh
```

### 3. Configuration des Variables

```bash
# Copier le fichier d'environnement
cp .env.production .env.production.local

# Éditer les variables (remplacer YOUR_* par vos vraies valeurs)
nano .env.production.local
```

**Variables à configurer :**
```env
# Mots de passe et secrets (générez des valeurs sécurisées)
POSTGRES_PASSWORD=votre_mot_de_passe_postgres_sécurisé
REDIS_PASSWORD=votre_mot_de_passe_redis_sécurisé
N8N_DB_PASSWORD=votre_mot_de_passe_n8n_db_sécurisé
N8N_BASIC_AUTH_PASSWORD=votre_mot_de_passe_n8n_interface
NEXTAUTH_SECRET=votre_secret_nextauth_64_caractères

# Email pour Let's Encrypt
ACME_EMAIL=votre-email@memoapp.eu

# API Keys
OPENAI_API_KEY=votre_clé_openai
```

### 4. Mise à Jour de la Base de Données

```bash
# Éditer le script SQL avec vos mots de passe
nano database/init.sql

# Remplacer 'YOUR_POSTGRES_PASSWORD' et 'YOUR_N8N_DB_PASSWORD'
# par vos vrais mots de passe
```

## 🚀 Déploiement

### Déploiement Automatique

```bash
# Lancer le déploiement complet
./scripts/deploy.sh deploy
```

Cette commande va :
1. ✅ Vérifier les prérequis
2. 🌐 Configurer le réseau Docker
3. 🛑 Arrêter les services existants
4. 🚀 Construire et démarrer tous les services
5. ⏳ Attendre que les services soient prêts
6. 📤 Upload automatique des workflows n8n
7. ✅ Vérifier le statut final

### Commandes Utiles

```bash
# Upload des workflows uniquement
./scripts/deploy.sh workflows

# Vérifier le statut
./scripts/deploy.sh status

# Voir les logs
./scripts/deploy.sh logs [service]

# Redémarrer un service
./scripts/deploy.sh restart [service]

# Arrêter tous les services
./scripts/deploy.sh stop

# Nettoyage complet
./scripts/deploy.sh clean
```

## 🔍 Vérification du Déploiement

### 1. Vérifier les Services

```bash
# Statut de tous les conteneurs
docker-compose -f docker-compose.prod.yml ps

# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Tests de Connectivité

```bash
# Test de l'application
curl -I https://agents-liminals.memoapp.eu

# Test de n8n
curl -I https://n8n.memoapp.eu

# Test des webhooks
curl -X POST https://n8n.memoapp.eu/webhook/accordeur \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 3. Accès aux Interfaces

- **🏠 Application**: https://agents-liminals.memoapp.eu
- **🔧 n8n**: https://n8n.memoapp.eu (admin / votre_mot_de_passe)
- **📊 Traefik**: https://traefik.memoapp.eu
- **🐳 Portainer**: https://portainer.memoapp.eu

## 🔧 Configuration n8n

### 1. Première Connexion

1. Aller sur https://n8n.memoapp.eu
2. S'authentifier avec vos identifiants configurés
3. Vérifier que les 5 workflows sont présents et actifs

### 2. Configuration OpenAI

Dans chaque workflow :
1. Ouvrir le nœud "OpenAI"
2. Configurer votre clé API OpenAI
3. Sauvegarder et activer le workflow

### 3. Test des Webhooks

Chaque agent doit avoir son webhook actif :
- 🎵 Accordeur: `/webhook/accordeur`
- ⚖️ Peseur: `/webhook/peseur`
- ⚡ Dénoueur: `/webhook/denoueur`
- 🕳️ Évideur: `/webhook/evideur`
- ◯ Habitant: `/webhook/habitant`

## 🛠️ Maintenance

### Sauvegarde

```bash
# Sauvegarde de la base de données
docker exec agents-postgres pg_dumpall -U postgres > backup_$(date +%Y%m%d).sql

# Sauvegarde des volumes
docker run --rm -v agents_liminals_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data
```

### Mise à Jour

```bash
# Pull des dernières modifications
git pull origin main

# Redéploiement
./scripts/deploy.sh deploy
```

### Monitoring

```bash
# Surveiller les ressources
docker stats

# Logs en continu
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Vérifier l'espace disque
df -h
docker system df
```

## 🚨 Dépannage

### Services qui ne démarrent pas

```bash
# Vérifier les logs d'erreur
docker-compose -f docker-compose.prod.yml logs [service_name]

# Vérifier la configuration
docker-compose -f docker-compose.prod.yml config

# Redémarrer un service spécifique
docker-compose -f docker-compose.prod.yml restart [service_name]
```

### Problèmes SSL

```bash
# Vérifier les certificats Traefik
docker-compose -f docker-compose.prod.yml logs traefik

# Forcer le renouvellement
docker-compose -f docker-compose.prod.yml restart traefik
```

### Problèmes de Connexion Base de Données

```bash
# Vérifier PostgreSQL
docker exec -it agents-postgres psql -U postgres -l

# Tester la connexion
docker exec -it agents-postgres psql -U agents_user -d agents_liminals -c "SELECT * FROM agents;"
```

### Workflows n8n Non Fonctionnels

```bash
# Re-upload des workflows
./scripts/deploy.sh workflows

# Vérifier les logs n8n
docker-compose -f docker-compose.prod.yml logs n8n
```

## 📊 Métriques et Surveillance

### Logs Importants

- **Application**: Erreurs Next.js, problèmes d'authentification
- **n8n**: Exécution des workflows, erreurs API
- **PostgreSQL**: Connexions, requêtes lentes
- **Traefik**: Requêtes, certificats SSL

### Alertes Recommandées

- Espace disque > 80%
- Mémoire RAM > 90%
- Services arrêtés
- Certificats SSL expirant dans 30 jours

## 🔐 Sécurité

### Recommandations

1. **Firewall**: Ouvrir uniquement les ports 80, 443, 22
2. **SSH**: Utiliser des clés SSH, désactiver l'auth par mot de passe
3. **Mots de passe**: Utiliser des mots de passe forts (32+ caractères)
4. **Sauvegardes**: Automatiser les sauvegardes quotidiennes
5. **Mises à jour**: Planifier les mises à jour de sécurité

### Ports Utilisés

- **80**: HTTP (redirection vers HTTPS)
- **443**: HTTPS (Traefik)
- **5432**: PostgreSQL (interne)
- **6379**: Redis (interne)
- **5678**: n8n (interne, via Traefik)
- **3000**: Next.js (interne, via Traefik)

---

## 🎉 Félicitations !

Votre plateforme Agents Liminals est maintenant déployée et opérationnelle !

**Support**: Pour toute question, vérifiez d'abord les logs puis consultez la documentation Next.js et n8n.