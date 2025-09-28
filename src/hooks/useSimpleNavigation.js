import { useState, useEffect, useCallback } from 'react';
import { globalEvents } from '@/utils/simpleHelpers';

// Pure JS navigation hook - plus simple que React Router dans certains cas
export function useSimpleNavigation() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState(new URLSearchParams(window.location.search));
  const [history, setHistory] = useState([window.location.pathname]);

  // Listen to browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate function
  const navigate = useCallback((path, options = {}) => {
    const { replace = false, state = null } = options;
    
    if (replace) {
      window.history.replaceState(state, '', path);
    } else {
      window.history.pushState(state, '', path);
      setHistory(prev => [...prev, path]);
    }
    
    setCurrentPath(path);
    setParams(new URLSearchParams(new URL(path, window.location.origin).search));
    
    // Emit navigation event
    globalEvents.emit('navigation-changed', { path, previous: currentPath });
  }, [currentPath]);

  // Go back
  const goBack = useCallback(() => {
    if (history.length > 1) {
      window.history.back();
    }
  }, [history]);

  // Go forward
  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  // Query parameter helpers
  const getParam = useCallback((key) => {
    return params.get(key);
  }, [params]);

  const setParam = useCallback((key, value) => {
    const newParams = new URLSearchParams(params);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    navigate(newUrl, { replace: true });
  }, [params, navigate]);

  // Check if current path matches pattern
  const matches = useCallback((pattern) => {
    if (typeof pattern === 'string') {
      return currentPath === pattern;
    }
    if (pattern instanceof RegExp) {
      return pattern.test(currentPath);
    }
    return false;
  }, [currentPath]);

  return {
    currentPath,
    params: Object.fromEntries(params),
    history,
    navigate,
    goBack,
    goForward,
    getParam,
    setParam,
    matches,
    canGoBack: history.length > 1
  };
}

// Hook for managing navigation state
export function useNavigationState(initialState = {}) {
  const [navState, setNavState] = useState(initialState);
  const { currentPath } = useSimpleNavigation();

  // Update state when path changes
  useEffect(() => {
    globalEvents.on('navigation-changed', ({ path }) => {
      // Reset state on navigation unless specified otherwise
      if (!navState.persistOnNavigation) {
        setNavState(initialState);
      }
    });
  }, [initialState, navState.persistOnNavigation]);

  const updateNavState = useCallback((updates) => {
    setNavState(prev => ({ ...prev, ...updates }));
  }, []);

  return [navState, updateNavState];
}

// Simple route matcher
export function useRouteMatch(routes) {
  const { currentPath } = useSimpleNavigation();
  
  const [currentRoute, setCurrentRoute] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    let matchedRoute = null;
    let params = {};

    for (const route of routes) {
      const match = matchRoute(currentPath, route.path);
      if (match) {
        matchedRoute = route;
        params = match.params;
        break;
      }
    }

    setCurrentRoute(matchedRoute);
    setRouteParams(params);
  }, [currentPath, routes]);

  return { currentRoute, routeParams };
}

// Simple route matching utility
function matchRoute(path, pattern) {
  // Convert pattern like '/user/:id' to regex
  const paramNames = [];
  const regexPattern = pattern.replace(/:([^/]+)/g, (match, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) return null;

  const params = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return { params };
}

// Breadcrumb navigation helper
export function useBreadcrumbs(routes) {
  const { currentPath } = useSimpleNavigation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const crumbs = [];
    let currentUrl = '';

    // Add home
    crumbs.push({ label: 'Accueil', path: '/' });

    pathSegments.forEach((segment, index) => {
      currentUrl += '/' + segment;
      
      // Find route configuration
      const route = routes.find(r => r.path === currentUrl);
      
      crumbs.push({
        label: route?.label || segment,
        path: currentUrl,
        isLast: index === pathSegments.length - 1
      });
    });

    setBreadcrumbs(crumbs);
  }, [currentPath, routes]);

  return breadcrumbs;
}