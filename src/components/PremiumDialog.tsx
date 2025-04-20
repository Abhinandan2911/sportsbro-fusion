import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Video, UserPlus, Salad, Activity, Heart, Brain, BarChart3, PlayCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    period: '',
    description: 'Basic features for casual athletes',
    features: {
      'AI Video Analysis': false,
      '1-on-1 Training': false,
      'Personalized Diet': false,
      'Performance Tracking': 'Basic',
      'Injury Prevention': 'Basic',
      'Mental Performance': false,
      'Advanced Analytics': false,
      'Exclusive Content': 'Limited',
    },
    buttonText: 'Current Plan',
    isPopular: false,
  },
  {
    name: 'Monthly',
    price: '₹999',
    period: '/month',
    description: 'Full access on a monthly basis',
    features: {
      'AI Video Analysis': '10/month',
      '1-on-1 Training': '2 sessions',
      'Personalized Diet': true,
      'Performance Tracking': 'Full',
      'Injury Prevention': 'Full',
      'Mental Performance': true,
      'Advanced Analytics': true,
      'Exclusive Content': 'Full',
    },
    buttonText: 'Start Monthly Plan',
    isPopular: true,
  },
  {
    name: 'Yearly',
    price: '₹8,999',
    period: '/year',
    description: 'Best value for dedicated athletes',
    features: {
      'AI Video Analysis': 'Unlimited',
      '1-on-1 Training': '4 sessions',
      'Personalized Diet': true,
      'Performance Tracking': 'Full',
      'Injury Prevention': 'Full',
      'Mental Performance': true,
      'Advanced Analytics': true,
      'Exclusive Content': 'Full + Early Access',
    },
    buttonText: 'Start Yearly Plan',
    isPopular: false,
    savings: '₹3,000',
  },
];

const featureDescriptions = {
  'AI Video Analysis': 'Get detailed feedback on your technique with AI-powered video analysis.',
  '1-on-1 Training': 'Personal training sessions with certified coaches.',
  'Personalized Diet': 'Custom meal plans and nutrition tracking tailored to your goals.',
  'Performance Tracking': 'Track progress across various metrics with detailed analytics.',
  'Injury Prevention': 'Personalized programs for injury prevention and recovery.',
  'Mental Performance': 'Access to mental performance coaches and resources.',
  'Advanced Analytics': 'Detailed performance analytics and athlete comparisons.',
  'Exclusive Content': 'Access to expert interviews, training videos, and articles.',
};

export const PremiumDialog: React.FC<PremiumDialogProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('Monthly');

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      );
    }
    return <span className={value === 'Basic' || value === 'Limited' ? 'text-gray-400' : 'text-white'}>{value}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] text-white border-white/10 max-w-6xl max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Crown className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-transparent bg-clip-text">
              Choose Your Plan
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Select the perfect plan to unlock your full potential and elevate your athletic journey.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-6 rounded-xl border transition-all duration-300 cursor-pointer",
                plan.name === 'Premium'
                  ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{plan.name}</h3>
                <div className="text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                  {plan.price}
                  <span className="text-sm text-gray-400">/month</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {Object.entries(plan.features).map(([feature, value]) => (
                  <div key={feature} className="flex items-center justify-between text-xs">
                    <span className="text-white/90 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{feature}</span>
                    <div className="flex items-center justify-center w-12">
                      {renderFeatureValue(value)}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className={cn(
                  "w-full text-sm py-2 transition-all duration-300",
                  plan.name === 'Free'
                    ? "bg-white/10 hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                )}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg p-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <h3 className="text-lg font-semibold mb-2 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">All Premium Features Include:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(featureDescriptions).map(([feature, description]) => (
              <div key={feature} className="flex items-start gap-2">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Crown className="h-3 w-3 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-medium text-xs text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{feature}</h4>
                  <p className="text-xs text-gray-400 drop-shadow-[0_0_2px_rgba(255,255,255,0.05)]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-between mt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 text-sm"
          >
            Maybe Later
          </Button>
          <div className="text-xs text-gray-400">
            Questions? Contact our support team
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog; 