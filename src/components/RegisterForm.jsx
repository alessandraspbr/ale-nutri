import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authClient, saveLocalSession } from '../lib/auth';
import { syncNutricionista } from '../lib/db';

export function RegisterForm({ onSwitchToLogin, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Verifique a confirmação de senha.');
      return;
    }

    setLoading(true);

    try {
      // Call Neon Auth sign up method
      const { data, error } = await authClient.signUp.email({
        email: email.trim(),
        password: password,
        name: name.trim()
      });

      if (error) {
        console.error('Register error response:', error);
        if (error.message?.toLowerCase().includes('already exists') || error.code === 'USER_ALREADY_EXISTS') {
          setErrorMessage('Este e-mail já está cadastrado. Tente fazer login.');
        } else if (error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Não foi possível criar a conta. Tente novamente.');
        }
        setLoading(false);
        return;
      }

      // Sincronizar na tabela nutricionistas do Neon
      await syncNutricionista({
        nome: name.trim(),
        email: email.trim()
      });

      const user = data?.user || {
        name: name.trim(),
        email: email.trim()
      };

      setSuccessMessage('Conta criada com sucesso! Redirecionando...');
      saveLocalSession(user);

      setTimeout(() => {
        onRegisterSuccess(user);
      }, 1000);
    } catch (err) {
      console.error('Unhandled register error:', err);
      setErrorMessage('Erro ao se conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-card-title">Criar Conta</h2>
      <p className="auth-card-desc">Cadastre-se como nutricionista para acessar a plataforma</p>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" role="alert">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="register-name">Nome completo</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="Dra. Alessandra Lopes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-email">E-mail profissional</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="alessandra@nutri.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-password">Senha</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="No mínimo 9 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
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
          <span className="form-helper">No mínimo 9 caracteres</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-confirm-password">Confirmar senha</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Digite novamente sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="input-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" />
              <span>Criando conta...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Criar conta</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-switch">
        <span>Já tem conta? </span>
        <button
          type="button"
          className="auth-switch-btn"
          onClick={onSwitchToLogin}
          disabled={loading}
        >
          Faça login
        </button>
      </div>
    </div>
  );
}
