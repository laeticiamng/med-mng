/**
 * 🛣️ APP ROUTES - MED-MNG v4.0
 * Configuration des routes principales
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PremiumSidebar } from '@/components/sidebar/PremiumSidebar';
import { PremiumHeader } from '@/components/header/PremiumHeader';

// Pages temporaires
const DashboardPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
    <p className="text-muted-foreground">Vue d'ensemble de votre activité médicale</p>
  </div>
);

const EDNPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Items EDN</h1>
    <p className="text-muted-foreground">Référentiel EDN complet pour votre formation</p>
  </div>
);

const PatientsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Patients</h1>
    <p className="text-muted-foreground">Gestion des dossiers patients</p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <div className="flex h-screen w-full">
      <PremiumSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PremiumHeader />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/edn" element={<EDNPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};