import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Framework, useFrameworks } from '@/contexts/FrameworkContext';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import SuccessModal from './SuccessModal';

interface ImplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  framework: Framework;
}

const ImplementModal = ({ isOpen, onClose, framework }: ImplementModalProps) => {
  const { implementFramework } = useFrameworks();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImplement = async () => {
    setIsProcessing(true);
    // Simulate AI delay
    setTimeout(() => {
        implementFramework(framework.id);
        setIsProcessing(false);
        setShowSuccess(true);
    }, 2000);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
      return (
          <SuccessModal 
            isOpen={showSuccess} 
            onClose={handleCloseSuccess} 
            framework={framework} 
          />
      );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <DialogTitle className="text-xl">Implement Framework</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
            <div className="p-4 bg-slate-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{framework.name}</h3>
                    <Badge variant={framework.riskLevel === 'critical' ? 'destructive' : 'default'} className="capitalize">
                        {framework.riskLevel}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    {framework.description}
                </p>
                <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Regulator:</span> {framework.authority}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
                <h4 className="flex items-center gap-2 font-medium text-blue-700">
                    <Sparkles className="w-4 h-4" />
                    AI-Powered Task Generation
                </h4>
                <p className="text-sm text-blue-600">
                    EduSafe will analyse this framework and generate approximately 29 compliance tasks with risk levels, due dates, recurrence rules, and suggested owners.
                </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded border border-amber-100 text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Once implemented, tasks will be created and assigned. You can customise them afterwards.</p>
            </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
            onClick={handleImplement}
            disabled={isProcessing}
          >
            {isProcessing ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Tasks...
                </>
            ) : (
                <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Implement Framework
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImplementModal;
