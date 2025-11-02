import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';

export function Navbar() {
  const { toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <h1 className="navbar__title">Task Manager</h1>
        </div>
        <div className="navbar__actions">
          {user && <span className="muted" style={{ marginRight: 8 }}>{user.email}</span>}
          <Button variant="secondary" onClick={toggleTheme}>Toggle Theme</Button>
          {user && <Button variant="secondary" onClick={logout}>Sign Out</Button>}
        </div>
      </div>
    </nav>
  );
}
