import React, { useState, useEffect } from 'react';
import { HeaderLogo } from './components/HeaderLogo';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { getLocalSession } from './lib/auth';

export function App() {
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check existing session on startup
  useEffect(() => {
    const savedUser = getLocalSession();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setCheckingSession(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center' }}>
        <div className="spinner spinner-dark" />
      </div>
    );
  }

  // If user is already logged in, redirect directly to dashboard
  if (currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-blob-1" />
      <div className="auth-bg-blob-2" />

      <HeaderLogo subtitle={view === 'login' ? 'Acesse o seu painel de nutricionista' : 'Crie sua conta profissional no Ale Nutri'} />

      {view === 'login' ? (
        <LoginForm
          onSwitchToRegister={() => setView('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterForm
          onSwitchToLogin={() => setView('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}

export default App;
