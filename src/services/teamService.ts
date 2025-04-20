import axios from 'axios';
import { apiClient } from './api';
import { handleApiError, showSuccess } from './errorHandler';
import { v4 as uuidv4 } from 'uuid'; // We'll need to install this package

export interface TeamMember {
  userId: string;
  username: string;
  joinedAt: string;
}

export interface JoinRequest {
  _id: string;
  userId: string;
  username: string;
  requestedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  sport: string;
  description: string;
  location: string;
  city: string;
  state: string;
  schedule: string;
  skillLevel: string;
  maxSize: number;
  captain: {
    userId: string;
    username: string;
  };
  members: TeamMember[];
  joinRequests: JoinRequest[];
  createdBy: {
    _id: string;
    username: string;
    fullName?: string;
    email?: string;
  };
  isCustomSport?: boolean;
  isCustomCity?: boolean;
  createdAt: string;
  updatedAt: string;
  imgUrl?: string;
}

export interface CreateTeamData {
  name: string;
  sport: string;
  description: string;
  city: string;
  state: string;
  skillLevel: string;
  maxSize: number;
  contactDetails: string;
  isCustomSport?: boolean;
  isCustomCity?: boolean;
  imgUrl?: string;
}

export interface TeamFilters {
  sport?: string;
  skillLevel?: string;
  city?: string;
  state?: string;
  hasOpenSpots?: boolean;
  page?: number;
  limit?: number;
}

// States list for India
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
];

// List of popular sports in India
export const SPORTS_IN_INDIA = [
  'Cricket', 'Football', 'Hockey', 'Badminton', 'Basketball', 'Tennis',
  'Kabaddi', 'Wrestling', 'Boxing', 'Athletics', 'Volleyball', 'Table Tennis',
  'Chess', 'Swimming', 'Kho Kho', 'Archery', 'Shooting', 'Weightlifting'
];

// Major cities list for India
export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara',
  'Ludhiana', 'Agra', 'Nashik', 'Ranchi', 'Surat', 'Ghaziabad', 'Kochi'
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Modified TeamDatabase to use backend API
class TeamDatabase {
  private static instance: TeamDatabase;
  private customSports: string[] = [];
  private customCities: string[] = [];
  private subscribers: Array<() => void> = [];

  private constructor() {
    // Load custom sports and cities from localStorage
    this.loadCustomDataFromStorage();
  }

  public static getInstance(): TeamDatabase {
    if (!TeamDatabase.instance) {
      TeamDatabase.instance = new TeamDatabase();
    }
    return TeamDatabase.instance;
  }

  private saveCustomDataToStorage() {
    try {
      localStorage.setItem('sportsbro_custom_sports', JSON.stringify(this.customSports));
      localStorage.setItem('sportsbro_custom_cities', JSON.stringify(this.customCities));
    } catch (error) {
      console.error('Error saving custom data to storage:', error);
    }
  }

  private loadCustomDataFromStorage() {
    try {
      const sportsData = localStorage.getItem('sportsbro_custom_sports');
      const citiesData = localStorage.getItem('sportsbro_custom_cities');
      
      if (sportsData) {
        this.customSports = JSON.parse(sportsData);
      }
      
      if (citiesData) {
        this.customCities = JSON.parse(citiesData);
      }
    } catch (error) {
      console.error('Error loading custom data from storage:', error);
      this.customSports = [];
      this.customCities = [];
    }
  }

  public subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  public async getAllTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get('/teams');
      return response.data.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch teams');
      return [];
    }
  }

  public async getTeamById(id: string): Promise<Team | null> {
    try {
      const response = await apiClient.get(`/teams/${id}`);
      return response.data.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch team details');
      return null;
    }
  }

  public async createTeam(teamData: CreateTeamData, userData: any): Promise<Team> {
    try {
      // Track custom sports and cities locally
      if (teamData.isCustomSport && !this.customSports.includes(teamData.sport) && 
          !SPORTS_IN_INDIA.includes(teamData.sport)) {
        this.customSports.push(teamData.sport);
        this.saveCustomDataToStorage();
      }
      
      if (teamData.isCustomCity && !this.customCities.includes(teamData.city) &&
          !INDIAN_CITIES.includes(teamData.city)) {
        this.customCities.push(teamData.city);
        this.saveCustomDataToStorage();
      }
      
      // Send to backend API
      const response = await apiClient.post('/teams', teamData);
      this.notifySubscribers();
      return response.data.data;
    } catch (error) {
      handleApiError(error, 'Failed to create team');
      throw error;
    }
  }

  public async updateTeam(id: string, teamData: Partial<Team>, userId: string): Promise<Team> {
    try {
      // Track new custom sport or city if changed
      if (teamData.sport) {
        if (!SPORTS_IN_INDIA.includes(teamData.sport) && !this.customSports.includes(teamData.sport)) {
          this.customSports.push(teamData.sport);
          this.saveCustomDataToStorage();
        }
      }
      
      if (teamData.city) {
        if (!INDIAN_CITIES.includes(teamData.city) && !this.customCities.includes(teamData.city)) {
          this.customCities.push(teamData.city);
          this.saveCustomDataToStorage();
        }
      }
      
      // Send to backend API
      const response = await apiClient.put(`/teams/${id}`, teamData);
      this.notifySubscribers();
      return response.data.data;
    } catch (error) {
      handleApiError(error, 'Failed to update team');
      throw error;
    }
  }

  public async deleteTeam(id: string, userId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/teams/${id}`);
      this.notifySubscribers();
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to delete team');
      throw error;
    }
  }

  public async requestToJoin(teamId: string, userData: any): Promise<boolean> {
    try {
      await apiClient.post(`/teams/${teamId}/request`);
      this.notifySubscribers();
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to send join request');
      throw error;
    }
  }

  public async cancelJoinRequest(teamId: string, userId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/teams/${teamId}/request`);
      this.notifySubscribers();
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to cancel join request');
      throw error;
    }
  }

  public async acceptJoinRequest(teamId: string, requestId: string, captainId: string): Promise<boolean> {
    try {
      await apiClient.post(`/teams/${teamId}/accept-request/${requestId}`);
      this.notifySubscribers();
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to accept join request');
      throw error;
    }
  }

  public async rejectJoinRequest(teamId: string, requestId: string, captainId: string): Promise<boolean> {
    try {
      await apiClient.post(`/teams/${teamId}/reject-request/${requestId}`);
      this.notifySubscribers();
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to reject join request');
      throw error;
    }
  }

  public async leaveTeam(teamId: string, userId: string): Promise<boolean> {
    try {
      await apiClient.post(`/teams/${teamId}/leave`);
      this.notifySubscribers();
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to leave team');
      throw error;
    }
  }

  public async removeMember(teamId: string, memberId: string, captainId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
      this.notifySubscribers();
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to remove member');
      throw error;
    }
  }

  public getAllCustomSports(): string[] {
    return [...this.customSports];
  }
  
  public getAllCustomCities(): string[] {
    return [...this.customCities];
  }
}

// Initialize the TeamDatabase singleton
const teamDB = TeamDatabase.getInstance();

const teamService = {
  // Public constants
  SPORTS_IN_INDIA,
  INDIAN_CITIES,
  SKILL_LEVELS,
  INDIAN_STATES,

  // Get all teams with optional filters
  getTeams: async (filters: TeamFilters = {}): Promise<Team[]> => {
    try {
      let teams = await teamDB.getAllTeams();
      
      // Apply filters if provided
      if (filters.sport) {
        teams = teams.filter(team => team.sport.toLowerCase() === filters.sport?.toLowerCase());
      }
      
      if (filters.skillLevel) {
        teams = teams.filter(team => team.skillLevel === filters.skillLevel);
      }
      
      if (filters.city) {
        teams = teams.filter(team => team.city.toLowerCase() === filters.city?.toLowerCase());
      }
      
      if (filters.state) {
        teams = teams.filter(team => team.state === filters.state);
      }
      
      if (filters.hasOpenSpots) {
        teams = teams.filter(team => team.members.length < team.maxSize);
      }
      
      // Apply pagination if requested
      if (filters.page !== undefined && filters.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        teams = teams.slice(start, end);
      }
      
      return teams;
    } catch (error) {
      handleApiError(error, 'Failed to fetch teams');
      throw error;
    }
  },

  // Get all available sports (predefined + custom)
  getAllSports: (): string[] => {
    return [...SPORTS_IN_INDIA, ...teamDB.getAllCustomSports()];
  },
  
  // Get all available cities (predefined + custom)
  getAllCities: (): string[] => {
    return [...INDIAN_CITIES, ...teamDB.getAllCustomCities()];
  },

  // Subscribe to team database changes
  subscribeToTeamUpdates: (callback: () => void) => {
    return teamDB.subscribe(callback);
  },

  // Get team by ID
  getTeamById: async (teamId: string): Promise<Team> => {
    try {
      const team = await teamDB.getTeamById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    } catch (error) {
      handleApiError(error, 'Failed to fetch team details');
      throw error;
    }
  },

  // Create a new team
  createTeam: async (teamData: CreateTeamData, userData: any): Promise<Team> => {
    try {
      const team = await teamDB.createTeam(teamData, userData);
      showSuccess('Team created successfully! It is now visible to all players.');
      return team;
    } catch (error) {
      handleApiError(error, 'Failed to create team');
      throw error;
    }
  },

  // Update a team
  updateTeam: async (teamId: string, teamData: Partial<Team>, userId: string): Promise<Team> => {
    try {
      const team = await teamDB.updateTeam(teamId, teamData, userId);
      showSuccess('Team updated successfully!');
      return team;
    } catch (error) {
      handleApiError(error, 'Failed to update team');
      throw error;
    }
  },

  // Delete a team
  deleteTeam: async (teamId: string, userId: string): Promise<boolean> => {
    try {
      await teamDB.deleteTeam(teamId, userId);
      showSuccess('Team deleted successfully!');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to delete team');
      throw error;
    }
  },

  // Get teams created by the current user
  getMyTeams: async (userId: string): Promise<Team[]> => {
    try {
      const allTeams = await teamDB.getAllTeams();
      return allTeams.filter(team => 
        team.createdBy._id === userId || 
        team.members.some(member => member.userId === userId)
      );
    } catch (error) {
      handleApiError(error, 'Failed to fetch your teams');
      throw error;
    }
  },

  // Get teams captained by the current user
  getTeamsImCaptainOf: async (userId: string): Promise<Team[]> => {
    try {
      const allTeams = await teamDB.getAllTeams();
      return allTeams.filter(team => team.captain.userId === userId);
    } catch (error) {
      handleApiError(error, 'Failed to fetch your teams');
      throw error;
    }
  },

  // Request to join a team
  requestToJoinTeam: async (teamId: string, userData: any): Promise<boolean> => {
    try {
      await teamDB.requestToJoin(teamId, userData);
      showSuccess('Join request sent successfully!');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to send join request');
      throw error;
    }
  },

  // Cancel a join request
  cancelJoinRequest: async (teamId: string, userId: string): Promise<boolean> => {
    try {
      await teamDB.cancelJoinRequest(teamId, userId);
      showSuccess('Join request cancelled');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to cancel join request');
      throw error;
    }
  },

  // Accept a join request (team captain only)
  acceptJoinRequest: async (teamId: string, requestId: string, captainId: string): Promise<boolean> => {
    try {
      await teamDB.acceptJoinRequest(teamId, requestId, captainId);
      showSuccess('Join request accepted');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to accept join request');
      throw error;
    }
  },

  // Reject a join request (team captain only)
  rejectJoinRequest: async (teamId: string, requestId: string, captainId: string): Promise<boolean> => {
    try {
      await teamDB.rejectJoinRequest(teamId, requestId, captainId);
      showSuccess('Join request rejected');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to reject join request');
      throw error;
    }
  },

  // Leave a team
  leaveTeam: async (teamId: string, userId: string): Promise<boolean> => {
    try {
      await teamDB.leaveTeam(teamId, userId);
      showSuccess('You have left the team');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to leave team');
      throw error;
    }
  },

  // Remove a member from a team (team captain only)
  removeMember: async (teamId: string, memberId: string, captainId: string): Promise<boolean> => {
    try {
      await teamDB.removeMember(teamId, memberId, captainId);
      showSuccess('Member removed successfully');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to remove member');
      throw error;
    }
  }
};

export default teamService; 