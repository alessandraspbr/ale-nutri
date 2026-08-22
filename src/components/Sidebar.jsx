import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { clearLocalSession } from '../lib/auth';
import { SidebarInstallButton } from './InstallPWA';

export function Sidebar({ 
  currentTab = 'dashboard', 
  onSelectTab, 
  user, 
  onLogout,
  mobileOpen = false,
  onCloseMobile
}) {
  const handleLogout = () => {
    clearLocalSession();
    if (onLogout) onLogout();
  };

  const displayName = user?.name || user?.nome || (user?.email ? user.email.split('@')[0] : 'Nutricionista');
  const userInitials = displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('') || 'AN';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Principal',
      description: 'Visão geral e métricas'
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: Users,
      description: 'Gestão e fichas clínicas'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-container ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrapper">
            <div className="brand-icon-box">
              <span className="brand-icon-text">AL</span>
            </div>
            <div className="brand-titles">
              <span className="brand-name">
                Ale <span className="brand-name-highlight">Nutri</span>
              </span>
              <span className="brand-subtitle">Gestão Nutricional</span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            className="sidebar-close-mobile" 
            onClick={onCloseMobile}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-section">
          <span className="sidebar-section-label">Menu Principal</span>
          <nav className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                >
                  <div className="nav-btn-content">
                    <div className={`nav-icon-container ${isActive ? 'active' : ''}`}>
                      <Icon size={19} />
                    </div>
                    <span className="nav-label">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                  {isActive && <div className="nav-active-indicator" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Neon Database Status Badge */}
        <div className="sidebar-neon-status">
          <div className="neon-status-pill">
            <div className="neon-status-dot" />
            <ShieldCheck size={14} className="neon-status-icon" />
            <span>Neon DB Conectado</span>
          </div>
          <p className="neon-status-desc">Dados sincronizados em tempo real com RLS</p>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="sidebar-footer">
          {/* PWA Install Action */}
          <SidebarInstallButton />

          <div className="sidebar-user-card">
            <div className="user-avatar" title={displayName}>
              {userInitials}
            </div>
            <div className="user-details">
              <span className="user-name" title={displayName}>{displayName}</span>
              <span className="user-email" title={user?.email}>{user?.email || 'nutri@alenutri.com'}</span>
            </div>
          </div>

          <button 
            id="sidebar-logout-button"
            className="sidebar-logout-btn" 
            onClick={handleLogout}
            title="Encerrar sessão"
          >
            <LogOut size={16} />
            <span>Sair do sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
}
