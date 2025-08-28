import { MainNavigation } from '@/components/navigation/MainNavigation';
import { CompleteDashboard } from '@/components/dashboard/CompleteDashboard';

export const CompletePlatform = () => {
  return (
    <div className="flex min-h-screen">
      <MainNavigation />
      <div className="flex-1 lg:ml-80">
        <CompleteDashboard />
      </div>
    </div>
  );
};