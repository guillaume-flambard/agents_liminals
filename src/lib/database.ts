import { Pool } from 'pg';

// Configuration du pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
  keepAlive: true,
});

// Types pour les consultations
export interface Consultation {
  id: number;
  user_id: number | null;
  ip_address: string | null;
  timestamp: string;
  agent_name: string;
  situation: string;
  rituel: string | null;
  session_id: string;
  consultation_response: string;
  user_agent: string | null;
}

export interface ConsultationStats {
  totalConsultations: number;
  consultationsByAgent: Record<string, number>;
  recentConsultations: number;
  lastConsultation: string | null;
}

// Classe pour gérer les opérations de base de données
export class DatabaseService {
  // Récupérer l'historique des consultations avec pagination
  static async getConsultations(params: {
    limit?: number;
    offset?: number;
    agentName?: string;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
    userId?: number;
  } = {}): Promise<{ consultations: Consultation[]; total: number }> {
    const { 
      limit = 20, 
      offset = 0, 
      agentName, 
      ipAddress, 
      startDate, 
      endDate,
      userId
    } = params;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Construire les conditions WHERE dynamiquement
    if (userId) {
      whereConditions.push(`user_id = $${paramIndex++}`);
      queryParams.push(userId);
    }

    if (agentName) {
      whereConditions.push(`agent_name = $${paramIndex++}`);
      queryParams.push(agentName);
    }

    if (ipAddress) {
      whereConditions.push(`ip_address = $${paramIndex++}`);
      queryParams.push(ipAddress);
    }

    if (startDate) {
      whereConditions.push(`timestamp >= $${paramIndex++}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`timestamp <= $${paramIndex++}`);
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Requête pour compter le total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM agents_consultations 
      ${whereClause}
    `;

    // Requête pour récupérer les données
    const dataQuery = `
      SELECT 
        id,
        user_id,
        ip_address,
        timestamp,
        agent_name,
        situation,
        rituel,
        session_id,
        consultation_response,
        user_agent
      FROM agents_consultations 
      ${whereClause}
      ORDER BY timestamp DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        pool.query(countQuery, queryParams.slice(0, -2)),
        pool.query(dataQuery, queryParams)
      ]);

      return {
        consultations: dataResult.rows,
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
      throw new Error('Impossible de récupérer les consultations');
    }
  }

  // Récupérer une consultation spécifique par ID
  static async getConsultationById(id: number): Promise<Consultation | null> {
    const query = `
      SELECT 
        id,
        user_id,
        ip_address,
        timestamp,
        agent_name,
        situation,
        rituel,
        session_id,
        consultation_response,
        user_agent
      FROM agents_consultations 
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la consultation:', error);
      throw new Error('Impossible de récupérer la consultation');
    }
  }

  // Récupérer les statistiques des consultations
  static async getConsultationStats(params: {
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ConsultationStats> {
    const { ipAddress, startDate, endDate } = params;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (ipAddress) {
      whereConditions.push(`ip_address = $${paramIndex++}`);
      queryParams.push(ipAddress);
    }

    if (startDate) {
      whereConditions.push(`timestamp >= $${paramIndex++}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`timestamp <= $${paramIndex++}`);
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Requêtes pour les statistiques
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM agents_consultations 
      ${whereClause}
    `;

    const byAgentQuery = `
      SELECT agent_name, COUNT(*) as count 
      FROM agents_consultations 
      ${whereClause}
      GROUP BY agent_name
    `;

    const recentQuery = `
      SELECT COUNT(*) as recent 
      FROM agents_consultations 
      ${whereClause ? `${whereClause} AND` : 'WHERE'} 
      timestamp >= NOW() - INTERVAL '7 days'
    `;

    const lastQuery = `
      SELECT MAX(timestamp) as last_consultation 
      FROM agents_consultations 
      ${whereClause}
    `;

    try {
      const [totalResult, byAgentResult, recentResult, lastResult] = await Promise.all([
        pool.query(totalQuery, queryParams),
        pool.query(byAgentQuery, queryParams),
        pool.query(recentQuery, queryParams),
        pool.query(lastQuery, queryParams)
      ]);

      const consultationsByAgent: Record<string, number> = {};
      byAgentResult.rows.forEach(row => {
        consultationsByAgent[row.agent_name] = parseInt(row.count);
      });

      return {
        totalConsultations: parseInt(totalResult.rows[0].total),
        consultationsByAgent,
        recentConsultations: parseInt(recentResult.rows[0].recent),
        lastConsultation: lastResult.rows[0].last_consultation
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  // Tester la connexion à la base de données
  static async testConnection(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Connexion PostgreSQL établie:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion PostgreSQL:', error);
      return false;
    }
  }
}

export default pool;