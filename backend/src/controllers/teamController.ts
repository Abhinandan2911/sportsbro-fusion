import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Team from '../models/teamModel';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * @desc    Get all teams with filters
 * @route   GET /api/teams
 * @access  Public
 */
export const getTeams = async (req: Request, res: Response) => {
  try {
    const { sport, city, state, district, search, skillLevel } = req.query;
    
    // Prepare filter object
    const filter: any = {};
    
    // Add sport filter if provided
    if (sport) {
      filter.sport = sport;
    }
    
    // Add city filter if provided
    if (city) {
      filter.city = { $regex: city, $options: 'i' };  // Case-insensitive partial match
    }
    
    // Add state filter if provided
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }
    
    // Add district filter if provided
    if (district) {
      filter.district = { $regex: district, $options: 'i' };
    }
    
    // Add skill level filter if provided
    if (skillLevel) {
      filter.skillLevel = skillLevel;
    }
    
    // Add search filter if provided
    if (search) {
      // If there's a search term, use MongoDB's text search
      filter.$text = { $search: search as string };
    }
    
    // Get teams based on filter
    const teams = await Team.find(filter)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    return successResponse(res, teams, 'Teams retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve teams', 500, error);
  }
};

/**
 * @desc    Get a team by ID
 * @route   GET /api/teams/:id
 * @access  Public
 */
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto')
      .populate('joinRequests', 'fullName email profilePhoto');
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    return successResponse(res, team, 'Team retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve team', 500, error);
  }
};

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private
 */
export const createTeam = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const userId = (req.user as any)._id;
    
    const { 
      name, sport, city, state, district, skillLevel, 
      maxSize, description, contactDetails, imgUrl, isPublic 
    } = req.body;
    
    // Validate required fields
    if (!name || !sport || !city || !state || !skillLevel || !maxSize || !description || !contactDetails) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }
    
    const team = await Team.create({
      name,
      sport,
      city,
      state,
      district: district || '',
      skillLevel,
      members: [userId], // Add creator as first member
      joinRequests: [],
      maxSize,
      description,
      contactDetails,
      imgUrl: imgUrl || undefined,
      createdBy: userId,
      isPublic: isPublic === undefined ? true : isPublic
    });
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Team created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create team', 500, error);
  }
};

/**
 * @desc    Update a team
 * @route   PUT /api/teams/:id
 * @access  Private (Team Creator Only)
 */
export const updateTeam = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const userId = (req.user as any)._id;
    
    const { 
      name, sport, city, state, district, skillLevel, 
      maxSize, description, contactDetails, imgUrl, isPublic 
    } = req.body;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if user is the team creator
    if (team.createdBy.toString() !== userId.toString()) {
      return errorResponse(res, 'You are not authorized to update this team', 403);
    }
    
    // Update team fields
    team.name = name || team.name;
    team.sport = sport || team.sport;
    team.city = city || team.city;
    team.state = state || team.state;
    team.district = district || team.district;
    team.skillLevel = skillLevel || team.skillLevel;
    team.maxSize = maxSize || team.maxSize;
    team.description = description || team.description;
    team.contactDetails = contactDetails || team.contactDetails;
    team.imgUrl = imgUrl || team.imgUrl;
    
    if (isPublic !== undefined) {
      team.isPublic = isPublic;
    }
    
    const updatedTeam = await team.save();
    
    const populatedTeam = await Team.findById(updatedTeam._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto')
      .populate('joinRequests', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Team updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update team', 500, error);
  }
};

/**
 * @desc    Delete a team
 * @route   DELETE /api/teams/:id
 * @access  Private (Team Creator Only)
 */
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const userId = (req.user as any)._id;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if user is the team creator
    if (team.createdBy.toString() !== userId.toString()) {
      return errorResponse(res, 'You are not authorized to delete this team', 403);
    }
    
    await team.deleteOne();
    
    return successResponse(res, { id: req.params.id }, 'Team deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete team', 500, error);
  }
};

/**
 * @desc    Request to join a team
 * @route   POST /api/teams/:id/request
 * @access  Private
 */
export const requestToJoinTeam = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const userId = (req.user as any)._id;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if team is accepting requests
    if (!team.isPublic) {
      return errorResponse(res, 'This team is not accepting join requests', 400);
    }
    
    // Check if team is full
    if (team.members.length >= team.maxSize) {
      return errorResponse(res, 'This team is already full', 400);
    }
    
    // Check if user is already a member
    if (team.members.includes(userId)) {
      return errorResponse(res, 'You are already a member of this team', 400);
    }
    
    // Check if user has already requested to join
    if (team.joinRequests.includes(userId)) {
      return errorResponse(res, 'You have already requested to join this team', 400);
    }
    
    // Add user to join requests array
    team.joinRequests.push(userId);
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto')
      .populate('joinRequests', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Join request sent successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to send join request', 500, error);
  }
};

/**
 * @desc    Accept a join request
 * @route   POST /api/teams/:id/accept/:userId
 * @access  Private (Team Creator Only)
 */
export const acceptJoinRequest = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const creatorId = (req.user as any)._id;
    const requestUserId = new mongoose.Types.ObjectId(req.params.userId);
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if user is the team creator
    if (team.createdBy.toString() !== creatorId.toString()) {
      return errorResponse(res, 'You are not authorized to manage this team', 403);
    }
    
    // Check if team is full
    if (team.members.length >= team.maxSize) {
      return errorResponse(res, 'This team is already full', 400);
    }
    
    // Check if the user has a pending join request
    const hasRequest = team.joinRequests.some(id => id.toString() === requestUserId.toString());
    if (!hasRequest) {
      return errorResponse(res, 'No pending join request found for this user', 400);
    }
    
    // Add user to members array and remove from join requests
    team.members.push(requestUserId);
    team.joinRequests = team.joinRequests.filter(
      (id) => id.toString() !== requestUserId.toString()
    );
    
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto')
      .populate('joinRequests', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Join request accepted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to accept join request', 500, error);
  }
};

/**
 * @desc    Reject a join request
 * @route   POST /api/teams/:id/reject/:userId
 * @access  Private (Team Creator Only)
 */
export const rejectJoinRequest = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const creatorId = (req.user as any)._id;
    const requestUserId = new mongoose.Types.ObjectId(req.params.userId);
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if user is the team creator
    if (team.createdBy.toString() !== creatorId.toString()) {
      return errorResponse(res, 'You are not authorized to manage this team', 403);
    }
    
    // Check if the user has a pending join request
    const hasRequest = team.joinRequests.some(id => id.toString() === requestUserId.toString());
    if (!hasRequest) {
      return errorResponse(res, 'No pending join request found for this user', 400);
    }
    
    // Remove user from join requests
    team.joinRequests = team.joinRequests.filter(
      (id) => id.toString() !== requestUserId.toString()
    );
    
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto')
      .populate('joinRequests', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Join request rejected successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to reject join request', 500, error);
  }
};

/**
 * @desc    Cancel join request
 * @route   POST /api/teams/:id/cancel-request
 * @access  Private
 */
export const cancelJoinRequest = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const userId = (req.user as any)._id;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if the user has a pending join request
    const hasRequest = team.joinRequests.some(id => id.toString() === userId.toString());
    if (!hasRequest) {
      return errorResponse(res, 'You have not requested to join this team', 400);
    }
    
    // Remove user from join requests
    team.joinRequests = team.joinRequests.filter(
      (id) => id.toString() !== userId.toString()
    );
    
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Join request canceled successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel join request', 500, error);
  }
};

/**
 * @desc    Join a team
 * @route   POST /api/teams/:id/join
 * @access  Private
 */
export const joinTeam = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const userId = (req.user as any)._id;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if team is full
    if (team.members.length >= team.maxSize) {
      return errorResponse(res, 'This team is already full', 400);
    }
    
    // Check if user is already a member
    const isMember = team.members.some(id => id.toString() === userId.toString());
    if (isMember) {
      return errorResponse(res, 'You are already a member of this team', 400);
    }
    
    // Add user to members array
    team.members.push(userId);
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Successfully joined team');
  } catch (error) {
    return errorResponse(res, 'Failed to join team', 500, error);
  }
};

/**
 * @desc    Leave a team
 * @route   POST /api/teams/:id/leave
 * @access  Private
 */
export const leaveTeam = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const userId = (req.user as any)._id;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if user is a member
    const isMember = team.members.some(id => id.toString() === userId.toString());
    if (!isMember) {
      return errorResponse(res, 'You are not a member of this team', 400);
    }
    
    // Check if user is the team creator (creator cannot leave)
    if (team.createdBy.toString() === userId.toString()) {
      return errorResponse(res, 'Team creator cannot leave the team. Transfer ownership or delete the team instead.', 400);
    }
    
    // Remove user from members array
    team.members = team.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Successfully left team');
  } catch (error) {
    return errorResponse(res, 'Failed to leave team', 500, error);
  }
};

/**
 * @desc    Remove a member from a team
 * @route   POST /api/teams/:id/remove/:userId
 * @access  Private (Team Creator Only)
 */
export const removeMember = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Safely access user ID with type assertion
    const creatorId = (req.user as any)._id;
    const memberIdToRemove = new mongoose.Types.ObjectId(req.params.userId);
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }
    
    // Check if user is the team creator
    if (team.createdBy.toString() !== creatorId.toString()) {
      return errorResponse(res, 'You are not authorized to manage this team', 403);
    }
    
    // Check if the user to remove is a member
    const isMember = team.members.some(id => id.toString() === memberIdToRemove.toString());
    if (!isMember) {
      return errorResponse(res, 'User is not a member of this team', 400);
    }
    
    // Check if trying to remove the creator
    if (team.createdBy.toString() === memberIdToRemove.toString()) {
      return errorResponse(res, 'Cannot remove the team creator', 400);
    }
    
    // Remove user from members array
    team.members = team.members.filter(
      (id) => id.toString() !== memberIdToRemove.toString()
    );
    
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'fullName email profilePhoto')
      .populate('members', 'fullName email profilePhoto')
      .populate('joinRequests', 'fullName email profilePhoto');
    
    return successResponse(res, populatedTeam, 'Member removed successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to remove member', 500, error);
  }
}; 