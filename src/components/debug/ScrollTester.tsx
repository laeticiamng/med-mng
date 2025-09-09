import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, TestTube } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ScrollTestResults {
  documentScrollable: boolean;
  documentOverflow: string;
  bodyOverflow: string;
  modalCount: number;
  modalOverflows: Array<{
    className: string;
    overflow: string;
    scrollHeight: number;
    clientHeight: number;
    scrollable: boolean;
  }>;
  fixedElements: Array<{
    tag: string;
    className: string;
    zIndex: string;
  }>;
}

export const ScrollTester: React.FC<{ enabled?: boolean }> = ({ enabled = false }) => {
  if (!enabled) return null;

  const testScrollability = () => {
    const results: ScrollTestResults = {
      documentScrollable: false,
      documentOverflow: '',
      bodyOverflow: '',
      modalCount: 0,
      modalOverflows: [],
      fixedElements: []
    };
    
    // Test 1: Document scroll
    results.documentScrollable = document.documentElement.scrollHeight > window.innerHeight;
    results.documentOverflow = getComputedStyle(document.documentElement).overflow;
    results.bodyOverflow = getComputedStyle(document.body).overflow;
    
    // Test 2: Modal containers
    const modals = document.querySelectorAll('[role="dialog"]');
    results.modalCount = modals.length;
    results.modalOverflows = Array.from(modals).map(modal => ({
      className: modal.className,
      overflow: getComputedStyle(modal).overflow,
      scrollHeight: modal.scrollHeight,
      clientHeight: modal.clientHeight,
      scrollable: modal.scrollHeight > modal.clientHeight
    }));

    // Test 3: Fixed elements that might block scroll
    const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => 
      getComputedStyle(el).position === 'fixed'
    );
    results.fixedElements = fixedElements.map(el => ({
      tag: el.tagName,
      className: el.className,
      zIndex: getComputedStyle(el).zIndex
    }));

    logger.info('Résultats test de scroll', {
      component: 'ScrollTester',
      action: 'testScrollability',
      metadata: {
        documentScrollable: results.documentScrollable,
        modalCount: results.modalCount,
        fixedElementsCount: results.fixedElements.length
      }
    });
    
    // Force scroll test
    window.scrollTo({ top: 100, behavior: 'smooth' });
    setTimeout(() => {
      logger.debug('Position après tentative de scroll', {
        component: 'ScrollTester',
        metadata: { scrollY: window.scrollY }
      });
    }, 500);
  };

  return (
    <Card className="fixed top-4 right-4 w-80 z-[9999] shadow-xl bg-white/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TestTube className="h-4 w-4" />
          Scroll Tester
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 text-xs">
        <Button
          size="sm"
          onClick={testScrollability}
          className="w-full h-8 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Test Scroll
        </Button>
        
        <div className="text-xs text-gray-500">
          Ouvre la console pour voir les résultats
        </div>
        
        <div className="bg-yellow-50 p-2 rounded text-xs">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          Vérifie overflow-hidden sur modals
        </div>
      </CardContent>
    </Card>
  );
};