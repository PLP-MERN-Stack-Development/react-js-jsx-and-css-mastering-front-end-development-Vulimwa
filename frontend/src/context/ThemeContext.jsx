import { ThemeContext } from './theme-context';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
