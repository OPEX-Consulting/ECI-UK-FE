import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoBookingModal = ({ isOpen, onClose }: DemoBookingModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    role: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    onClose();
    toast.success('Demo Request Received', {
      description: "We'll be in touch shortly to schedule your personalized demo.",
    });
    
    // Reset form
    setFormData({ name: '', email: '', school: '', role: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] lg:min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Book a Demo</DialogTitle>
          <DialogDescription>
            See how Edusafe can transform your school's compliance management.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@school.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="school">School / Trust Name</Label>
            <Input
              id="school"
              placeholder="St. Mary's Academy"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select 
                value={formData.role} 
                onValueChange={(val) => setFormData({ ...formData, role: val })}
                required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="headteacher">Headteacher / Principal</SelectItem>
                <SelectItem value="dsl">Designated Safeguarding Lead</SelectItem>
                <SelectItem value="governor">Governor / Trustee</SelectItem>
                <SelectItem value="business_manager">School Business Manager</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Request Demo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DemoBookingModal;
