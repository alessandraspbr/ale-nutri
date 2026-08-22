import { sql } from './db';

/**
 * Ensures the nutritionist record exists in Neon and returns the record with its UUID id.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} [params.nome]
 * @returns {Promise<{id: string, nome: string, email: string} | null>}
 */
export async function getOrSyncNutricionista({ email, nome }) {
  if (!sql || !email) {
    return null;
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await sql`
      SELECT id, nome, email, created_at 
      FROM nutricionistas 
      WHERE LOWER(email) = ${cleanEmail} 
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return existing[0];
    }

    const displayName = nome || cleanEmail.split('@')[0];
    const inserted = await sql`
      INSERT INTO nutricionistas (nome, email)
      VALUES (${displayName}, ${cleanEmail})
      RETURNING id, nome, email, created_at
    `;

    return inserted[0] || null;
  } catch (error) {
    console.error('Erro ao buscar/sincronizar nutricionista no Neon:', error);
    return null;
  }
}

/**
 * Fetches real-time dashboard metrics from Neon PostgreSQL for a given nutritionist.
 * @param {string} nutricionistaId UUID of the nutritionist
 * @returns {Promise<{
 *   totalPacientes: number,
 *   consultasSemana: number,
 *   pacientesSemRetorno: Array<{
 *     paciente_id: string,
 *     paciente_nome: string,
 *     whatsapp: string,
 *     email: string,
 *     ultima_consulta: string,
 *     ultimo_proximo_retorno: string | null,
 *     dias_sem_consulta: number
 *   }>
 * }>}
 */
export async function fetchDashboardMetrics(nutricionistaId) {
  if (!sql || !nutricionistaId) {
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: []
    };
  }

  try {
    // 1. Total de pacientes ativos do nutricionista logado
    const pacientesRes = await sql`
      SELECT COUNT(*)::int AS count 
      FROM pacientes 
      WHERE nutricionista_id = ${nutricionistaId}
    `;
    const totalPacientes = pacientesRes?.[0]?.count ?? 0;

    // 2. Consultas da semana atual (segunda a domingo)
    const consultasRes = await sql`
      SELECT COUNT(c.id)::int AS count 
      FROM consultas c 
      JOIN pacientes p ON c.paciente_id = p.id 
      WHERE p.nutricionista_id = ${nutricionistaId} 
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE) 
        AND c.data_consulta < (date_trunc('week', CURRENT_DATE) + INTERVAL '7 days')
    `;
    const consultasSemana = consultasRes?.[0]?.count ?? 0;

    // 3. Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
    const semRetornoRes = await sql`
      WITH ultimas_consultas AS (
        SELECT 
          p.id AS paciente_id,
          p.nome AS paciente_nome,
          p.whatsapp,
          p.email,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS ultimo_proximo_retorno,
          COUNT(c.id) AS total_consultas
        FROM pacientes p
        JOIN consultas c ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutricionistaId}
        GROUP BY p.id, p.nome, p.whatsapp, p.email
      )
      SELECT 
        paciente_id,
        paciente_nome,
        whatsapp,
        email,
        ultima_consulta,
        ultimo_proximo_retorno,
        (CURRENT_DATE - ultima_consulta)::int AS dias_sem_consulta
      FROM ultimas_consultas
      WHERE ultima_consulta < CURRENT_DATE - INTERVAL '30 days'
        AND (ultimo_proximo_retorno IS NULL OR ultimo_proximo_retorno < CURRENT_DATE)
      ORDER BY ultima_consulta ASC
    `;

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno: semRetornoRes || []
    };
  } catch (error) {
    console.error('Erro ao consultar métricas do dashboard no Neon:', error);
    throw error;
  }
}

/**
 * Creates demonstration / seed records for a nutritionist if they wish to preview the dashboard with sample patients & appointments.
 * @param {string} nutricionistaId
 */
export async function seedSampleDashboardData(nutricionistaId) {
  if (!sql || !nutricionistaId) return;

  try {
    // 1. Patient 1: Active, consulted this week
    const p1 = await sql`
      INSERT INTO pacientes (nutricionista_id, nome, whatsapp, email, peso_inicial, altura, objetivos)
      VALUES (${nutricionistaId}, 'Mariana Ribeiro Silva', '(11) 98765-4321', 'mariana.silva@exemplo.com', 68.5, 1.65, ARRAY['Emagrecimento', 'Hipertrofia'])
      RETURNING id
    `;

    // 2. Patient 2: Active, consulted this week + has scheduled return
    const p2 = await sql`
      INSERT INTO pacientes (nutricionista_id, nome, whatsapp, email, peso_inicial, altura, objetivos)
      VALUES (${nutricionistaId}, 'Carlos Eduardo Santos', '(11) 97654-3210', 'carlos.edu@exemplo.com', 84.0, 1.78, ARRAY['Saúde Geral', 'Controle Glicêmico'])
      RETURNING id
    `;

    // 3. Patient 3: Overdue >30 days with no return scheduled (Sem Retorno)
    const p3 = await sql`
      INSERT INTO pacientes (nutricionista_id, nome, whatsapp, email, peso_inicial, altura, objetivos)
      VALUES (${nutricionistaId}, 'Camila Fernandes Costa', '(11) 96543-2109', 'camila.costa@exemplo.com', 62.0, 1.60, ARRAY['Reeducação Alimentar'])
      RETURNING id
    `;

    // 4. Patient 4: Overdue >45 days with no return scheduled (Sem Retorno)
    const p4 = await sql`
      INSERT INTO pacientes (nutricionista_id, nome, whatsapp, email, peso_inicial, altura, objetivos)
      VALUES (${nutricionistaId}, 'Rodrigo Albuquerque Lima', '(11) 95432-1098', 'rodrigo.lima@exemplo.com', 91.5, 1.82, ARRAY['Perda de Gordura'])
      RETURNING id
    `;

    // Insert consultations
    // P1: Today/this week
    if (p1?.[0]?.id) {
      await sql`
        INSERT INTO consultas (paciente_id, data_consulta, peso, cintura, quadril, observacoes, proximo_retorno)
        VALUES (${p1[0].id}, CURRENT_DATE, 67.2, 74.0, 98.0, 'Excelente evolução no plano alimentar.', CURRENT_DATE + INTERVAL '30 days')
      `;
    }

    // P2: 2 days ago this week
    if (p2?.[0]?.id) {
      await sql`
        INSERT INTO consultas (paciente_id, data_consulta, peso, cintura, quadril, observacoes, proximo_retorno)
        VALUES (${p2[0].id}, CURRENT_DATE - INTERVAL '2 days', 83.1, 88.0, 102.0, 'Início de nova fase com suplementação.', CURRENT_DATE + INTERVAL '28 days')
      `;
    }

    // P3: 42 days ago, NO next return
    if (p3?.[0]?.id) {
      await sql`
        INSERT INTO consultas (paciente_id, data_consulta, peso, cintura, quadril, observacoes, proximo_retorno)
        VALUES (${p3[0].id}, CURRENT_DATE - INTERVAL '42 days', 62.0, 72.0, 96.0, 'Primeira consulta de anamnese.', NULL)
      `;
    }

    // P4: 55 days ago, NO next return
    if (p4?.[0]?.id) {
      await sql`
        INSERT INTO consultas (paciente_id, data_consulta, peso, cintura, quadril, observacoes, proximo_retorno)
        VALUES (${p4[0].id}, CURRENT_DATE - INTERVAL '55 days', 91.5, 96.0, 108.0, 'Paciente relatou dificuldade na rotina.', NULL)
      `;
    }

    return true;
  } catch (err) {
    console.error('Erro ao gerar dados de exemplo no Neon:', err);
    throw err;
  }
}
