/**
 * Hook personnalisé pour gérer l'état du modal EDN
 * Encapsule toute la logique d'ouverture/fermeture
 */

import { useState, useCallback } from 'react';
import { EdnItem, EdnModalState, INITIAL_MODAL_STATE } from '@/types/edn';

export function useEdnModal() {
  const [modalState, setModalState] = useState<EdnModalState>(INITIAL_MODAL_STATE);

  const openModal = useCallback((item: EdnItem, tab?: string) => {
    setModalState({
      isOpen: true,
      item,
      activeTab: tab || 'overview',
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(INITIAL_MODAL_STATE);
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setModalState(prev => ({
      ...prev,
      activeTab: tab,
    }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    setActiveTab,
    isOpen: modalState.isOpen,
    item: modalState.item,
    activeTab: modalState.activeTab,
  };
}
