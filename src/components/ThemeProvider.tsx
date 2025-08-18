import React, { createContext, useContext, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';

interface ThemeContextType {
  isDarkMode: boolean;
  themeMode: 'light' | 'dark' | 'auto';
  colors: any;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useTheme();

  const contextValue: ThemeContextType = {
    isDarkMode: theme.isDarkMode,
    themeMode: theme.themeMode,
    colors: theme.colors,
    setThemeMode: theme.setThemeMode,
    toggleTheme: theme.toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar style={theme.isDarkMode ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};