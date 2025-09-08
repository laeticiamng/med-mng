/**
 * 🎯 INDEX TYPES - MED-MNG v3.0
 * Point d'entrée centralisé pour tous les types
 */

// Types core
export * from './core';
export * from './user';
export * from './medical';
export * from './audio';
export * from './ui';
export * from './forms';
export * from './analytics';
export * from './config';

// Réexportation des types React couramment utilisés
export type { ComponentProps, RefObject } from 'react';