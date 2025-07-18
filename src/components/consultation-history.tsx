'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Consultation {
  id: number;
  ip_address: string | null;
  timestamp: string;
  agent_name: string;
  situation: string;
  rituel: string | null;
  session_id: string;
  consultation_response: string;
  user_agent: string | null;
}

interface ConsultationStats {
  totalConsultations: number;
  consultationsByAgent: Record<string, number>;
  recentConsultations: number;
  lastConsultation: string | null;
}

interface ConsultationHistoryProps {
  onBack: () => void;
}

export function ConsultationHistory({ onBack }: ConsultationHistoryProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filtres
  const [filters, setFilters] = useState({
    agent: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Charger les consultations
  const loadConsultations = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (filters.agent) params.append('agent', filters.agent);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/consultations?${params}`);
      const data = await response.json();

      if (data.success) {
        setConsultations(data.data);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await fetch('/api/consultations/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
    }
  };

  useEffect(() => {
    loadConsultations();
    loadStats();
  }, []);

  useEffect(() => {
    loadConsultations(1);
  }, [filters]);

  // Formatage des dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Tronquer le texte
  const truncateText = (text: string, maxLength = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Obtenir la couleur de l'agent
  const getAgentColor = (agentName: string) => {
    const colors: Record<string, string> = {
      'habitant': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'peseur': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'evideur': 'bg-green-500/20 text-green-300 border-green-500/30',
      'denoueur': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'accordeur': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    };
    return colors[agentName] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  if (selectedConsultation) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedConsultation(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'historique
          </Button>
          <h1 className="text-2xl font-bold text-blue-300">Détail de la consultation</h1>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 space-y-6">
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getAgentColor(selectedConsultation.agent_name)}`}>
                <User className="h-4 w-4 mr-2" />
                {selectedConsultation.agent_name.charAt(0).toUpperCase() + selectedConsultation.agent_name.slice(1)}
              </div>
              <p className="text-slate-400 text-sm mt-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(selectedConsultation.timestamp)}
              </p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Session: {selectedConsultation.session_id}</p>
            </div>
          </div>

          {/* Situation */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Situation partagée</h3>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-slate-300 leading-relaxed">{selectedConsultation.situation}</p>
            </div>
          </div>

          {/* Rituel */}
          {selectedConsultation.rituel && (
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Rituel accompli</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-300 italic">{selectedConsultation.rituel}</p>
              </div>
            </div>
          )}

          {/* Réponse de l'agent */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Consultation de l'agent</h3>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedConsultation.consultation_response}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-blue-300">Historique des Consultations</h1>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-blue-300">{stats.totalConsultations}</div>
            <div className="text-sm text-slate-400">Total consultations</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-green-300">{stats.recentConsultations}</div>
            <div className="text-sm text-slate-400">Cette semaine</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-purple-300">
              {Object.keys(stats.consultationsByAgent).length}
            </div>
            <div className="text-sm text-slate-400">Agents consultés</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-4 border border-slate-700/50">
            <div className="text-lg font-bold text-orange-300">
              {stats.lastConsultation 
                ? new Date(stats.lastConsultation).toLocaleDateString('fr-FR')
                : 'Aucune'
              }
            </div>
            <div className="text-sm text-slate-400">Dernière consultation</div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Filtres</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Masquer' : 'Afficher'}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Agent</label>
              <select
                value={filters.agent}
                onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="">Tous les agents</option>
                <option value="habitant">L'Habitant du Creux</option>
                <option value="peseur">Le Peseur d'Ambigus</option>
                <option value="evideur">L'Évideur</option>
                <option value="denoueur">Le Dénoueur</option>
                <option value="accordeur">L'Accordeur de Sens</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date de début</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date de fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Liste des consultations */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">
              Consultations ({totalItems})
            </h3>
            {loading && (
              <div className="flex items-center text-slate-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                Chargement...
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-400">
            <p>{error}</p>
            <Button 
              variant="ghost" 
              onClick={() => loadConsultations(currentPage)}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        ) : consultations.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <p>Aucune consultation trouvée.</p>
            <p className="text-sm mt-2">Ajustez vos filtres ou consultez un agent.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="p-6 hover:bg-slate-700/20 transition-colors cursor-pointer"
                onClick={() => setSelectedConsultation(consultation)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getAgentColor(consultation.agent_name)}`}>
                    <User className="h-4 w-4 mr-2" />
                    {consultation.agent_name.charAt(0).toUpperCase() + consultation.agent_name.slice(1)}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(consultation.timestamp)}
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-slate-300 leading-relaxed">
                    {truncateText(consultation.situation)}
                  </p>
                </div>
                
                <div className="text-sm text-slate-500">
                  Session: {consultation.session_id}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page {currentPage} sur {totalPages} ({totalItems} consultations)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadConsultations(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadConsultations(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}