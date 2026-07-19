import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { Button, Input } from '../components/ui';
import styles from './Auth.module.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await register(form.email, form.password, form.name);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setForm({ email: 'demo@prism.io', password: 'demo123', name: '' });
    setLoading(true);
    try {
      await login('demo@prism.io', 'demo123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg viewBox="0 0 32 32" className={styles.logoIcon}>
              <defs>
                <linearGradient id="authLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <polygon points="16,2 28,28 4,28" fill="url(#authLogoGrad)" />
              <polygon points="16,8 23,24 9,24" fill="#0a0a0f" />
            </svg>
            <span className={styles.logoText}>Prism</span>
          </div>
          <h1 className={styles.title}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Sign in to continue to your workspace'
              : 'Start managing projects like a pro'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <Input
              label="Full name"
              placeholder="Alex Chen"
              icon={User}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <div className={styles.error}>{error}</div>}

          <Button type="submit" loading={loading} className={styles.submitBtn}>
            {isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <Button
          variant="secondary"
          onClick={handleDemoLogin}
          loading={loading}
          className={styles.demoBtn}
        >
          Try demo account
        </Button>

        <p className={styles.switch}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
