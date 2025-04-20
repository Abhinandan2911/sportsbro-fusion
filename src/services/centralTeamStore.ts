import { v4 as uuidv4 } from 'uuid'; // We would need to install this
import { apiClient } from './api';
import { handleApiError, showSuccess } from './errorHandler';

// Define interfaces
export interface TeamMember {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
  profilePhoto?: string;
  userId: string;
  joinedAt: string;
}

export interface JoinRequest {
  _id: string;
  userId: string;
  username?: string;
  requestedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  sport: string;
  description: string;
  city: string;
  state: string;
  skillLevel: string;
  maxSize: number;
  members: TeamMember[];
  joinRequests: JoinRequest[];
  createdBy: {
    _id: string;
    username: string;
    fullName?: string;
    email?: string;
    profilePhoto?: string;
  };
  isCustomSport?: boolean;
  isCustomCity?: boolean;
  createdAt: string;
  updatedAt: string;
  imgUrl: string;
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

// Sample sports and cities for India
export const INDIAN_SPORTS = [
  'Cricket', 'Football', 'Hockey', 'Badminton', 'Basketball', 'Tennis',
  'Kabaddi', 'Wrestling', 'Boxing', 'Athletics', 'Volleyball', 'Table Tennis',
  'Chess', 'Swimming', 'Kho Kho', 'Archery', 'Shooting', 'Weightlifting'
];

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Surat'
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Central database with API connections
class TeamDatabase {
  private static instance: TeamDatabase;
  private customSports: string[] = [];
  private customCities: string[] = [];
  private subscribers: Array<() => void> = [];

  private constructor() {
    this.loadCustomDataFromStorage();
  }

  public static getInstance(): TeamDatabase {
    if (!TeamDatabase.instance) {
      TeamDatabase.instance = new TeamDatabase();
    }
    return TeamDatabase.instance;
  }

  // Save custom data to local storage
  private saveCustomDataToStorage() {
    try {
      localStorage.setItem('sportsbro_custom_sports', JSON.stringify(this.customSports));
      localStorage.setItem('sportsbro_custom_cities', JSON.stringify(this.customCities));
    } catch (error) {
      console.error('Error saving custom data to storage:', error);
    }
  }

  // Load custom data from local storage when initializing
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

  // Subscribe to changes (for reactive updates)
  public subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers of changes
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Get all teams
  public async getAllTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get('/teams');
      return response.data.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch teams');
      return [];
    }
  }

  // Get team by ID
  public async getTeamById(id: string): Promise<Team | null> {
    try {
      const response = await apiClient.get(`/teams/${id}`);
      return response.data.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch team details');
      return null;
    }
  }

  // Create a new team
  public async createTeam(teamData: CreateTeamData, userData: any): Promise<Team> {
    try {
      // Track custom sports and cities locally
      if (teamData.isCustomSport && !this.customSports.includes(teamData.sport) && 
          !INDIAN_SPORTS.includes(teamData.sport)) {
        this.customSports.push(teamData.sport);
        this.saveCustomDataToStorage();
      }
      
      if (teamData.isCustomCity && !this.customCities.includes(teamData.city) &&
          !INDIAN_CITIES.includes(teamData.city)) {
        this.customCities.push(teamData.city);
        this.saveCustomDataToStorage();
      }
      
      // Create team via API
      const response = await apiClient.post('/teams', teamData);
      this.notifySubscribers();
      return response.data.data;
    } catch (error) {
      handleApiError(error, 'Failed to create team');
      throw error;
    }
  }

  // Request to join a team
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

  // Get all unique sports (including custom)
  public getAllSports(): string[] {
    return [...INDIAN_SPORTS, ...this.customSports];
  }
  
  // Get all unique cities (including custom)
  public getAllCities(): string[] {
    return [...INDIAN_CITIES, ...this.customCities];
  }
}

// Export the singleton instance
export const centralTeamStore = TeamDatabase.getInstance();

// Export default functions for easy access
export default {
  getAllTeams: () => centralTeamStore.getAllTeams(),
  getTeamById: (id: string) => centralTeamStore.getTeamById(id),
  createTeam: (teamData: CreateTeamData, userData: any) => centralTeamStore.createTeam(teamData, userData),
  requestToJoin: (teamId: string, userData: any) => centralTeamStore.requestToJoin(teamId, userData),
  subscribe: (callback: () => void) => centralTeamStore.subscribe(callback),
  getAllSports: () => centralTeamStore.getAllSports(),
  getAllCities: () => centralTeamStore.getAllCities()
}; 