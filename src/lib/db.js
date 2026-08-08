import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL;

export const sql = databaseUrl ? neon(databaseUrl) : null;

/**
 * Ensures the nutritionist record exists in the public.nutricionistas table
 * @param {Object} params
 * @param {string} params.nome
 * @param {string} params.email
 */
export async function syncNutricionista({ nome, email }) {
  if (!sql) {
    console.warn('Neon Database URL not configured.');
    return null;
  }

  try {
    // Check if nutritionist already exists
    const existing = await sql`
      SELECT id, nome, email FROM nutricionistas WHERE email = ${email} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return existing[0];
    }

    // Insert new nutritionist
    const inserted = await sql`
      INSERT INTO nutricionistas (nome, email)
      VALUES (${nome}, ${email})
      RETURNING id, nome, email, created_at
    `;

    return inserted[0];
  } catch (error) {
    console.error('Error syncing nutritionist to Neon database:', error);
    // Return graceful object or rethrow if necessary
    return { nome, email };
  }
}
