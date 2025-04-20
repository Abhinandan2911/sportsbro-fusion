import React from 'react';
import { 
  Dumbbell, 
  Trophy, 
  Calendar, 
  Utensils, 
  Heart, 
  Target, 
  Users, 
  Award,
  ChevronRight,
  Activity,
  Brain,
  ChefHat,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Medal,
  DumbbellIcon,
  Timer,
  Scale,
  HeartHandshake
} from 'lucide-react';
import Navbar from '@/components/Navbar';

// Photo gallery component for training and nutrition
const PhotoGallery = ({ images, title }) => (
  <div className="mb-12 sm:mb-16">
    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg group">
          <img 
            src={image.src} 
            alt={image.alt} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Set fallback image if main image fails to load
              e.currentTarget.onerror = null; // Prevent infinite loop
              e.currentTarget.src = image.fallbackSrc || '/placeholder.svg'; // Use fallback image if available, otherwise use placeholder
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-white text-sm font-medium">{image.caption}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Training: React.FC = () => {
  // Training images data with updated images
  const trainingImages = [
    {
      src: "/images/training/strength.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Athlete strength training",
      caption: "Strength & Conditioning"
    },
    {
      src: "/images/training/soccer.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Soccer players training",
      caption: "Soccer Drills"
    },
    {
      src: "/images/training/basketball.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Basketball team practice",
      caption: "Basketball Skills"
    },
    {
      src: "/images/training/sprint.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/34514/spot-runs-start-la.jpg?auto=compress&cs=tinysrgb&w=600",
      alt: "Sprint training on track",
      caption: "Speed Training"
    },
    {
      src: "/images/training/swimming.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/73760/swimming-swimmer-female-race-73760.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Swimming technique practice",
      caption: "Swimming Technique"
    },
    {
      src: "/images/training/agility.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Agility training drill",
      caption: "Agility & Coordination"
    },
    {
      src: "/images/training/stretching.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/4498151/pexels-photo-4498151.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Athletes stretching",
      caption: "Flexibility & Recovery"
    },
    {
      src: "/images/training/team.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/7187897/pexels-photo-7187897.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Team workout session",
      caption: "Team Conditioning"
    }
  ];

  // Nutrition images data with updated images and better error handling
  const nutritionImages = [
    {
      src: "/images/nutrition/meal-prep.jpg", 
      fallbackSrc: "https://images.pexels.com/photos/1153370/pexels-photo-1153370.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Athlete meal preparation",
      caption: "Athlete Meal Prep"
    },
    {
      src: "/images/nutrition/protein-foods.jpg",
      fallbackSrc: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Protein-rich foods for athletes",
      caption: "Protein Sources"
    },
    {
      src: "/images/nutrition/hydration.jpg",
      fallbackSrc: "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Sports hydration station",
      caption: "Hydration Strategy"
    },
    {
      src: "/images/nutrition/recovery-smoothie.jpg",
      fallbackSrc: "https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Post-workout recovery smoothie",
      caption: "Recovery Nutrition"
    },
    {
      src: "/images/nutrition/pre-game-meal.jpg",
      fallbackSrc: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Pre-game meal for athletes",
      caption: "Pre-Competition Nutrition"
    },
    {
      src: "/images/nutrition/nutrition-planning.jpg",
      fallbackSrc: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Sports nutritionist consultation",
      caption: "Nutrition Planning"
    },
    {
      src: "/images/nutrition/healthy-foods.jpg",
      fallbackSrc: "https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?auto=compress&cs=tinysrgb&w=600",
      alt: "Healthy vegetables and fruits",
      caption: "Nutrient-Dense Foods"
    },
    {
      src: "/images/nutrition/breakfast.jpg",
      fallbackSrc: "https://images.pexels.com/photos/1660030/pexels-photo-1660030.jpeg?auto=compress&cs=tinysrgb&w=600",
      alt: "Healthy breakfast",
      caption: "Optimized Breakfast"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Navbar />
      
      {/* Hero Banner Section - Similar to Gear Hub */}
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/training/hero-banner.jpg" 
            alt="Training equipment"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.pexels.com/photos/949126/pexels-photo-949126.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
            }}
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Your Ultimate Training <br className="hidden md:block" />Destination
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Discover premium training programs and expertise for every athlete
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Training Programs Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Training Programs</h2>
          </div>

          {/* Featured Training Photos */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden aspect-video relative group">
                <img 
                  src="https://images.pexels.com/photos/116077/pexels-photo-116077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Intensive training session"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Elite Performance Training</h3>
                  <p className="text-gray-200">Maximize your athletic potential with our professional training methodologies</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden aspect-video relative group">
                <img 
                  src="https://images.pexels.com/photos/3912953/pexels-photo-3912953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Sport-specific drills"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Sport-Specific Training</h3>
                  <p className="text-gray-200">Tailor-made programs focused on your sport's unique demands</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80" 
                  alt="Standardized Programs"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Target className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Standardized Programs</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Access carefully crafted training programs for various sports, designed for different skill levels.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Explore Programs <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="/images/weightlifting.jpg" 
                  alt="Olympic Training"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to external URL if local image fails
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1515174068048-21203a5ca1de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Trophy className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Olympic Training</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Specialized programs for athletes aspiring to compete at the highest level.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  View Olympic Programs <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Workout Plans"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Calendar className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Workout Plans</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Detailed workout plans with clear instructions and visual guides.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Browse Workouts <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Training Photo Gallery */}
          <PhotoGallery 
            images={trainingImages} 
            title="Training Photo Gallery"
          />
        </section>

        {/* Nutrition Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Nutrition Guidance</h2>
          </div>

          {/* Featured Nutrition Photos */}
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* First row */}
              <div className="rounded-xl overflow-hidden aspect-square relative group">
                <img 
                  src="https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Professional athlete meal"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white">Performance Nutrition</h3>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden aspect-square relative group">
                <img 
                  src="https://images.pexels.com/photos/8844393/pexels-photo-8844393.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Protein-rich meal"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white">Protein Focus</h3>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden aspect-square relative group md:col-span-2 md:row-span-2">
                <img 
                  src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Custom nutrition plan"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Personalized Nutrition Plans</h3>
                  <p className="text-gray-200">Nutrition strategies designed specifically for your body, goals, and training regimen</p>
                </div>
              </div>
              
              {/* Second row - two boxes under Performance Nutrition and Protein Focus */}
              <div className="rounded-xl overflow-hidden aspect-square relative group">
                <img 
                  src="https://images.pexels.com/photos/775031/pexels-photo-775031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Hydration importance"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white">Hydration Strategy</h3>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden aspect-square relative group">
                <img 
                  src="https://images.pexels.com/photos/5945599/pexels-photo-5945599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Carbohydrate nutrition"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white">Energy Sources</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1543362906-acfc16c67564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1165&q=80" 
                  alt="Diet Plans"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <ChefHat className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Diet Plans</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Sport-specific diet plans tailored to your training regimen and goals.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  View Diet Plans <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/5711255/pexels-photo-5711255.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Nutrition Tracking"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.pexels.com/photos/8844142/pexels-photo-8844142.jpeg?auto=compress&cs=tinysrgb&w=600";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Scale className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Nutrition Tracking</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Track calories, protein, and other nutrients with detailed breakdowns.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Start Tracking <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Recovery Tips"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Lightbulb className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Recovery Tips</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Expert advice on optimizing energy levels and post-workout recovery.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Learn More <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Nutrition Photo Gallery */}
          <PhotoGallery 
            images={nutritionImages} 
            title="Sports Nutrition Gallery"
          />
        </section>

        {/* Support & Motivation Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Support & Motivation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517130038641-a774d04afb3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Personal Coach"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <HeartHandshake className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Personal Coach</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Get personalized guidance and support from experienced coaches.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Connect with Coaches <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1161&q=80" 
                  alt="Progress Tracking"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <TrendingUp className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Progress Tracking</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Monitor your progress and celebrate your achievements.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  Track Progress <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-0 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden">
              <div className="h-36 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1590727264967-f26b2d31e3a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80" 
                  alt="Achievement System"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Sparkles className="w-5 h-5 text-white group-hover:text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Achievement System</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                  Earn badges and rewards as you reach your fitness goals.
                </p>
                <a href="#" className="inline-flex items-center text-sm sm:text-base text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  View Achievements <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Trainers Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Trainers</h2>
          </div>

          {/* Featured Trainers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Trainer 1 */}
            <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/6456210/pexels-photo-6456210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Coach Michael Torres" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-white mb-1">Michael Torres</h3>
                <p className="text-sm text-gray-300 mb-3">Elite Performance Coach</p>
                <p className="text-sm text-gray-400 mb-4">Specializes in strength and conditioning for professional athletes with 12+ years of experience.</p>
                <a href="#" className="inline-flex items-center text-sm text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  View Profile <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Trainer 2 */}
            <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Coach Sarah Johnson" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-white mb-1">Sarah Johnson</h3>
                <p className="text-sm text-gray-300 mb-3">Olympic Performance Specialist</p>
                <p className="text-sm text-gray-400 mb-4">Former Olympic athlete with expertise in high-performance training and mental conditioning.</p>
                <a href="#" className="inline-flex items-center text-sm text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  View Profile <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Trainer 3 */}
            <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/6551136/pexels-photo-6551136.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Coach David Chen" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-white mb-1">David Chen</h3>
                <p className="text-sm text-gray-300 mb-3">Sports Nutrition Expert</p>
                <p className="text-sm text-gray-400 mb-4">Combines nutritional science with personalized training programs for optimal athletic performance.</p>
                <a href="#" className="inline-flex items-center text-sm text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  View Profile <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Trainer 4 */}
            <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <div className="aspect-square overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/7991662/pexels-photo-7991662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Coach Emma Rodriguez" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-white mb-1">Emma Rodriguez</h3>
                <p className="text-sm text-gray-300 mb-3">Youth Development Coach</p>
                <p className="text-sm text-gray-400 mb-4">Specializes in youth athletic development with a focus on fundamental skills and injury prevention.</p>
                <a href="#" className="inline-flex items-center text-sm text-white hover:text-gray-300 transition-colors group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  View Profile <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>

          {/* View All Trainers Button */}
          <div className="mt-8 text-center">
            <a 
              href="#" 
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-300"
            >
              View All Trainers
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>

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
                Premium training solutions for athletes at every level.
              </p>
            </div>
            
            {/* Training Links Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Training</h3>
              <ul className="space-y-2">
                {["Elite Programs", "Sport-Specific", "Workout Plans", "Personalized Training"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition Links Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Nutrition</h3>
              <ul className="space-y-2">
                {["Performance Nutrition", "Meal Plans", "Nutrition Tracking", "Recovery Guidance"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                {["About", "Coaches", "Contact", "Support"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 mt-8 text-center text-gray-300 text-sm">
            <p>&copy; {new Date().getFullYear()} SportsBro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Training; 