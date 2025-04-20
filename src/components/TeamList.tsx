import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '@/services/teamService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Search, Plus, User } from 'lucide-react';
import teamService from '@/services/teamService';
import authService from '@/services/authService';
import { handleApiError } from '@/services/errorHandler';

interface TeamListProps {
  onSelectTeam?: (team: Team) => void;
  showCreateButton?: boolean;
}

const TeamList: React.FC<TeamListProps> = ({ 
  onSelectTeam, 
  showCreateButton = true
}) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('');
  
  const currentUser = authService.getCurrentUser();
  
  // Load teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [teams, searchTerm, sportFilter, stateFilter, skillLevelFilter]);
  
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const fetchedTeams = await teamService.getTeams();
      setTeams(fetchedTeams);
      setFilteredTeams(fetchedTeams);
      setError(null);
    } catch (err) {
      setError('Failed to load teams. Please try again later.');
      handleApiError(err, 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...teams];
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(team => 
        team.name.toLowerCase().includes(searchLower) || 
        team.description.toLowerCase().includes(searchLower) ||
        team.city.toLowerCase().includes(searchLower) ||
        (team.captain?.username && team.captain.username.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sport filter
    if (sportFilter) {
      result = result.filter(team => team.sport === sportFilter);
    }
    
    // Apply state filter
    if (stateFilter) {
      result = result.filter(team => team.state === stateFilter);
    }
    
    // Apply skill level filter
    if (skillLevelFilter) {
      result = result.filter(team => team.skillLevel === skillLevelFilter);
    }
    
    setFilteredTeams(result);
  };
  
  const handleTeamSelect = (team: Team) => {
    if (onSelectTeam) {
      onSelectTeam(team);
    } else {
      navigate(`/teams/${team._id}`);
    }
  };
  
  const handleCreateTeam = () => {
    if (!currentUser) {
      navigate('/login');
    } else {
      navigate('/teams/create');
    }
  };
  
  // Check if user has requested to join or is a member of a team
  const getUserStatusForTeam = (team: Team) => {
    if (!currentUser) return 'none';
    
    if (team.createdBy._id === currentUser._id) {
      return 'creator';
    }
    
    if (team.members.some(member => member._id === currentUser._id)) {
      return 'member';
    }
    
    if (team.joinRequests.some(request => request._id === currentUser._id)) {
      return 'requested';
    }
    
    return 'none';
  };
  
  // Display status badge based on user's relationship to team
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'creator':
        return <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">Creator</span>;
      case 'member':
        return <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Member</span>;
      case 'requested':
        return <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Requested</span>;
      default:
        return null;
    }
  };

  // Generate dynamic list of sports from existing teams
  const getAllSports = () => {
    const sportsSet = new Set(teamService.SPORTS_IN_INDIA);
    teams.forEach(team => {
      if (team.sport && !sportsSet.has(team.sport)) {
        sportsSet.add(team.sport);
      }
    });
    return Array.from(sportsSet);
  };
  
  // Generate dynamic list of cities from existing teams
  const getAllCities = () => {
    const citiesSet = new Set(teamService.INDIAN_CITIES);
    teams.forEach(team => {
      if (team.city && !citiesSet.has(team.city)) {
        citiesSet.add(team.city);
      }
    });
    return Array.from(citiesSet);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-[#2a2a2a] p-4 rounded-xl border border-white/10">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search teams by name, description, location or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-white/10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="bg-[#1a1a1a] border-white/10">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sports</SelectItem>
                {getAllSports().map(sport => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="bg-[#1a1a1a] border-white/10">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All States</SelectItem>
                {teamService.INDIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={skillLevelFilter} onValueChange={setSkillLevelFilter}>
              <SelectTrigger className="bg-[#1a1a1a] border-white/10">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Skill Levels</SelectItem>
                {teamService.SKILL_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Create Team Button */}
      {showCreateButton && (
        <div className="flex justify-end">
          <Button 
            className="bg-white text-[#1a1a1a] hover:bg-gray-100"
            onClick={handleCreateTeam}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>
      )}
      
      {/* Teams List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-6 bg-[#2a2a2a] rounded-xl border border-white/10 animate-pulse">
              <div className="h-6 w-2/3 bg-white/10 rounded mb-3"></div>
              <div className="h-4 bg-white/10 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-white/10 rounded mb-4 w-1/3"></div>
              <div className="flex justify-between">
                <div className="h-6 w-1/4 bg-white/10 rounded"></div>
                <div className="h-6 w-1/4 bg-white/10 rounded"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 border-red-500/20 text-red-400 hover:bg-red-500/10"
              onClick={fetchTeams}
            >
              Try Again
            </Button>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="p-6 bg-[#2a2a2a] rounded-xl border border-white/10 text-center">
            <p className="text-gray-400">No teams found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4 border-white/10"
              onClick={() => {
                setSearchTerm('');
                setSportFilter('');
                setStateFilter('');
                setSkillLevelFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredTeams.map((team) => {
            const userStatus = getUserStatusForTeam(team);
            const statusBadge = getStatusBadge(userStatus);
            
            return (
              <div 
                key={team._id}
                className="p-5 bg-[#2a2a2a] rounded-xl border border-white/10 hover:border-white/20 cursor-pointer transition-all duration-200"
                onClick={() => handleTeamSelect(team)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                    <div className="flex items-center text-gray-400 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{team.city}, {team.state}</span>
                    </div>
                  </div>
                  
                  {statusBadge}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full">
                    {team.sport}
                  </span>
                  <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full">
                    {team.skillLevel}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-400 text-xs mb-2">
                  <User className="h-3 w-3 mr-1" />
                  <span>Created by: {team.createdBy?.fullName || team.createdBy?.username}</span>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{team.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{team.members.length}/{team.maxSize} members</span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTeamSelect(team);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeamList; 