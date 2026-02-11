import { Framework } from '@/contexts/FrameworkContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, GraduationCap, BookOpen, Heart, Check, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import ImplementModal from './ImplementModal';
import { useNavigate } from 'react-router-dom';

interface FrameworkCardProps {
  framework: Framework;
}

const getFrameworkIcon = (id: string) => {
    switch (id) {
        case 'kcsie': return Shield;
        case 'gdpr': return Database;
        case 'send': return GraduationCap;
        case 'ofsted': return BookOpen;
        case 'hswa': return Heart;
        default: return BookOpen;
    }
};

const getRiskColor = (risk: string) => {
    switch (risk) {
        case 'critical': return 'bg-red-100 text-red-700 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

const FrameworkCard = ({ framework }: FrameworkCardProps) => {
  const Icon = getFrameworkIcon(framework.id);
  const [showImplementModal, setShowImplementModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${framework.status === 'implemented' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg leading-tight mb-1">{framework.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{framework.description}</p>
                    </div>
                </div>
                <Badge variant="outline" className={`${getRiskColor(framework.riskLevel)} capitalize shrink-0`}>
                    {framework.riskLevel}
                </Badge>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div>
                            <span className="block text-xs font-medium text-slate-500 mb-0.5">Authority</span>
                            {framework.authority}
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-500 mb-0.5">Cycle</span>
                            {framework.cycle}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t mt-2">
                        {framework.status === 'implemented' ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                <Check className="w-4 h-4" />
                                Implemented • {framework.taskCount} tasks generated
                            </div>
                        ) : (
                            <Button 
                                size="sm" 
                                className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                onClick={() => setShowImplementModal(true)}
                            >
                                Implement Framework
                            </Button>
                        )}

                         {framework.status === 'implemented' && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/tasks')}
                            >
                                View Tasks
                            </Button>
                         )}
                    </div>
                </div>
            </CardContent>
        </Card>

        <ImplementModal 
            isOpen={showImplementModal} 
            onClose={() => setShowImplementModal(false)}
            framework={framework}
        />
    </>
  );
};

export default FrameworkCard;
