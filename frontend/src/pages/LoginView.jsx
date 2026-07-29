import { useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

export default function LoginView({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('waiter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const data = await apiRegister({ name, email, password, role, restaurant: import.meta.env.VITE_RESTAURANT_ID || '6a69c016061902ab10237c49' });
        onLogin(data.user);
      } else {
        const data = await apiLogin(email, password);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view">
      <div className="login-card">
        <h1><span>Gastro</span>Sync</h1>
        <p className="login-subtitle">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</p>

        {error && <p className="login-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="login-field">
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {isRegister && (
            <div className="login-field">
              <label htmlFor="role">Rol</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="waiter">Camarero</option>
                <option value="kitchen">Cocina</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <button
          className="login-toggle"
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}
