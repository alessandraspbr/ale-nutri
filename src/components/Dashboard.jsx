import React from 'react';
import { LogOut, Users, Calendar, Utensils, Award, Activity } from 'lucide-react';
import { clearLocalSession } from '../lib/auth';

export function Dashboard({ user, onLogout }) {
  const handleLogout = () => {
    clearLocalSession();
    onLogout();
  };

  const displayName = user?.name || user?.nome || (user?.email ? user.email.split('@')[0] : 'Nutricionista');

  return (
    <div className="dashboard-page">
      {/* Dashboard Top Navbar */}
      <header className="dashboard-header">
        <div className="dashboard-nav-logo">
          <div className="logo-symbol" style={{ width: 38, height: 38, fontSize: '1rem' }}>
            AL
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Ale <span style={{ color: 'var(--primary-600)' }}>Nutri</span>
          </span>
        </div>

        <div className="user-profile-menu">
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Encerrar sessão">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="welcome-banner">
          <h1>Bem-vinda, {displayName}! 👋</h1>
          <p>Seu sistema de gestão nutricional está pronto para uso. O que deseja consultar hoje?</p>
        </div>

        <div className="dashboard-cards">
          <div className="dash-card">
            <div className="dash-card-icon">
              <Users size={24} />
            </div>
            <h3>Pacientes</h3>
            <p>Gerencie seus pacientes, anamneses, restrições alimentares e histórico de consultas.</p>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">
              <Calendar size={24} />
            </div>
            <h3>Consultas</h3>
            <p>Agende retornos, registre medidas antropométricas e acompanhe a evolução do peso.</p>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">
              <Utensils size={24} />
            </div>
            <h3>Planos Alimentares</h3>
            <p>Monte dietas personalizadas, calculando calorias e distribuição de macronutrientes.</p>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">
              <Activity size={24} />
            </div>
            <h3>Métricas & Neon DB</h3>
            <p>Seus dados estão protegidos com Row Level Security (RLS) e integrados com o Neon PostgreSQL.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
