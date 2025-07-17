#!/bin/bash

# Script de déploiement pour Agents Liminals
# ==========================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement d'Agents Liminals sur VPS"
echo "========================================"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifications préliminaires
check_requirements() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    # Vérifier le fichier .env
    if [ ! -f ".env.production" ]; then
        log_error "Fichier .env.production manquant"
        log_info "Copiez .env.production.example et configurez vos variables"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Créer le réseau Traefik s'il n'existe pas
setup_network() {
    log_info "Configuration du réseau Docker..."
    
    if ! docker network ls | grep -q "traefik-public"; then
        log_info "Création du réseau traefik-public..."
        docker network create traefik-public
        log_success "Réseau traefik-public créé"
    else
        log_success "Réseau traefik-public existe déjà"
    fi
}

# Arrêter les services existants
stop_services() {
    log_info "Arrêt des services existants..."
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    fi
    
    log_success "Services arrêtés"
}

# Construire et démarrer les services
start_services() {
    log_info "Construction et démarrage des services..."
    
    # Charger les variables d'environnement
    export $(cat .env.production | grep -v '^#' | xargs)
    
    # Construire et démarrer
    docker-compose -f docker-compose.prod.yml up -d --build
    
    log_success "Services démarrés"
}

# Attendre que les services soient prêts
wait_for_services() {
    log_info "Attente que les services soient prêts..."
    
    # Attendre PostgreSQL
    log_info "Attente de PostgreSQL..."
    sleep 10
    
    # Attendre n8n
    log_info "Attente de n8n..."
    sleep 15
    
    # Attendre l'application Next.js
    log_info "Attente de l'application..."
    sleep 10
    
    log_success "Services prêts"
}

# Upload des workflows n8n
upload_workflows() {
    log_info "Upload des workflows n8n..."
    
    # Exporter les variables d'environnement nécessaires
    export $(cat .env.production | grep N8N_BASIC_AUTH | xargs)
    
    # Attendre un peu plus que n8n soit complètement prêt
    sleep 30
    
    # Lancer le script d'upload
    node scripts/upload-workflows.js
    
    if [ $? -eq 0 ]; then
        log_success "Workflows uploadés avec succès"
    else
        log_warning "Erreur lors de l'upload des workflows (peut nécessiter un retry manuel)"
    fi
}

# Vérifier le statut des services
check_services() {
    log_info "Vérification du statut des services..."
    
    echo ""
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    
    # Vérifier que tous les services sont UP
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Exit"; then
        log_error "Certains services ont échoué"
        log_info "Vérifiez les logs avec: docker-compose -f docker-compose.prod.yml logs"
        exit 1
    fi
    
    log_success "Tous les services sont actifs"
}

# Afficher les informations de connexion
show_urls() {
    log_success "🎉 Déploiement terminé avec succès!"
    echo ""
    echo "🔗 URLs d'accès:"
    echo "   🏠 Application:    https://agents-liminals.memoapp.eu"
    echo "   🔧 n8n:           https://n8n.memoapp.eu"
    echo "   📊 Traefik:       https://traefik.memoapp.eu"
    echo "   🐳 Portainer:     https://portainer.memoapp.eu"
    echo ""
    echo "🔗 Webhooks des agents:"
    echo "   🎵 Accordeur:     https://n8n.memoapp.eu/webhook/accordeur"
    echo "   ⚖️  Peseur:        https://n8n.memoapp.eu/webhook/peseur"
    echo "   ⚡ Dénoueur:      https://n8n.memoapp.eu/webhook/denoueur"
    echo "   🕳️  Évideur:       https://n8n.memoapp.eu/webhook/evideur"
    echo "   ◯ Habitant:      https://n8n.memoapp.eu/webhook/habitant"
    echo ""
    echo "📋 Commandes utiles:"
    echo "   📜 Logs:          docker-compose -f docker-compose.prod.yml logs -f"
    echo "   🔄 Restart:       docker-compose -f docker-compose.prod.yml restart"
    echo "   🛑 Stop:          docker-compose -f docker-compose.prod.yml down"
    echo "   📊 Status:        docker-compose -f docker-compose.prod.yml ps"
}

# Fonction de nettoyage en cas d'erreur
cleanup() {
    log_error "Erreur détectée, nettoyage..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
}

# Gérer les interruptions
trap cleanup ERR INT TERM

# Menu principal
case "${1:-deploy}" in
    "deploy")
        check_requirements
        setup_network
        stop_services
        start_services
        wait_for_services
        check_services
        upload_workflows
        show_urls
        ;;
    
    "workflows")
        log_info "Upload des workflows uniquement..."
        export $(cat .env.production | grep N8N_BASIC_AUTH | xargs)
        node scripts/upload-workflows.js
        ;;
    
    "status")
        docker-compose -f docker-compose.prod.yml ps
        ;;
    
    "logs")
        docker-compose -f docker-compose.prod.yml logs -f "${2:-}"
        ;;
    
    "restart")
        docker-compose -f docker-compose.prod.yml restart "${2:-}"
        ;;
    
    "stop")
        docker-compose -f docker-compose.prod.yml down
        ;;
    
    "clean")
        log_warning "Arrêt et suppression de tous les conteneurs et volumes..."
        docker-compose -f docker-compose.prod.yml down -v --remove-orphans
        log_success "Nettoyage terminé"
        ;;
    
    *)
        echo "Usage: $0 [deploy|workflows|status|logs|restart|stop|clean]"
        echo ""
        echo "Commandes:"
        echo "  deploy     - Déploiement complet (défaut)"
        echo "  workflows  - Upload des workflows n8n uniquement"
        echo "  status     - Afficher le statut des services"
        echo "  logs       - Afficher les logs [service]"
        echo "  restart    - Redémarrer les services [service]"
        echo "  stop       - Arrêter tous les services"
        echo "  clean      - Arrêter et supprimer tout"
        exit 1
        ;;
esac