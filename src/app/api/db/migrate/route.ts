import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'create_users_table') {
      // Lire le fichier de schéma
      const schemaPath = join(process.cwd(), 'database', 'schema.sql');
      const schema = readFileSync(schemaPath, 'utf-8');

      // Exécuter le schéma
      await pool.query(schema);

      // Ajouter la colonne user_id à la table existante agents_consultations
      await pool.query(`
        ALTER TABLE agents_consultations 
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      `);

      // Créer l'index pour user_id
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_agents_consultations_user_id ON agents_consultations(user_id)
      `);

      return NextResponse.json({ 
        success: true, 
        message: 'Migration terminée avec succès' 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Action non reconnue' 
    }, { status: 400 });

  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la migration' 
    }, { status: 500 });
  }
}