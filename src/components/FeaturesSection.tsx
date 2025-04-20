import React from 'react';
import { Activity, TrendingUp, Users, ChevronRight } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-[#2a2a2a]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4 border border-white/10">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            SportsBro provides a comprehensive platform designed to help village athletes train effectively, build teams, and track progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Personalized Training */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] group transition-all duration-300">
            <div className="h-48 md:h-56 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80" 
                alt="Personalized Training"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-90"></div>
              <div className="absolute bottom-4 left-4 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 border border-white/20">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
                  Personalized Training
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Custom workout plans tailored to your sport, skill level, and goals to help you improve efficiently.
              </p>
              <a href="#" className="inline-flex items-center text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                Learn More <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] group transition-all duration-300">
            <div className="h-48 md:h-56 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Performance Analytics"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-90"></div>
              <div className="absolute bottom-4 left-4 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 border border-white/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
                  Performance Analytics
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Track your progress with detailed metrics and visualizations to identify strengths and areas for improvement.
              </p>
              <a href="#" className="inline-flex items-center text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                Explore Analytics <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Team Building */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] group transition-all duration-300">
            <div className="h-48 md:h-56 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80" 
                alt="Team Building"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-90"></div>
              <div className="absolute bottom-4 left-4 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 border border-white/20">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
                  Team Building
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Create and join teams, schedule practice sessions, and coordinate matches with players in your area.
              </p>
              <a href="#" className="inline-flex items-center text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                Find Teams <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
