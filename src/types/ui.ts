/**
 * 🎯 TYPES INTERFACE UTILISATEUR - MED-MNG v3.0
 * Types pour les composants UI et états d'interface
 */

import type { ID } from './core';

// ==========================================
// TYPES INTERFACE UTILISATEUR
// ==========================================

export interface NavigationItem {
  id: ID;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

export interface ToastMessage {
  id: ID;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}