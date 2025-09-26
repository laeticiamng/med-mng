import React, { useState } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export const MedMngSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Compte créé avec succès ! Vérifiez votre email.');
        navigate('/med-mng/login');
      }
    } catch (err) {
      toast.error('Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumLayout variant="gradient" className="min-h-screen flex items-center justify-center">
      <PremiumCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <GraduationCap className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Rejoindre MED-MNG</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <PremiumButton type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création...' : 'Créer un compte'}
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