export interface ColorTheme {
  name: string;
  isDark: boolean;
  colors: {
    // Primary colors
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    
    // Backgrounds
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    
    // Sidebar
    sidebarBg: string;
    sidebarHover: string;
    sidebarActive: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    
    // Borders
    border: string;
    borderLight: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Git specific
    gitAdded: string;
    gitModified: string;
    gitDeleted: string;
    
    // Toolbar
    toolbarBg: string;
    toolbarText: string;
  };
}

export const themes: ColorTheme[] = [
  {
    name: 'Ocean Light',
    isDark: false,
    colors: {
      // Primary colors
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      
      // Backgrounds
      bgPrimary: '#ffffff',
      bgSecondary: '#f9fafb',
      bgTertiary: '#f3f4f6',
      
      // Sidebar
      sidebarBg: '#ffffff',
      sidebarHover: '#f3f4f6',
      sidebarActive: '#e0e7ff',
      
      // Text
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      
      // Borders
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Git specific
      gitAdded: '#10b981',
      gitModified: '#f59e0b',
      gitDeleted: '#ef4444',
      
      // Toolbar
      toolbarBg: '#1e3a5f',
      toolbarText: '#ffffff',
    },
  },
  {
    name: 'Midnight Purple',
    isDark: true,
    colors: {
      // Primary colors
      primary: '#a78bfa',
      primaryHover: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#c084fc',
      
      // Backgrounds
      bgPrimary: '#1a1625',
      bgSecondary: '#221c30',
      bgTertiary: '#2d2640',
      
      // Sidebar
      sidebarBg: '#0f0d15',
      sidebarHover: '#221c30',
      sidebarActive: '#3730a3',
      
      // Text
      textPrimary: '#f3f4f6',
      textSecondary: '#d1d5db',
      textTertiary: '#9ca3af',
      
      // Borders
      border: '#3730a3',
      borderLight: '#2d2640',
      
      // Status colors
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      
      // Git specific
      gitAdded: '#34d399',
      gitModified: '#fbbf24',
      gitDeleted: '#f87171',
      
      // Toolbar
      toolbarBg: '#0f0d15',
      toolbarText: '#f3f4f6',
    },
  },
];

export function getThemeByName(name: string): ColorTheme | undefined {
  return themes.find((theme) => theme.name === name);
}

export function getDefaultTheme(): ColorTheme {
  return themes[0]; // Ocean Light
}

export function getAllThemes(): ColorTheme[] {
  return themes;
}

