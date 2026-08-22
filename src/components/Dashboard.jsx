import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  UserCheck, 
  TrendingUp, 
  ChevronRight, 
  CalendarDays,
  Menu,
  Sparkles,
  Phone,
  ArrowRight,
  Database
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { PatientModal } from './PatientModal';
import { PatientsView } from './PatientsView';
import { 
  getOrSyncNutricionista, 
  fetchDashboardMetrics, 
  seedSampleDashboardData 
} from '../lib/dashboardService';

export function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pacientes'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Neon DB state
  const [nutricionistaId, setNutricionistaId] = useState(null);
  const [metrics, setMetrics] = useState({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: []
  });

  // Modal / Selected patient
  const [selectedPatient, setSelectedPatient] = useState(null);

  const displayName = user?.name || user?.nome || (user?.email ? user.email.split('@')[0] : 'Nutricionista');

  // Load metrics from Neon PostgreSQL
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setErrorMessage('');

    try {
      // 1. Ensure/resolve the nutritionist's Neon UUID
      let currentNutriId = nutricionistaId;
      if (!currentNutriId && user?.email) {
        const nutriRecord = await getOrSyncNutricionista({
          email: user.email,
          nome: displayName
        });
        if (nutriRecord?.id) {
          currentNutriId = nutriRecord.id;
          setNutricionistaId(nutriRecord.id);
        }
      }

      if (!currentNutriId) {
        setErrorMessage('Não foi possível identificar o nutricionista no banco de dados Neon.');
        return;
      }

      // 2. Fetch metrics in real-time
      const data = await fetchDashboardMetrics(currentNutriId);
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setErrorMessage('Erro ao carregar os dados em tempo real do Neon. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, displayName, nutricionistaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Seed sample data helper
  const handleSeedDemoData = async () => {
    if (!nutricionistaId) return;
    setSeeding(true);
    try {
      await seedSampleDashboardData(nutricionistaId);
      await loadData(true);
    } catch (err) {
      console.error('Erro ao gerar dados de teste:', err);
      alert('Ocorreu um erro ao gerar dados de demonstração no Neon.');
    } finally {
      setSeeding(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.toString().split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const getTodayFormatted = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('pt-BR', options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  return (
    <div className="dashboard-layout">
      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="dashboard-content-wrapper">
        {/* Top Mobile Bar */}
        <header className="dashboard-topbar">
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          
          <div className="topbar-logo-mobile">
            <span className="topbar-logo-text">Ale <span>Nutri</span></span>
          </div>

          <div className="topbar-actions">
            <button 
              className={`btn-icon-refresh ${refreshing ? 'spinning' : ''}`}
              onClick={() => loadData(true)}
              title="Atualizar dados do Neon em tempo real"
              disabled={refreshing || loading}
            >
              <RefreshCw size={17} />
              <span className="hide-mobile">Atualizar</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views */}
        {activeTab === 'pacientes' ? (
          <main className="dashboard-main-container">
            <PatientsView onBackToDashboard={() => setActiveTab('dashboard')} />
          </main>
        ) : (
          <main className="dashboard-main-container">
            {/* Header Greeting Banner */}
            <div className="dashboard-hero-section">
              <div className="hero-text">
                <div className="hero-date-badge">
                  <CalendarDays size={15} />
                  <span>{getTodayFormatted()}</span>
                </div>
                <h1 className="hero-title">
                  Olá, <span className="text-gradient">{displayName}</span>! 👋
                </h1>
                <p className="hero-description">
                  Acompanhe em tempo real o status dos seus pacientes e consultas no Neon PostgreSQL.
                </p>
              </div>

              <div className="hero-actions">
                <button 
                  id="btn-refresh-dashboard"
                  className="btn-refresh-pill" 
                  onClick={() => loadData(true)}
                  disabled={refreshing || loading}
                  title="Recarregar métricas do banco Neon"
                >
                  <RefreshCw size={16} className={refreshing ? 'icon-spin' : ''} />
                  <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="dashboard-alert-banner">
                <AlertCircle size={20} />
                <div className="alert-text">
                  <strong>Atenção</strong>
                  <p>{errorMessage}</p>
                </div>
                <button className="btn-alert-retry" onClick={() => loadData()}>
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className="dashboard-loading-state">
                <div className="spinner spinner-dark" />
                <p>Carregando dados em tempo real do Neon...</p>
              </div>
            ) : (
              <>
                {/* 3 Main Metric Cards Grid */}
                <div className="metrics-grid">
                  {/* CARD 1: Total de pacientes ativos */}
                  <div className="metric-card card-primary" id="card-total-pacientes">
                    <div className="metric-card-header">
                      <div className="metric-icon-box icon-emerald">
                        <Users size={22} />
                      </div>
                      <span className="metric-badge badge-emerald">
                        <TrendingUp size={13} /> Ativos
                      </span>
                    </div>

                    <div className="metric-card-body">
                      <span className="metric-card-label">Total de Pacientes Ativos</span>
                      <div className="metric-value-row">
                        <span className="metric-number">{metrics.totalPacientes}</span>
                        <span className="metric-unit">cadastrados</span>
                      </div>
                      <p className="metric-card-desc">
                        Pacientes sob seus cuidados profissionais
                      </p>
                    </div>

                    <div className="metric-card-footer">
                      <button 
                        className="metric-action-link"
                        onClick={() => setActiveTab('pacientes')}
                      >
                        <span>Ver todos os pacientes</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: Consultas da semana */}
                  <div className="metric-card card-teal" id="card-consultas-semana">
                    <div className="metric-card-header">
                      <div className="metric-icon-box icon-teal">
                        <Calendar size={22} />
                      </div>
                      <span className="metric-badge badge-teal">
                        <CalendarDays size={13} /> Esta Semana
                      </span>
                    </div>

                    <div className="metric-card-body">
                      <span className="metric-card-label">Consultas da Semana</span>
                      <div className="metric-value-row">
                        <span className="metric-number">{metrics.consultasSemana}</span>
                        <span className="metric-unit">consultas</span>
                      </div>
                      <p className="metric-card-desc">
                        Registradas no período de segunda a domingo
                      </p>
                    </div>

                    <div className="metric-card-footer">
                      <div className="metric-footer-info">
                        <Clock size={14} />
                        <span>Atualizado hoje</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary Pill / DB Indicator */}
                  <div className="metric-card card-slate" id="card-neon-status">
                    <div className="metric-card-header">
                      <div className="metric-icon-box icon-slate">
                        <Database size={22} />
                      </div>
                      <span className="metric-badge badge-slate">
                        <Sparkles size={13} /> Neon Serverless
                      </span>
                    </div>

                    <div className="metric-card-body">
                      <span className="metric-card-label">Segurança & RLS</span>
                      <div className="metric-value-row">
                        <span className="metric-status-text">100% Protegido</span>
                      </div>
                      <p className="metric-card-desc">
                        Isolamento por Row Level Security exclusivo para seus dados
                      </p>
                    </div>

                    <div className="metric-card-footer">
                      <div className="metric-footer-info">
                        <CheckCircle2 size={14} className="text-success" />
                        <span>Banco operacional</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Pacientes sem Retorno */}
                <section className="section-card-large" id="card-pacientes-sem-retorno">
                  <div className="section-card-header">
                    <div className="section-title-group">
                      <div className="section-icon-box warning">
                        <Clock size={22} />
                      </div>
                      <div>
                        <div className="section-title-row">
                          <h2 className="section-title">Pacientes sem Retorno</h2>
                          <span className={`count-badge ${metrics.pacientesSemRetorno.length > 0 ? 'badge-warning' : 'badge-success'}`}>
                            {metrics.pacientesSemRetorno.length} {metrics.pacientesSemRetorno.length === 1 ? 'paciente' : 'pacientes'}
                          </span>
                        </div>
                        <p className="section-subtitle">
                          Pacientes cuja última consulta foi realizada há mais de 30 dias e que não possuem retorno agendado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="section-card-content">
                    {metrics.pacientesSemRetorno.length === 0 ? (
                      /* Empty State */
                      <div className="empty-state-container" id="empty-state-sem-retorno">
                        <div className="empty-state-icon-wrapper">
                          <CheckCircle2 size={40} className="empty-icon-success" />
                        </div>
                        <h3 className="empty-state-title">Nenhum paciente sem retorno no momento</h3>
                        <p className="empty-state-desc">
                          Parabéns! Todos os seus pacientes ativos estão em dia com os retornos nutricionais.
                        </p>

                        {/* Demo data seeding trigger if total patients is 0 */}
                        {metrics.totalPacientes === 0 && (
                          <div className="seed-demo-box">
                            <p className="seed-demo-text">
                              Deseja popular dados de teste para visualizar os cards com pacientes de exemplo?
                            </p>
                            <button 
                              className="btn-seed-data"
                              onClick={handleSeedDemoData}
                              disabled={seeding}
                            >
                              <Sparkles size={16} />
                              <span>{seeding ? 'Populando Neon DB...' : 'Gerar Pacientes e Consultas de Teste'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* List of Overdue Patients */
                      <div className="overdue-patients-list">
                        {metrics.pacientesSemRetorno.map((patient) => (
                          <div
                            key={patient.paciente_id}
                            className="overdue-patient-item"
                            onClick={() => setSelectedPatient(patient)}
                            role="button"
                            tabIndex={0}
                            title={`Clique para ver o perfil de ${patient.paciente_nome}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedPatient(patient);
                              }
                            }}
                          >
                            <div className="patient-avatar-box">
                              <UserCheck size={20} />
                            </div>

                            <div className="patient-main-info">
                              <span className="patient-name-link">
                                {patient.paciente_nome}
                              </span>
                              <div className="patient-meta-row">
                                <span className="patient-meta-date">
                                  <Calendar size={13} />
                                  Última consulta: {formatDate(patient.ultima_consulta)}
                                </span>
                                {patient.whatsapp && (
                                  <span className="patient-meta-phone hide-mobile">
                                    <Phone size={13} />
                                    {patient.whatsapp}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="patient-status-col">
                              <span className="overdue-days-pill">
                                Há {patient.dias_sem_consulta || '30+'} dias
                              </span>
                              <button 
                                className="btn-view-patient-profile"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPatient(patient);
                                }}
                              >
                                <span>Ver perfil</span>
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </main>
        )}
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onNavigateToPatients={(id) => {
            setSelectedPatient(null);
            setActiveTab('pacientes');
          }}
        />
      )}
    </div>
  );
}
export default Dashboard;
