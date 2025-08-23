import { ContentCompletenessAudit } from '@/components/audit/ContentCompletenessAudit';
import { useResponsiveSpacing } from '@/hooks/useBreakpoints';

export default function AuditCompleteness() {
  const spacing = useResponsiveSpacing();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className={`container mx-auto ${spacing.container}`}>
        <ContentCompletenessAudit />
      </div>
    </div>
  );
}