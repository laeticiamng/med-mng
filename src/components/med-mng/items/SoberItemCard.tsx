import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

interface SoberItemCardProps {
  item: {
    id: string;
    code: string;
    title: string;
    specialty?: string;
    itemType?: string;
    rang?: string;
    status?: 'not_started' | 'in_progress' | 'revised';
    revisionCount?: number;
  };
}

export const SoberItemCard: React.FC<SoberItemCardProps> = ({ item }) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (item.status) {
      case 'revised':
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Révisé
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      className="p-4 bg-card hover:bg-secondary/30 border-border/40 hover:border-border/60 cursor-pointer transition-all duration-200 hover:shadow-soft group"
      onClick={() => navigate(ROUTE_PATHS.medMngItemDetail.replace(':itemCode', item.code))}
    >
      <div className="flex items-center gap-3">
        {/* Code */}
        <div className="shrink-0">
          <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            {item.code}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate text-sm">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground truncate">
              {item.specialty || 'Non classé'}
            </span>
            {item.rang && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs text-muted-foreground">Rang {item.rang}</span>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="shrink-0 flex items-center gap-2">
          {getStatusBadge()}
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Card>
  );
};

export default SoberItemCard;
