import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import useForceResetProfilePopup from '@/hooks/useForceResetProfilePopup';
import { ArrowRight, Trophy, Clock, Heart, Activity, Users, ChevronRight } from 'lucide-react';

const Index = () => {
  // Use our custom hook to force reset the profile popup
  useForceResetProfilePopup();
  
  // Additional code to force reset - this will ensure the popup doesn't show on the home page
  useEffect(() => {
    // Force dismiss popup on home page load
    localStorage.setItem('profileCompletionDismissed', 'true');
    
    // Also update the user's isFirstLogin flag if needed
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.isFirstLogin) {
          user.isFirstLogin = false;
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Home page: forced isFirstLogin to false');
        }
      } catch (err) {
        console.error('Error updating user data:', err);
      }
    }
  }, []);
  
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#1a1a1a]">
      <Navbar />
      <Hero />
      <FeaturesSection />
      
      {/* Featured Trainers Section */}
      <section className="py-16 bg-[#1a1a1a]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4 border border-white/10">
              <Users className="w-4 h-4" />
              Elite Mentors
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Learn from Sports Legends</h2>
            <p className="text-lg text-gray-300">
              Get exclusive training tips and insights from world-renowned sports stars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cricket Trainer */}
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#222] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <div className="h-80 sm:h-96 overflow-hidden">
                <img 
                  src="/images/trainers/virat-kohli.jpg" 
                  alt="Virat Kohli" 
                  className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 relative">
                <span className="absolute -top-4 left-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Cricket</span>
                <h3 className="text-xl font-bold text-white mb-2">Virat Kohli</h3>
                <p className="text-sm text-gray-300 mb-1">International Cricket Star</p>
                <p className="text-sm text-gray-400 mb-4">
                  One of cricket's greatest batsmen with numerous records and achievements. Known for his exceptional fitness standards and mental toughness.
                </p>
                <a href="#" className="inline-flex items-center text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Training Programs <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Football Trainer - Sunil Chhetri */}
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#222] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <div className="h-80 sm:h-96 overflow-hidden">
                <img 
                  src="/images/trainers/sunil-chettri.jpg" 
                  alt="Sunil Chhetri" 
                  className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 relative">
                <span className="absolute -top-4 left-6 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Football</span>
                <h3 className="text-xl font-bold text-white mb-2">Sunil Chhetri</h3>
                <p className="text-sm text-gray-300 mb-1">Indian Football Icon</p>
                <p className="text-sm text-gray-400 mb-4">
                  India's most-capped player and all-time top goalscorer. A legendary striker known for his leadership, technique and scoring ability.
                </p>
                <a href="#" className="inline-flex items-center text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Training Programs <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Kabaddi Trainer - Pavan Sherawat */}
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#222] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <div className="h-80 sm:h-96 overflow-hidden">
                <img 
                  src="/images/trainers/pavan-sherawat.jpg" 
                  alt="Pavan Sherawat" 
                  className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 relative">
                <span className="absolute -top-4 left-6 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Kabaddi</span>
                <h3 className="text-xl font-bold text-white mb-2">Pavan Sherawat</h3>
                <p className="text-sm text-gray-300 mb-1">Kabaddi Champion</p>
                <p className="text-sm text-gray-400 mb-4">
                  Elite Indian kabaddi player known for his exceptional raiding skills, agility and strategic gameplay in the Pro Kabaddi League.
                </p>
                <a href="#" className="inline-flex items-center text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Training Programs <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a 
              href="/training" 
              className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-sm border border-white/10"
            >
              View All Sports Stars
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#2a2a2a]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4 border border-white/10">
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simple Process, Amazing Results</h2>
            <p className="text-lg text-gray-300">
              Get started with SportsBro in just a few simple steps and transform your athletic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Trophy className="w-8 h-8 text-white" />,
                title: "Create Your Profile",
                description: "Sign up and tell us about your sport, skill level, and goals to get personalized recommendations.",
                bgImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              },
              {
                icon: <Clock className="w-8 h-8 text-white" />,
                title: "Follow Your Plan",
                description: "Get a tailored training schedule and track your workouts, matches, and progress in real-time.",
                bgImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              },
              {
                icon: <Heart className="w-8 h-8 text-white" />,
                title: "Connect & Compete",
                description: "Join local teams, challenge other athletes, and participate in community events.",
                bgImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1105&q=80"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div 
                  className="bg-[#1a1a1a] rounded-2xl text-center h-full flex flex-col items-center relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.3)] transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.4)]"
                  style={{
                    backgroundImage: `url(${step.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-all duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center p-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/80 to-yellow-500/80 flex items-center justify-center mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      {step.icon}
                    </div>
                    <span className="absolute top-4 right-4 text-6xl font-bold text-white/10">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-amber-500/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#2a2a2a] border-y border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform Your Sports Experience?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes who are training smarter and building stronger teams with SportsBro.
          </p>
          <a 
            href="#" 
            className="inline-flex items-center bg-white text-[#1a1a1a] hover:bg-gray-100 px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-7 w-7 text-white" />
                <span className="text-xl font-display font-bold">SportsBro</span>
              </div>
              <p className="text-gray-300 mb-4">
                Empowering village athletes to train effectively, build teams, and excel in sports.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Testimonials", "FAQ"]
              },
              {
                title: "Resources",
                links: ["Blog", "Guides", "Support", "API"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Privacy"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4 text-white">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/10 pt-8 mt-8 text-center text-gray-300 text-sm">
            <p>&copy; {new Date().getFullYear()} SportsBro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
