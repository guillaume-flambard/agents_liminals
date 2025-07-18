-- Schema pour la base de données agents_liminals
-- Tables principales pour la gestion des utilisateurs et consultations

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Table des consultations (mise à jour avec user_id)
CREATE TABLE IF NOT EXISTS agents_consultations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    situation TEXT NOT NULL,
    rituel TEXT,
    consultation_response TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Table des limites quotidiennes
CREATE TABLE IF NOT EXISTS agents_daily_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    consultation_date DATE DEFAULT CURRENT_DATE,
    consultation_count INTEGER DEFAULT 0,
    UNIQUE(user_id, agent_name, consultation_date)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_agents_consultations_user_id ON agents_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_consultations_agent_name ON agents_consultations(agent_name);
CREATE INDEX IF NOT EXISTS idx_agents_consultations_timestamp ON agents_consultations(timestamp);
CREATE INDEX IF NOT EXISTS idx_agents_daily_limits_user_agent_date ON agents_daily_limits(user_id, agent_name, consultation_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Utilisateur demo par défaut
INSERT INTO users (email, name, password_hash) 
VALUES ('demo@agents-liminals.fr', 'Utilisateur Demo', '$2b$12$demo.hash.placeholder') 
ON CONFLICT (email) DO NOTHING;

-- Commentaires sur les tables
COMMENT ON TABLE users IS 'Table des utilisateurs du système';
COMMENT ON TABLE agents_consultations IS 'Table des consultations avec les agents liminals';
COMMENT ON TABLE agents_daily_limits IS 'Table des limites quotidiennes par utilisateur et agent';