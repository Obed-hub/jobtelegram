import React from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { Sparkles, CheckCircle2, ChevronRight, Lock, Loader2, Globe } from 'lucide-react';
import { LIMITS } from '@/config/limits';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { toast } from 'sonner';

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: 'jobs' | 'cv' | 'networks';
}

export function UpgradeModal({ isOpen, onOpenChange, reason }: UpgradeModalProps) {
  const { user, profile, upgradeToPremium } = useApp();
  const [isVerifying, setIsVerifying] = React.useState(false);

  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: Date.now().toString(),
    amount: LIMITS.PREMIUM_PRICE,
    currency: 'USD',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || 'user@example.com',
      phone_number: user?.phoneNumber || '',
      name: user?.displayName || profile?.role || 'Premium User',
    },
    customizations: {
      title: 'Matchmaker Premium',
      description: 'Unlock Unlimited Swipes & AI Tailoring',
      logo: 'https://st2.depositphotos.com/6789684/12262/v/450/depositphotos_122620864-stock-illustration-illustration-of-flat-icon.jpg',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const startPayment = () => {
    if (isVerifying) return;
    
    handleFlutterPayment({
      callback: async (response: any) => {
        if (response.status === 'successful') {
          setIsVerifying(true);
          try {
            const verifyPaymentFunc = httpsCallable(functions, 'verifyPayment');
            const result: any = await verifyPaymentFunc({ 
              transaction_id: response.transaction_id 
            });
            
            if (result.data.success) {
              upgradeToPremium();
              onOpenChange(false);
            } else {
              toast.error(result.data.message || "Verification failed. Please contact support.");
            }
          } catch (error: any) {
            console.error("Verification error:", error);
            toast.error("Security check failed. If you were debited, please contact support with your Transaction ID.");
          } finally {
            setIsVerifying(false);
          }
        }
        closePaymentModal();
      },
      onClose: () => {
        // Payment modal closed
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border/50 text-center flex flex-col items-center">
        {isVerifying ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Verifying Payment</h3>
              <p className="text-muted-foreground">Securing your premium access...</p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="flex flex-col items-center pt-6">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center glow mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                {reason === 'jobs' ? "You've hit your daily limit!" : reason === 'cv' ? "AI Magic Limit Reached!" : reason === 'networks' ? "Exclusive Network Access!" : "Upgrade to Premium"}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Get the ultimate job search advantage with our Premium membership.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full space-y-4 my-6 text-left px-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unlimited Job Discovery</p>
                  <p className="text-sm text-muted-foreground">Keep swiping without being capped at 3 jobs/day.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unlimited AI CV Tailoring</p>
                  <p className="text-sm text-muted-foreground">Tailor your CV with Groq AI as many times as you need (Free: 1/day).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Priority Matchmaker AI</p>
                  <p className="text-sm text-muted-foreground">Get placed at the front of the queue for the freshest job algorithms.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Remote USD/GBP Filter</p>
                  <p className="text-sm text-muted-foreground">Instantly target remote roles that pay in global currencies ($ / £).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Hidden Gig Networks</p>
                  <p className="text-sm text-muted-foreground">Unlock access to our curated directory of high-paying freelance platforms.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={startPayment}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              Unlock Now for ${LIMITS.PREMIUM_PRICE} / month
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-2 pb-2">Secured safely by Flutterwave</p>
      </DialogContent>
    </Dialog>
  );
}
