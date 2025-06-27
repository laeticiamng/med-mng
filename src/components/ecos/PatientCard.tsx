
import { Card } from '@/components/ui/card';

interface Patient {
  name: string;
  age: number;
  sex: string;
  avatar: string;
  background: string;
}

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{patient.avatar}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{patient.name}</h3>
            <p className="text-emerald-300">{patient.age} ans • {patient.sex}</p>
          </div>
        </div>
        <p className="text-white/80 text-sm">{patient.background}</p>
      </div>
    </Card>
  );
};
