import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor ingrese sus credenciales');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const success = login(email.trim().toLowerCase(), password, rememberMe);
    setLoading(false);
    if (success) {
      toast.success('Bienvenido al sistema Azor Drive');
      navigate('/dashboard');
    } else {
      toast.error('Credenciales incorrectas. Verifique email y contrasena.');
    }
  };

  const demoUsers = [
    { email: 'admin@azor.com', pass: 'Admin123!', label: 'Administrador' },
    { email: 'ingenieria@azor.com', pass: 'Ingenieria123!', label: 'Ingenieria' },
    { email: 'mecanico@azor.com', pass: 'Mecanico123!', label: 'Mecanico' },
    { email: 'almacen@azor.com', pass: 'Almacen123!', label: 'Almacen' },
  ];

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo-area">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
              <rect width="80" height="80" rx="16" fill="#1B2A4A"/>
              <text x="40" y="50" textAnchor="middle" fontFamily="Arial" fontSize="26" fontWeight="bold" fill="#5A9BD5" letterSpacing="2">AZ</text>
              <path d="M10 62 L40 28 L70 62 L58 62 L40 44 L22 62 Z" fill="rgba(90,155,213,0.3)"/>
            </svg>
            <div className="login-logo-title">AZOR DRIVE</div>
            <div className="login-logo-subtitle">SISTEMA DE GESTION AERONAUTICA</div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="p-fluid">
              <div className="p-field" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Correo Electronico
                </label>
                <span className="p-input-icon-left" style={{ width: '100%' }}>
                  <i className="pi pi-envelope" />
                  <InputText
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@azor.com"
                    type="email"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    autoComplete="email"
                  />
                </span>
              </div>

              <div className="p-field" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Contrasena
                </label>
                <span className="p-input-icon-left" style={{ width: '100%' }}>
                  <i className="pi pi-lock" />
                  <InputText
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contrasena"
                    type="password"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    autoComplete="current-password"
                  />
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Checkbox
                  inputId="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.checked ?? false)}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Recordarme
                </label>
              </div>

              <Button
                type="submit"
                label={loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
                loading={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2C4A7C, #3B6CB4)',
                  border: 'none',
                  padding: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </form>

          {/* Accesos rapidos demo */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
              Accesos rapidos (Demo)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.pass); }}
                  style={{
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.72rem',
                    color: 'var(--color-primary-500)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'background 0.15s',
                  }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '1rem' }}>
          Azor Aeroservice &copy; 2024 - Sistema de Gestion Aeronautica
        </p>
      </div>
    </div>
  );
};
