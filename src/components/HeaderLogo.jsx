import React from 'react';

export function HeaderLogo({ subtitle = "Gestão Inteligente para Nutricionistas" }) {
  return (
    <header className="auth-header">
      <div className="logo-badge-container">
        <div className="logo-symbol" title="Ale Nutri Logo">
          AL
        </div>
        <h1 className="logo-text">
          Ale <span>Nutri</span>
        </h1>
      </div>
      {subtitle && <p className="logo-subtitle">{subtitle}</p>}
    </header>
  );
}
