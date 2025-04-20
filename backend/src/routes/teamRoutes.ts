import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  requestToJoinTeam,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
  removeMember
} from '../controllers/teamController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getTeams);
router.get('/:id', getTeamById);

// Protected routes - Team CRUD
router.post('/', protect, createTeam);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, deleteTeam);

// Protected routes - Team membership
router.post('/:id/join', protect, joinTeam);
router.post('/:id/leave', protect, leaveTeam);

// Protected routes - Join requests
router.post('/:id/request', protect, requestToJoinTeam);
router.post('/:id/cancel-request', protect, cancelJoinRequest);
router.post('/:id/accept/:userId', protect, acceptJoinRequest);
router.post('/:id/reject/:userId', protect, rejectJoinRequest);
router.post('/:id/remove/:userId', protect, removeMember);

export default router; 