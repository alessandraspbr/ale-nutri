import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { authClient, saveLocalSession } from '../lib/auth';
import { syncNutricionista } from '../lib/db';

export function LoginForm({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Call Neon Auth sign in method
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('Login error response:', error);
        if (error.status === 401 || error.code === 'INVALID_EMAIL_OR_PASSWORD' || error.message?.toLowerCase().includes('invalid')) {
          setErrorMessage('E-mail ou senha incorretos. Por favor, verifique suas credenciais.');
        } else if (error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Não foi possível realizar o login. Verifique seus dados e tente novamente.');
        }
        setLoading(false);
        return;
      }

      // Successful login
      const user = data?.user || {
        email: email.trim(),
        name: data?.user?.name || email.split('@')[0]
      };

      // Sync nutritionist data with Neon database table
      await syncNutricionista({
        nome: user.name || email.split('@')[0],
        email: user.email
      });

      // Save local session
      saveLocalSession(user);

      // Trigger callback
      onLoginSuccess(user);
    } catch (err) {
      console.error('Unhandled login error:', err);
      // Fallback mode if network error or Neon Auth unreachable
      setErrorMessage('Ocorreu um erro ao se conectar com o servidor. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-card-title">Acessar Conta</h2>
      <p className="auth-card-desc">Entre com seu e-mail e senha de nutricionista</p>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">E-mail profissional</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="seu.email@nutri.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Senha</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <span className="form-helper">Mínimo de 9 caracteres</span>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Entrar</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-switch">
        <span>Não tem conta? </span>
        <button
          type="button"
          className="auth-switch-btn"
          onClick={onSwitchToRegister}
          disabled={loading}
        >
          Cadastre-se
        </button>
      </div>
    </div>
  );
}
