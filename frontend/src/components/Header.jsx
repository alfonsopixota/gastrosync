export default function Header({ user, view, setView, connected, onLogout }) {
  return (
    <header className="app-header" role="banner">
      <h1><span>Gastro</span>Sync</h1>
      <nav role="tablist" aria-label="Vistas">
        {(user.role === 'admin' || user.role === 'waiter') && (
          <button
            role="tab"
            aria-selected={view === 'waiter'}
            aria-controls="main-content"
            onClick={() => setView('waiter')}
            className={view === 'waiter' ? 'active' : ''}
          >
            Camarero
          </button>
        )}
        {(user.role === 'admin' || user.role === 'kitchen') && (
          <button
            role="tab"
            aria-selected={view === 'kitchen'}
            aria-controls="main-content"
            onClick={() => setView('kitchen')}
            className={view === 'kitchen' ? 'active' : ''}
          >
            Cocina
          </button>
        )}
      </nav>
      <div className="header-right">
        <span
          className={`status ${connected ? 'connected' : 'disconnected'}`}
          role="status"
          aria-live="polite"
        >
          {connected ? 'En vivo' : 'Desconectado'}
        </span>
        <span className="user-info" aria-label={`Usuario: ${user.name}, rol: ${user.role}`}>
          {user.name} ({user.role})
        </span>
        <button className="btn-logout" onClick={onLogout} aria-label="Cerrar sesión">
          Salir
        </button>
      </div>
    </header>
  );
}
