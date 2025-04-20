
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const JoinForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulating form submission
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been added to our waiting list.",
      });
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        interest: '',
      });
    }, 1500);
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">JOIN OUR TEAM</h3>
        <p className="text-white/70">Be among the first to experience SportsBro</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">YOUR NAME</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={cn(
              "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10",
              "text-white placeholder-white/40 focus-ring"
            )}
            placeholder="Full name"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1">PHONE</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className={cn(
              "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10",
              "text-white placeholder-white/40 focus-ring"
            )}
            placeholder="Your phone number"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">YOUR EMAIL</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={cn(
              "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10",
              "text-white placeholder-white/40 focus-ring"
            )}
            placeholder="email@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="interest" className="block text-sm font-medium text-white/80 mb-1">WHAT ARE YOU INTERESTED IN?</label>
          <select
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            required
            className={cn(
              "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10",
              "text-white placeholder-white/40 focus-ring appearance-none",
              "bg-no-repeat bg-[right_1rem_center] bg-[length:1em]"
            )}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")" }}
          >
            <option value="" disabled className="bg-sportsbro-800 text-white">Select an option</option>
            <option value="training" className="bg-sportsbro-800 text-white">Fitness Training</option>
            <option value="teams" className="bg-sportsbro-800 text-white">Team Building</option>
            <option value="analytics" className="bg-sportsbro-800 text-white">Performance Analytics</option>
            <option value="all" className="bg-sportsbro-800 text-white">All Features</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full mt-2 bg-sportsbro-500 hover:bg-sportsbro-600 text-white font-medium py-3 px-4 rounded-lg",
            "transition-all duration-200 transform hover:scale-[1.02] focus-ring",
            "flex items-center justify-center",
            isSubmitting && "opacity-80 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : "Join Waiting List"}
        </button>
      </form>
    </div>
  );
};

export default JoinForm;
