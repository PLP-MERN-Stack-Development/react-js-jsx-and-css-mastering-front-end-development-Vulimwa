import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from './Card';
import { Button } from './Button';

export function Login() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', userName: '' });
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login(form.email);
      } else {
        await register({ userName: form.userName, email: form.email });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 420 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={onSubmit} className="stack">
          {mode === 'register' && (
            <input
              className="input"
              type="text"
              placeholder="Your name"
              value={form.userName}
              onChange={(e) => setForm(prev => ({ ...prev, userName: e.target.value }))}
              required
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
          <div className="muted">
            {mode === 'login' ? (
              <span>
                New here?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }}>Create an account</a>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Sign in</a>
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

