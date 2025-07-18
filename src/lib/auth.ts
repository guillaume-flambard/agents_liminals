import { compare, hash } from 'bcryptjs';
import { User, UserCreate, UserLogin, UserSession } from '@/types/user';
import pool from './database';

export class AuthService {
  // Hacher un mot de passe
  static async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  // Vérifier un mot de passe
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: UserCreate): Promise<User> {
    const { email, name, password } = userData;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Hacher le mot de passe
    const passwordHash = await this.hashPassword(password);

    // Créer l'utilisateur
    const query = `
      INSERT INTO users (email, name, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at, updated_at, last_login_at, is_active
    `;

    try {
      const result = await pool.query(query, [email, name, passwordHash]);
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw new Error('Impossible de créer l\'utilisateur');
    }
  }

  // Authentifier un utilisateur
  static async authenticateUser(credentials: UserLogin): Promise<UserSession | null> {
    const { email, password } = credentials;

    try {
      // Récupérer l'utilisateur avec le mot de passe
      const query = `
        SELECT id, email, name, password_hash, is_active
        FROM users 
        WHERE email = $1
      `;
      
      const result = await pool.query(query, [email]);
      const user = result.rows[0];

      if (!user) {
        return null;
      }

      if (!user.is_active) {
        throw new Error('Compte désactivé');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await this.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return null;
      }

      // Mettre à jour la dernière connexion
      await pool.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par email
  static async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, created_at, updated_at, last_login_at, is_active
      FROM users 
      WHERE email = $1
    `;

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Récupérer un utilisateur par ID
  static async getUserById(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, name, created_at, updated_at, last_login_at, is_active
      FROM users 
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Mettre à jour les informations d'un utilisateur
  static async updateUser(id: number, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, created_at, updated_at, last_login_at, is_active
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw new Error('Impossible de mettre à jour l\'utilisateur');
    }
  }

  // Désactiver un utilisateur
  static async deactivateUser(id: number): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
      return false;
    }
  }

  // Réactiver un utilisateur
  static async reactivateUser(id: number): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Erreur lors de la réactivation de l\'utilisateur:', error);
      return false;
    }
  }
}