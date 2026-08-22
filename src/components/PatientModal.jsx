import React from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  FileText
} from 'lucide-react';

export function PatientModal({ patient, onClose, onNavigateToPatients }) {
  if (!patient) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não registrada';
    try {
      // Avoid timezone shifting for simple date strings
      const parts = dateStr.toString().split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const cleanPhone = patient.whatsapp ? patient.whatsapp.replace(/\D/g, '') : '';
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(patient.paciente_nome || patient.nome)}%2C%20tudo%20bem%3F%20Aqui%20%C3%A9%20da%20cl%C3%ADnica%20de%20nutri%C3%A7%C3%A3o.%20Vamos%20agendar%20o%20seu%20retorno%3F`
    : null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-icon">
            <User size={24} />
          </div>
          <div className="modal-header-info">
            <h2>{patient.paciente_nome || patient.nome}</h2>
            <span className="modal-subtitle">Perfil do Paciente • Acompanhamento Nutricional</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Status Alert */}
          <div className="patient-status-banner warning">
            <AlertTriangle size={20} className="status-banner-icon" />
            <div className="status-banner-content">
              <strong>Atenção: Paciente sem retorno agendado</strong>
              <p>
                A última consulta ocorreu há <b>{patient.dias_sem_consulta || 'mais de 30'} dias</b> ({formatDate(patient.ultima_consulta)}). Entre em contato para agendar o acompanhamento.
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="patient-details-grid">
            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={15} /> Última Consulta
              </span>
              <span className="detail-value highlight">
                {formatDate(patient.ultima_consulta)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Clock size={15} /> Dias sem Atendimento
              </span>
              <span className="detail-value text-danger">
                {patient.dias_sem_consulta ? `${patient.dias_sem_consulta} dias` : '> 30 dias'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Phone size={15} /> WhatsApp / Telefone
              </span>
              <span className="detail-value">
                {patient.whatsapp || 'Não informado'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Mail size={15} /> E-mail
              </span>
              <span className="detail-value">
                {patient.email || 'Não informado'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="patient-quick-actions">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-action"
              >
                <MessageCircle size={18} />
                <span>Contatar via WhatsApp</span>
                <ExternalLink size={14} className="icon-ext" />
              </a>
            )}

            <button
              className="btn-full-profile"
              onClick={() => {
                onClose();
                if (onNavigateToPatients) onNavigateToPatients(patient.paciente_id || patient.id);
              }}
            >
              <FileText size={18} />
              <span>Ver ficha completa de pacientes</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
