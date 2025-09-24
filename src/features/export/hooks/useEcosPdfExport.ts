import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';

export interface EcosScenarioStep {
  title: string;
  subtitle?: string;
  questions?: string[];
  actions?: string[];
  elements?: string[];
}

export interface EcosPrintableScenario {
  id: string;
  itemSlug?: string;
  title: string;
  specialty: string;
  duration: number;
  pitch: string;
  patient: {
    name: string;
    age: number;
    sex: string;
    background: string;
  };
  steps: EcosScenarioStep[];
}

interface UseEcosPdfExportParams {
  scenario: EcosPrintableScenario;
  itemUrl: string;
}

export interface EcosPdfState {
  qrCodeDataUrl: string;
  generatedAt: Date;
}

export const useEcosPdfExport = ({ scenario, itemUrl }: UseEcosPdfExportParams) => {
  const [state, setState] = useState<EcosPdfState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const cleanup = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('ecos-printing');
    }
    setState(null);
    setIsGenerating(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleAfterPrint = () => {
      cleanup();
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (!state || !isGenerating) {
      return;
    }

    if (typeof window === 'undefined') {
      cleanup();
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.print();
      } catch (error) {
        console.error('ECOS PDF export - print failed', error);
        cleanup();
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [cleanup, isGenerating, state]);

  const exportPdf = useCallback(async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(itemUrl, {
        margin: 0,
        scale: 8,
        width: 512,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      if (typeof document !== 'undefined') {
        document.body.classList.add('ecos-printing');
      }
      setState({
        qrCodeDataUrl,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error('ECOS PDF export failed', error);
      cleanup();
    }
  }, [cleanup, isGenerating, itemUrl]);

  return {
    exportPdf,
    isGenerating,
    printState: state,
    scenario,
    itemUrl,
  };
};
