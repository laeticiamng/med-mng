import { createContext, useContext, useState, useEffect } from 'react';
import { globalEvents } from '@/utils/simpleHelpers';

// Pure JS global state provider - alternative simple aux providers complexes
const GlobalStateContext = createContext();

// Provider simple pour l'état global
export function SimpleGlobalProvider({ children }) {
  const [globalState, setGlobalState] = useState({
    // UI state
    theme: 'light',
    sidebarOpen: false,
    loading: false,
    
    // User state
    user: null,
    isAuthenticated: false,
    
    // App state  
    language: 'fr',
    notifications: [],
    
    // Feature flags
    features: {
      darkMode: true,
      betaFeatures: false,
      aiChat: true
    }
  });

  // Update function simple
  const updateGlobalState = (updates) => {
    setGlobalState(prev => {
      const newState = typeof updates === 'function' 
        ? updates(prev) 
        : { ...prev, ...updates };
        
      // Emit event for listeners
      globalEvents.emit('global-state-changed', newState, prev);
      return newState;
    });
  };

  // Shortcuts for common updates
  const setTheme = (theme) => updateGlobalState({ theme });
  const setUser = (user) => updateGlobalState({ user, isAuthenticated: !!user });
  const setLanguage = (language) => updateGlobalState({ language });
  const toggleSidebar = () => updateGlobalState(prev => ({ 
    sidebarOpen: !prev.sidebarOpen 
  }));
  
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const notif = { ...notification, id, timestamp: new Date() };
    updateGlobalState(prev => ({
      notifications: [...prev.notifications, notif]
    }));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };
  
  const removeNotification = (id) => {
    updateGlobalState(prev => ({
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('med-mng-global-state');
      if (saved) {
        const parsedState = JSON.parse(saved);
        setGlobalState(prev => ({ ...prev, ...parsedState }));
      }
    } catch (error) {
      console.warn('Failed to load saved state:', error);
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    const persistableState = {
      theme: globalState.theme,
      language: globalState.language,
      features: globalState.features
    };
    
    try {
      localStorage.setItem('med-mng-global-state', JSON.stringify(persistableState));
    } catch (error) {
      console.warn('Failed to save state:', error);
    }
  }, [globalState.theme, globalState.language, globalState.features]);

  const contextValue = {
    // State
    ...globalState,
    
    // Actions
    updateGlobalState,
    setTheme,
    setUser,
    setLanguage,
    toggleSidebar,
    addNotification,
    removeNotification
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
}

// Hook simple pour accéder à l'état global
export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within SimpleGlobalProvider');
  }
  return context;
}

// Hooks spécifiques pour des parties de l'état
export function useTheme() {
  const { theme, setTheme } = useGlobalState();
  return { theme, setTheme };
}

export function useAuth() {
  const { user, isAuthenticated, setUser } = useGlobalState();
  
  const login = (userData) => {
    setUser(userData);
    globalEvents.emit('user-logged-in', userData);
  };
  
  const logout = () => {
    setUser(null);
    globalEvents.emit('user-logged-out');
  };
  
  return { user, isAuthenticated, login, logout };
}

export function useNotifications() {
  const { notifications, addNotification, removeNotification } = useGlobalState();
  
  const showSuccess = (message) => addNotification({ 
    type: 'success', 
    message 
  });
  
  const showError = (message) => addNotification({ 
    type: 'error', 
    message 
  });
  
  const showInfo = (message) => addNotification({ 
    type: 'info', 
    message 
  });
  
  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo
  };
}

export function useFeatureFlags() {
  const { features, updateGlobalState } = useGlobalState();
  
  const toggleFeature = (featureName) => {
    updateGlobalState(prev => ({
      features: {
        ...prev.features,
        [featureName]: !prev.features[featureName]
      }
    }));
  };
  
  const isEnabled = (featureName) => {
    return features[featureName] || false;
  };
  
  return { features, toggleFeature, isEnabled };
}