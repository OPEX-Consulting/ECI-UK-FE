import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Framework } from '@/contexts/FrameworkContext';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  framework: Framework;
}

const SuccessModal = ({ isOpen, onClose, framework }: SuccessModalProps) => {
  const navigate = useNavigate();

  const handleViewTasks = () => {
    onClose();
    navigate('/tasks');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] text-center p-8">
        <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Framework Implemented</h2>
        <p className="text-muted-foreground mb-6">
          <span className="font-semibold text-foreground">{framework.name}</span> has been implemented
        </p>

        <p className="text-sm text-muted-foreground mb-8">
            33 tasks generated and ready for assignment
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">33</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">9</div>
                <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">13</div>
                <div className="text-xs text-muted-foreground">Recurring</div>
            </div>
        </div>

        <Button className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700" onClick={handleViewTasks}>
          View Tasks
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
