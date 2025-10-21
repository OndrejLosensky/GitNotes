import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type ColorTheme, getThemeByName, getDefaultTheme } from '../themes/theme';

interface ThemeContextType {
  activeTheme: string;
  currentThemeData: ColorTheme;
  setActiveTheme: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'active-theme';

function applyThemeToDOM(theme: ColorTheme) {
  const root = document.documentElement;
  
  // Apply all color variables to :root
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  
  root.style.setProperty('--bg-primary', theme.colors.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.colors.bgSecondary);
  root.style.setProperty('--bg-tertiary', theme.colors.bgTertiary);
  
  root.style.setProperty('--sidebar-bg', theme.colors.sidebarBg);
  root.style.setProperty('--sidebar-hover', theme.colors.sidebarHover);
  root.style.setProperty('--sidebar-active', theme.colors.sidebarActive);
  
  root.style.setProperty('--text-primary', theme.colors.textPrimary);
  root.style.setProperty('--text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--text-tertiary', theme.colors.textTertiary);
  
  root.style.setProperty('--border-color', theme.colors.border);
  root.style.setProperty('--border-light', theme.colors.borderLight);
  
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-error', theme.colors.error);
  root.style.setProperty('--color-info', theme.colors.info);
  
  root.style.setProperty('--git-added', theme.colors.gitAdded);
  root.style.setProperty('--git-modified', theme.colors.gitModified);
  root.style.setProperty('--git-deleted', theme.colors.gitDeleted);
  
  root.style.setProperty('--toolbar-bg', theme.colors.toolbarBg);
  root.style.setProperty('--toolbar-text', theme.colors.toolbarText);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or use default
  const [activeTheme, setActiveThemeState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || getDefaultTheme().name;
  });

  const [currentThemeData, setCurrentThemeData] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const theme = getThemeByName(saved);
      if (theme) return theme;
    }
    return getDefaultTheme();
  });

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    applyThemeToDOM(currentThemeData);
  }, [currentThemeData]);

  const setActiveTheme = (name: string) => {
    const theme = getThemeByName(name);
    if (theme) {
      setActiveThemeState(name);
      setCurrentThemeData(theme);
      localStorage.setItem(STORAGE_KEY, name);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        currentThemeData,
        setActiveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

