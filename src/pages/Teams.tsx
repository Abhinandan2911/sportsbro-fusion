import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  UserPlus, 
  MapPin, 
  Search,
  PlusCircle,
  Filter,
  Activity,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import centralTeamStore, { Team, CreateTeamData, SKILL_LEVELS } from '@/services/centralTeamStore';
import { handleApiError, showSuccess } from '@/services/errorHandler';

// Define enhanced team type with join request status
interface EnhancedTeam extends Team {
  hasRequestedToJoin?: boolean;
}

const TeamCard = ({ team, onJoin }: { team: EnhancedTeam, onJoin: (teamId: string) => void }) => {
  const navigate = useNavigate();
  const isRecentlyCreated = team.createdAt && 
    new Date().getTime() - new Date(team.createdAt).getTime() < 24 * 60 * 60 * 1000; // Less than 24 hours old
    
  return (
    <div className="bg-[#2a2a2a] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
      <div 
        className="h-40 sm:h-48 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${team.imgUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges for custom sport/city and newly created teams */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
          {isRecentlyCreated && (
            <span className="px-2 py-1 bg-green-600/80 text-white text-xs font-medium rounded-full shadow-md">
              New Team
            </span>
          )}
          {team.isCustomSport && (
            <span className="px-2 py-1 bg-purple-600/80 text-white text-xs font-medium rounded-full shadow-md">
              Custom Sport
            </span>
          )}
          {team.isCustomCity && (
            <span className="px-2 py-1 bg-blue-600/80 text-white text-xs font-medium rounded-full shadow-md">
              Custom Location
            </span>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{team.name}</h3>
          <span className="px-2 py-1 bg-white/10 text-white text-xs sm:text-sm font-medium rounded-full shadow-[0_0_5px_rgba(255,255,255,0.1)]">
            {team.sport}
          </span>
        </div>
        
        <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-300 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
          <MapPin className="h-4 w-4 mr-1" />
          {team.city}, {team.state}
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium text-gray-400 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
            {team.skillLevel} • {team.members.length}/{team.maxSize} members
          </span>
        </div>
        
        <div className="mt-1 text-xs text-gray-400">
          Created by: {team.createdBy.fullName || team.createdBy.username}
          <span className="ml-1">
            • {new Date(team.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <p className="mt-3 text-xs sm:text-sm text-gray-300 line-clamp-2 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{team.description}</p>
        
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={() => navigate(`/team/${team._id}`)}
            className="bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-all duration-300 flex-1 text-sm sm:text-base"
          >
            <Eye className="h-4 w-4 mr-2" /> 
            Details
          </Button>
          
          <Button 
            onClick={() => onJoin(team._id)}
            disabled={team.hasRequestedToJoin}
            className={`flex-1 ${
              team.hasRequestedToJoin
                ? 'bg-gray-400 text-gray-700'
                : 'bg-white text-[#1a1a1a] hover:bg-gray-100'
            } transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] text-sm sm:text-base`}
          >
            <UserPlus className="h-4 w-4 mr-2" /> 
            {team.hasRequestedToJoin ? 'Request Sent' : 'Join'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Teams = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("find");
  const [filterSport, setFilterSport] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<EnhancedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  // Create team form state
  const [newTeam, setNewTeam] = useState({
    name: "",
    sport: "",
    customSport: "",
    city: "",
    customCity: "",
    state: "Maharashtra", // Default state
    skillLevel: "",
    maxSize: "",
    description: "",
    contactDetails: "" // Add contactDetails field
  });

  // Load teams from central store on component mount
  useEffect(() => {
    fetchTeams();
    
    // Subscribe to team updates
    const unsubscribe = centralTeamStore.subscribe(() => {
      fetchTeams();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch teams from central store
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const allTeams = await centralTeamStore.getAllTeams();
      const allSports = await centralTeamStore.getAllSports();
      const allCities = await centralTeamStore.getAllCities();
      
      // If user is logged in, check if they've requested to join any teams
      let enhancedTeams: EnhancedTeam[] = allTeams;
      if (user) {
        enhancedTeams = allTeams.map(team => {
          // Check if joinRequests exists and is an array
          const hasJoinRequests = team.joinRequests && Array.isArray(team.joinRequests);
          
          return {
            ...team,
            hasRequestedToJoin: hasJoinRequests 
              ? team.joinRequests.some(req => req && req.userId === user._id) 
              : false
          };
        });
      }
      
      setTeams(enhancedTeams);
      setSports(allSports);
      setCities(allCities);
    } catch (error) {
      handleApiError(error, 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredTeams = teams.filter(team => {
    // Search in all text fields, case insensitive
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      team.name.toLowerCase().includes(searchLower) ||
      team.description.toLowerCase().includes(searchLower) ||
      team.city.toLowerCase().includes(searchLower) ||
      team.sport.toLowerCase().includes(searchLower) ||
      (team.createdBy.username && team.createdBy.username.toLowerCase().includes(searchLower)) ||
      (team.createdBy.fullName && team.createdBy.fullName.toLowerCase().includes(searchLower));
    
    // Filter by sport and city
    const matchesSport = !filterSport || team.sport.toLowerCase() === filterSport.toLowerCase();
    const matchesCity = !filterCity || team.city.toLowerCase() === filterCity.toLowerCase();
    
    return matchesSearch && matchesSport && matchesCity;
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to create a team');
      return;
    }
    
    // Simple validation
    if (!newTeam.name || (!newTeam.sport && !newTeam.customSport) || (!newTeam.city && !newTeam.customCity) || !newTeam.skillLevel || !newTeam.maxSize || !newTeam.description || !newTeam.contactDetails) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Determine final sport and city values
    const finalSport = newTeam.sport === 'Other' ? newTeam.customSport : newTeam.sport;
    const finalCity = newTeam.city === 'Other' ? newTeam.customCity : newTeam.city;
    
    if (newTeam.sport === 'Other' && !newTeam.customSport) {
      toast.error('Please enter your custom sport');
      return;
    }
    
    if (newTeam.city === 'Other' && !newTeam.customCity) {
      toast.error('Please enter your custom city or village');
      return;
    }
    
    // Create team data
    const teamData: CreateTeamData = {
      name: newTeam.name,
      sport: finalSport,
      description: newTeam.description,
      city: finalCity,
      state: newTeam.state,
      skillLevel: newTeam.skillLevel,
      maxSize: parseInt(newTeam.maxSize),
      isCustomSport: newTeam.sport === 'Other',
      isCustomCity: newTeam.city === 'Other',
      imgUrl: "https://images.unsplash.com/photo-1577741314755-048d8525d31e?ixlib=rb-4.0.3", // Default image
      contactDetails: newTeam.contactDetails // Add contactDetails to the API request
    };
    
    setLoading(true);
    
    try {
      // Create team in central store
      const newTeamData = await centralTeamStore.createTeam(teamData, user);
      
      // Reset form
      setNewTeam({
        name: "",
        sport: "",
        customSport: "",
        city: "",
        customCity: "",
        state: "Maharashtra",
        skillLevel: "",
        maxSize: "",
        description: "",
        contactDetails: "" // Reset contactDetails
      });
      
      // Switch to find tab to see the new team
      setActiveTab("find");
      
      // Auto-filter to show the newly created team
      setFilterSport(finalSport);
      setFilterCity(finalCity);
      
      showSuccess('Team created successfully! It is now visible to all players.');
    } catch (error) {
      handleApiError(error, 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user) {
      toast.error('Please log in to join a team');
      return;
    }
    
    try {
      await centralTeamStore.requestToJoin(teamId, user);
      showSuccess('Request to join team sent!');
      
      // Update local state to reflect the change
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team._id === teamId 
            ? { ...team, hasRequestedToJoin: true } 
            : team
        )
      );
    } catch (error) {
      handleApiError(error, 'Failed to request to join team');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Navbar />
      
      {/* Hero Banner Section */}
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Team sports"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Your Ultimate Team <br className="hidden md:block" />Building Platform
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Create or join sports teams and connect with athletes in your area
          </p>
        </div>
      </section>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Tabs */}
        <Tabs 
          defaultValue="find" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="max-w-5xl mx-auto mb-8 sm:mb-10"
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] border border-white/10">
            <TabsTrigger value="find" className="data-[state=active]:bg-white data-[state=active]:text-[#1a1a1a] text-white text-sm sm:text-base">
              <Search className="h-4 w-4 mr-2" />
              Find Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-white data-[state=active]:text-[#1a1a1a] text-white text-sm sm:text-base">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create a Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="pt-4 sm:pt-6">
            {/* Search and Filters */}
            <div className="mb-6 sm:mb-8 bg-[#2a2a2a] p-4 sm:p-6 rounded-xl border border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                <div className="col-span-1 sm:col-span-3 lg:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by team name, sport, city, description or creator..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <select
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value)}
                  className="bg-[#1a1a1a] text-white border border-white/10 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:border-white/30"
                >
                  <option value="">All Sports</option>
                  {sports.sort().map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>

                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="bg-[#1a1a1a] text-white border border-white/10 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:border-white/30"
                >
                  <option value="">All Cities</option>
                  {cities.sort().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <Button 
                  variant="outline" 
                  className="bg-[#1a1a1a] text-white border-white/10 hover:bg-white/10 text-sm sm:text-base col-span-1 sm:col-span-3"
                  onClick={() => {
                    setFilterSport("");
                    setFilterCity("");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Display number of results and clear filters button if filters are active */}
            {(filterSport || filterCity || searchQuery) && (
              <div className="mb-4 flex justify-between items-center">
                <p className="text-white text-sm">
                  Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
                  {filterSport && ` for sport: ${filterSport}`}
                  {filterCity && ` in city: ${filterCity}`}
                  {searchQuery && ` matching: "${searchQuery}"`}
                </p>
              </div>
            )}

            {/* Teams Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-[#2a2a2a] rounded-xl overflow-hidden animate-pulse">
                    <div className="h-40 sm:h-48 bg-[#3a3a3a]"></div>
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="h-5 bg-[#3a3a3a] rounded w-3/4"></div>
                      <div className="h-4 bg-[#3a3a3a] rounded w-1/2"></div>
                      <div className="h-4 bg-[#3a3a3a] rounded w-1/3"></div>
                      <div className="h-10 bg-[#3a3a3a] rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))
              ) : filteredTeams.length > 0 ? (
                filteredTeams.map(team => (
                  <TeamCard key={team._id} team={team} onJoin={handleJoinTeam} />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-10">
                  <p className="text-gray-400 mb-4">No teams found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="border-white/10"
                    onClick={() => {
                      setFilterSport("");
                      setFilterCity("");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="pt-4 sm:pt-6">
            <form onSubmit={handleCreateTeam} className="bg-[#2a2a2a] p-4 sm:p-6 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">Team Name</label>
                  <Input
                    name="name"
                    value={newTeam.name}
                    onChange={handleInputChange}
                    placeholder="Enter team name"
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400 shadow-[0_0_10px_rgba(255,255,255,0.1)] focus:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Sport</label>
                    <select
                      name="sport"
                      value={newTeam.sport}
                      onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:border-white/30"
                    >
                      <option value="">Select Sport</option>
                      {sports.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                      <option value="Other">Other (Custom Sport)</option>
                    </select>
                    
                    {newTeam.sport === 'Other' && (
                      <div className="mt-2">
                        <Input
                          name="customSport"
                          value={newTeam.customSport}
                          onChange={handleInputChange}
                          placeholder="Enter your sport"
                          className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">City</label>
                    <select
                      name="city"
                      value={newTeam.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:border-white/30"
                    >
                      <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                      <option value="Other">Other (Custom Location)</option>
                    </select>
                    
                    {newTeam.city === 'Other' && (
                      <div className="mt-2">
                        <Input
                          name="customCity"
                          value={newTeam.customCity}
                          onChange={handleInputChange}
                          placeholder="Enter your city or village"
                          className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">State</label>
                    <select
                      name="state"
                      value={newTeam.state}
                      onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:border-white/30"
                    >
                      {['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat'].map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Skill Level</label>
                    <select
                      name="skillLevel"
                      value={newTeam.skillLevel}
                      onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:border-white/30"
                    >
                      <option value="">Select Skill Level</option>
                      {SKILL_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Maximum Team Size</label>
                    <Input
                      type="number"
                      name="maxSize"
                      value={newTeam.maxSize}
                      onChange={handleInputChange}
                      placeholder="Enter max team size"
                      min="2"
                      className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <Textarea
                    name="description"
                    value={newTeam.description}
                    onChange={handleInputChange}
                    placeholder="Describe your team..."
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Contact Details</label>
                  <Input
                    name="contactDetails"
                    value={newTeam.contactDetails}
                    onChange={handleInputChange}
                    placeholder="Phone number or other contact information..."
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-400"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-white text-[#1a1a1a] hover:bg-gray-100 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1a1a1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Team...
                    </span>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Team
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
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
                Building team spirit and connecting athletes across communities.
              </p>
            </div>
            
            {/* Teams Links Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Teams</h3>
              <ul className="space-y-2">
                {["Find Teams", "Create Team", "Team Management", "Team Events"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sports Links Column */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Sports</h3>
              <ul className="space-y-2">
                {["Basketball", "Soccer", "Volleyball", "Tennis", "Cricket"].map((link) => (
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
                {["About", "Community", "Contact", "Support"].map((link) => (
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

export default Teams;
