import React from 'react';
import { Users, UserPlus, Search, ArrowLeft } from 'lucide-react';

export function PatientsView({ onBackToDashboard, onNewPatient }) {
  return (
    <div className="patients-view-page">
      <div className="view-header">
        <div>
          <button className="btn-back-link" onClick={onBackToDashboard}>
            <ArrowLeft size={16} />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="view-title">Gestão de Pacientes</h1>
          <p className="view-subtitle">Consulte fichas de anamnese, planos alimentares e histórico antropométrico.</p>
        </div>
      </div>

      <div className="patients-empty-card">
        <div className="patients-empty-icon">
          <Users size={36} />
        </div>
        <h3>Módulo de Pacientes</h3>
        <p>Este módulo será configurado na próxima etapa para permitir cadastro completo de anamneses, medidas e planos alimentares.</p>
        <button className="btn-primary" onClick={onBackToDashboard} style={{ marginTop: '1rem' }}>
          Voltar ao Dashboard Principal
        </button>
      </div>
    </div>
  );
}
