import { useState, useEffect, useCallback } from 'react';

export interface DeviceCapabilities {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch';
  screenSize: {
    width: number;
    height: number;
    diagonal: number;
  };
  pixelDensity: {
    dpr: number;
    category: 'standard' | 'high' | 'ultra' | 'retina';
    ppi: number;
  };
  orientation: 'portrait' | 'landscape';
  aspectRatio: number;
  performance: {
    level: 'low' | 'medium' | 'high' | 'ultra';
    memory: number;
    cores: number;
  };
  network: {
    speed: 'slow' | 'medium' | 'fast' | 'ultra';
    type: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet' | 'unknown';
    saveData: boolean;
  };
  browser: {
    supportsWebP: boolean;
    supportsAVIF: boolean;
    supportsLazyLoading: boolean;
    supportsIntersectionObserver: boolean;
    supportsResizeObserver: boolean;
  };
  preferences: {
    reducedMotion: boolean;
    darkMode: boolean;
    highContrast: boolean;
  };
}

export const useAdvancedDeviceDetection = () => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    deviceType: 'desktop',
    screenSize: { width: 1920, height: 1080, diagonal: 24 },
    pixelDensity: { dpr: 1, category: 'standard', ppi: 96 },
    orientation: 'landscape',
    aspectRatio: 16/9,
    performance: { level: 'medium', memory: 4, cores: 4 },
    network: { speed: 'medium', type: 'unknown', saveData: false },
    browser: {
      supportsWebP: false,
      supportsAVIF: false,
      supportsLazyLoading: false,
      supportsIntersectionObserver: false,
      supportsResizeObserver: false,
    },
    preferences: {
      reducedMotion: false,
      darkMode: false,
      highContrast: false,
    },
  });

  const detectDeviceType = useCallback((): DeviceCapabilities['deviceType'] => {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    
    if (userAgent.includes('mobile') || userAgent.includes('android')) {
      return width < 768 ? 'mobile' : 'tablet';
    }
    
    if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
      return 'tablet';
    }
    
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width > 3000) return 'tv';
    
    return 'desktop';
  }, []);

  const estimateScreenDiagonal = useCallback((width: number, height: number, ppi: number): number => {
    const widthInches = width / ppi;
    const heightInches = height / ppi;
    return Math.sqrt(widthInches * widthInches + heightInches * heightInches);
  }, []);

  const estimatePPI = useCallback((deviceType: DeviceCapabilities['deviceType'], dpr: number): number => {
    const basePPI = {
      mobile: 326,
      tablet: 264,
      desktop: 96,
      tv: 72,
      watch: 326,
    };
    
    return basePPI[deviceType] * Math.min(dpr, 3);
  }, []);

  const detectPerformance = useCallback((): DeviceCapabilities['performance'] => {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    let level: DeviceCapabilities['performance']['level'] = 'medium';
    
    if (memory <= 2 || cores <= 2) level = 'low';
    else if (memory >= 8 && cores >= 8) level = 'ultra';
    else if (memory >= 4 && cores >= 4) level = 'high';
    
    return { level, memory, cores };
  }, []);

  const detectNetwork = useCallback((): DeviceCapabilities['network'] => {
    const connection = (navigator as any).connection;
    
    if (!connection) {
      return { speed: 'medium', type: 'unknown', saveData: false };
    }
    
    const effectiveType = connection.effectiveType;
    const saveData = connection.saveData || false;
    
    let speed: DeviceCapabilities['network']['speed'] = 'medium';
    let type: DeviceCapabilities['network']['type'] = 'unknown';
    
    if (effectiveType === 'slow-2g') { speed = 'slow'; type = '2g'; }
    else if (effectiveType === '2g') { speed = 'slow'; type = '2g'; }
    else if (effectiveType === '3g') { speed = 'medium'; type = '3g'; }
    else if (effectiveType === '4g') { speed = 'fast'; type = '4g'; }
    
    if (connection.downlink && connection.downlink > 50) {
      speed = 'ultra';
      type = connection.type === 'wifi' ? 'wifi' : '5g';
    }
    
    return { speed, type, saveData };
  }, []);

  const detectBrowserCapabilities = useCallback(async (): Promise<DeviceCapabilities['browser']> => {
    const capabilities = {
      supportsWebP: false,
      supportsAVIF: false,
      supportsLazyLoading: 'loading' in HTMLImageElement.prototype,
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsResizeObserver: 'ResizeObserver' in window,
    };

    try {
      const webpCanvas = document.createElement('canvas');
      webpCanvas.width = webpCanvas.height = 1;
      capabilities.supportsWebP = webpCanvas.toDataURL('image/webp').startsWith('data:image/webp');
    } catch (e) {
      capabilities.supportsWebP = false;
    }

    return new Promise((resolve) => {
      const avifImg = new Image();
      avifImg.onload = avifImg.onerror = () => {
        capabilities.supportsAVIF = avifImg.height === 1;
        resolve(capabilities);
      };
      avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }, []);

  const detectUserPreferences = useCallback((): DeviceCapabilities['preferences'] => {
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    };
  }, []);

  const updateCapabilities = useCallback(async () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const deviceType = detectDeviceType();
    const ppi = estimatePPI(deviceType, dpr);
    
    let densityCategory: DeviceCapabilities['pixelDensity']['category'] = 'standard';
    if (dpr >= 3) densityCategory = 'ultra';
    else if (dpr >= 2) densityCategory = 'retina';
    else if (dpr >= 1.5) densityCategory = 'high';

    const browserCapabilities = await detectBrowserCapabilities();
    
    const newCapabilities: DeviceCapabilities = {
      deviceType,
      screenSize: {
        width,
        height,
        diagonal: estimateScreenDiagonal(width, height, ppi),
      },
      pixelDensity: {
        dpr,
        category: densityCategory,
        ppi,
      },
      orientation: width > height ? 'landscape' : 'portrait',
      aspectRatio: width / height,
      performance: detectPerformance(),
      network: detectNetwork(),
      browser: browserCapabilities,
      preferences: detectUserPreferences(),
    };

    setCapabilities(newCapabilities);
  }, [detectDeviceType, estimateScreenDiagonal, estimatePPI, detectPerformance, detectNetwork, detectBrowserCapabilities, detectUserPreferences]);

  useEffect(() => {
    updateCapabilities();

    const handleResize = () => updateCapabilities();
    const handleOrientationChange = () => setTimeout(updateCapabilities, 100);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-contrast: high)'),
    ];
    
    const handlePreferenceChange = () => updateCapabilities();
    mediaQueries.forEach(mq => mq.addEventListener('change', handlePreferenceChange));

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      mediaQueries.forEach(mq => mq.removeEventListener('change', handlePreferenceChange));
    };
  }, [updateCapabilities]);

  const getOptimalImageQuality = useCallback((): number => {
    const { network, performance, pixelDensity } = capabilities;
    
    let quality = 85;
    
    if (network.saveData || network.speed === 'slow') quality -= 25;
    else if (network.speed === 'ultra') quality += 10;
    
    if (performance.level === 'low') quality -= 15;
    else if (performance.level === 'ultra') quality += 5;
    
    if (pixelDensity.category === 'ultra') quality += 5;
    
    return Math.max(30, Math.min(95, quality));
  }, [capabilities]);

  const getOptimalImageFormat = useCallback((): 'avif' | 'webp' | 'jpeg' => {
    const { browser, network } = capabilities;
    
    if (browser.supportsAVIF && network.speed !== 'slow') return 'avif';
    if (browser.supportsWebP) return 'webp';
    return 'jpeg';
  }, [capabilities]);

  const shouldUseLazyLoading = useCallback((): boolean => {
    const { browser, performance, network } = capabilities;
    
    return browser.supportsLazyLoading && 
           performance.level !== 'low' && 
           network.speed !== 'slow';
  }, [capabilities]);

  return {
    capabilities,
    updateCapabilities,
    getOptimalImageQuality,
    getOptimalImageFormat,
    shouldUseLazyLoading,
    isMobile: capabilities.deviceType === 'mobile',
    isTablet: capabilities.deviceType === 'tablet',
    isDesktop: capabilities.deviceType === 'desktop',
    isHighDPI: capabilities.pixelDensity.dpr > 1.5,
    isLowPerformance: capabilities.performance.level === 'low',
    isSlowNetwork: capabilities.network.speed === 'slow' || capabilities.network.saveData,
  };
};