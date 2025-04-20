import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoginForm from './LoginForm';
import { useAuth } from '@/contexts/AuthContext';

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  const [showLogin, setShowLogin] = React.useState(true);
  const { isLoggedIn } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  return (
    <section 
      className={cn(
        "relative min-h-screen w-full bg-[#1a1a1a] flex items-center pt-24",
        className
      )}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Main Weightlifting Image */}
        {!imageError && (
          <img 
            src="/images/weightlifting.jpg"
            alt="Woman doing weightlifting"
            className="absolute inset-0 w-full h-full object-cover opacity-95"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Gradient Overlay - Very subtle */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/20 to-[#1a1a1a]/40"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 py-12">
        {/* Hero Content */}
        <div className={cn(
          "w-full text-center lg:text-left animate-fade-in-up",
          isLoggedIn ? "lg:w-full" : "lg:w-1/2"
        )}>
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300">
            <span>Empowering Village Athletes</span>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Be a <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-transparent bg-clip-text font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">Game Changer</span>
          </p>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <span className="block">Train Smarter.</span>
            <span className="block text-gray-300">Compete Better.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
            SportsBro connects athletes, tracks progress, and builds teams for the ultimate sports experience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <a 
              href="#features" 
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 inline-flex items-center justify-center group w-full sm:w-auto shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Explore Features
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a 
              href="#about" 
              className="bg-white text-[#1a1a1a] hover:bg-gray-100 px-8 py-3 rounded-full font-medium transition-all duration-300 focus-ring w-full sm:w-auto text-center shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Login/Signup Form */}
        {!isLoggedIn && (
          <div className="w-full lg:w-5/12 animate-fade-in animation-delay-200 login-section">
            <div className="w-full bg-black/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.15)]">
              <div className="flex justify-center mb-6">
                <div className="flex border-b border-white/20 w-full">
                  <button 
                    onClick={() => setShowLogin(true)}
                    className={`py-2 px-4 text-center w-1/2 font-medium text-lg transition-colors duration-200 ${showLogin ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowLogin(false)}
                    className={`py-2 px-4 text-center w-1/2 font-medium text-lg transition-colors duration-200 ${!showLogin ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col">
                <LoginForm isLogin={showLogin} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
