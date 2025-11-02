import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { TaskManager } from './components/TaskManager';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  if (!user) {
    return (
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider>
      <Layout>
        <TaskManager />
      </Layout>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
