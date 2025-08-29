import React, { useState } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock } from 'lucide-react';

export const MedMngSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  return (
    <PremiumLayout variant="gradient" className="min-h-screen flex items-center justify-center">
      <PremiumCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <GraduationCap className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Rejoindre MED-MNG</h1>
        </div>
        
        <form className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nom complet"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              className="pl-10"
            />
          </div>
          
          <PremiumButton type="submit" className="w-full">
            Créer un compte
          </PremiumButton>
        </form>
        
        <div className="text-center mt-6">
          <Link to="/med-mng/login" className="text-primary hover:underline">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </PremiumCard>
    </PremiumLayout>
  );
};

export default MedMngSignup;