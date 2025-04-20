import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import teamService, { Team, TeamMember, JoinRequest } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Avatar, Badge, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { FaUserPlus, FaUserMinus, FaEdit, FaTrash, FaCheck, FaTimes, FaUser } from 'react-icons/fa';

const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [joinRequestSending, setJoinRequestSending] = useState(false);
  const [processingSince, setProcessingSince] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!teamId) return;
    
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        const fetchedTeam = await teamService.getTeamById(teamId);
        setTeam(fetchedTeam);
        
        // Check if user has already sent a join request
        if (user && fetchedTeam.joinRequests.some(req => req._id === user._id)) {
          setJoinRequestSent(true);
        }
      } catch (err) {
        setError('Failed to load team details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId, user]);

  const isTeamOwner = (): boolean => {
    return !!(user && team && team.createdBy._id === user._id);
  };

  const isTeamMember = (): boolean => {
    return !!(user && team && team.members.some(member => member._id === user._id));
  };

  const handleJoinRequest = async () => {
    if (!teamId || !user) return;
    
    try {
      setJoinRequestSending(true);
      await teamService.requestToJoinTeam(teamId);
      setJoinRequestSent(true);
      // Refetch team to update join requests
      const updatedTeam = await teamService.getTeamById(teamId);
      setTeam(updatedTeam);
    } catch (err) {
      setError('Failed to send join request');
      console.error(err);
    } finally {
      setJoinRequestSending(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!teamId || !user) return;
    
    try {
      setJoinRequestSending(true);
      await teamService.cancelJoinRequest(teamId);
      setJoinRequestSent(false);
      // Refetch team to update join requests
      const updatedTeam = await teamService.getTeamById(teamId);
      setTeam(updatedTeam);
    } catch (err) {
      setError('Failed to cancel join request');
      console.error(err);
    } finally {
      setJoinRequestSending(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!teamId || !user) return;
    
    if (window.confirm('Are you sure you want to leave this team?')) {
      try {
        await teamService.leaveTeam(teamId);
        // Refetch team to update members
        const updatedTeam = await teamService.getTeamById(teamId);
        setTeam(updatedTeam);
      } catch (err) {
        setError('Failed to leave team');
        console.error(err);
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId || !isTeamOwner()) return;
    
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await teamService.deleteTeam(teamId);
        navigate('/teams');
      } catch (err) {
        setError('Failed to delete team');
        console.error(err);
      }
    }
  };

  const handleEditTeam = () => {
    if (teamId) {
      navigate(`/teams/${teamId}/edit`);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!teamId || !isTeamOwner()) return;
    
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        setProcessingSince({...processingSince, [userId]: true});
        await teamService.removeMember(teamId, userId);
        // Refetch team to update members
        const updatedTeam = await teamService.getTeamById(teamId);
        setTeam(updatedTeam);
      } catch (err) {
        setError('Failed to remove member');
        console.error(err);
      } finally {
        setProcessingSince({...processingSince, [userId]: false});
      }
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!teamId || !isTeamOwner()) return;
    
    try {
      setProcessingSince({...processingSince, [userId]: true});
      await teamService.acceptJoinRequest(teamId, userId);
      // Refetch team to update members and join requests
      const updatedTeam = await teamService.getTeamById(teamId);
      setTeam(updatedTeam);
    } catch (err) {
      setError('Failed to accept join request');
      console.error(err);
    } finally {
      setProcessingSince({...processingSince, [userId]: false});
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!teamId || !isTeamOwner()) return;
    
    try {
      setProcessingSince({...processingSince, [userId]: true});
      await teamService.rejectJoinRequest(teamId, userId);
      // Refetch team to update join requests
      const updatedTeam = await teamService.getTeamById(teamId);
      setTeam(updatedTeam);
    } catch (err) {
      setError('Failed to reject join request');
      console.error(err);
    } finally {
      setProcessingSince({...processingSince, [userId]: false});
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!team) {
    return <Alert variant="warning">Team not found</Alert>;
  }

  return (
    <div className="team-detail-container">
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{team.name}</h2>
          <div>
            {isTeamOwner() && (
              <>
                <Button 
                  variant="outline-primary" 
                  className="me-2" 
                  onClick={handleEditTeam}
                >
                  <FaEdit /> Edit
                </Button>
                <Button 
                  variant="outline-danger" 
                  onClick={handleDeleteTeam}
                >
                  <FaTrash /> Delete
                </Button>
              </>
            )}
            {isTeamMember() && !isTeamOwner() && (
              <Button 
                variant="outline-danger" 
                onClick={handleLeaveTeam}
              >
                <FaUserMinus /> Leave Team
              </Button>
            )}
            {!isTeamMember() && !joinRequestSent && user && (
              <Button 
                variant="success" 
                onClick={handleJoinRequest}
                disabled={joinRequestSending}
              >
                {joinRequestSending ? (
                  <><Spinner size="sm" animation="border" /> Sending...</>
                ) : (
                  <><FaUserPlus /> Request to Join</>
                )}
              </Button>
            )}
            {!isTeamMember() && joinRequestSent && user && (
              <Button 
                variant="warning" 
                onClick={handleCancelRequest}
                disabled={joinRequestSending}
              >
                {joinRequestSending ? (
                  <><Spinner size="sm" animation="border" /> Cancelling...</>
                ) : (
                  <><FaTimes /> Cancel Request</>
                )}
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'details')}
            className="mb-3"
          >
            <Tab eventKey="details" title="Details">
              <div className="team-info mb-4">
                <div className="mb-3">
                  <Badge bg="secondary" className="mb-2">
                    <FaUser className="me-1" /> Created by: {team.createdBy?.fullName || team.createdBy?.username}
                  </Badge>
                </div>
                <p><strong>Description:</strong> {team.description}</p>
                <div className="team-metadata d-flex flex-wrap">
                  <Badge bg="primary" className="me-2 mb-2">Sport: {team.sport}</Badge>
                  <Badge bg="info" className="me-2 mb-2">Skill Level: {team.skillLevel}</Badge>
                  <Badge bg="secondary" className="me-2 mb-2">Location: {team.city}, {team.state}</Badge>
                  <Badge bg="dark" className="me-2 mb-2">
                    Members: {team.members.length}/{team.maxSize}
                  </Badge>
                  <Badge bg={team.isPrivate ? "danger" : "success"} className="mb-2">
                    {team.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
                <p className="text-muted mt-2">
                  Created on {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Tab>
            <Tab eventKey="members" title={`Members (${team.members.length})`}>
              <div className="team-members">
                <h5>Team Owner</h5>
                <div className="member-item d-flex align-items-center mb-3 p-2 border-bottom">
                  <Avatar src={team.createdBy.profilePicture || '/default-avatar.png'} 
                    className="me-3" style={{ width: 50, height: 50 }}/>
                  <div>
                    <h6>{team.createdBy.fullName || team.createdBy.username}</h6>
                    <small className="text-muted">{team.createdBy.email}</small>
                  </div>
                  <Badge bg="danger" className="ms-auto">Owner</Badge>
                </div>

                <h5>Team Members</h5>
                {team.members.filter(member => member._id !== team.createdBy._id).length === 0 ? (
                  <p className="text-muted">No other members yet</p>
                ) : (
                  team.members
                    .filter(member => member._id !== team.createdBy._id)
                    .map(member => (
                      <div key={member._id} className="member-item d-flex align-items-center mb-2 p-2 border-bottom">
                        <Avatar src={member.profilePicture || '/default-avatar.png'} 
                          className="me-3" style={{ width: 50, height: 50 }}/>
                        <div>
                          <h6>{member.fullName || member.username}</h6>
                          <small className="text-muted">{member.email}</small>
                        </div>
                        {isTeamOwner() && (
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="ms-auto"
                            onClick={() => handleRemoveMember(member._id)}
                            disabled={processingSince[member._id]}
                          >
                            {processingSince[member._id] ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <FaUserMinus />
                            )}
                          </Button>
                        )}
                      </div>
                    ))
                )}
              </div>
            </Tab>
            {isTeamOwner() && (
              <Tab eventKey="requests" title={`Join Requests (${team.joinRequests.length})`}>
                <div className="join-requests">
                  {team.joinRequests.length === 0 ? (
                    <p className="text-muted">No pending join requests</p>
                  ) : (
                    team.joinRequests.map(request => (
                      <div key={request._id} className="request-item d-flex align-items-center mb-2 p-2 border-bottom">
                        <Avatar src={request.profilePicture || '/default-avatar.png'} 
                          className="me-3" style={{ width: 50, height: 50 }}/>
                        <div>
                          <h6>{request.fullName || request.username}</h6>
                          <small className="text-muted">{request.email}</small>
                          <div>
                            <small>Requested on {new Date(request.requestDate).toLocaleDateString()}</small>
                          </div>
                        </div>
                        <div className="ms-auto">
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={processingSince[request._id]}
                          >
                            {processingSince[request._id] ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <><FaCheck /> Accept</>
                            )}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={processingSince[request._id]}
                          >
                            {processingSince[request._id] ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <><FaTimes /> Reject</>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Tab>
            )}
          </Tabs>
        </Card.Body>
        <Card.Footer className="text-muted">
          Last updated: {new Date(team.updatedAt).toLocaleDateString()}
        </Card.Footer>
      </Card>
    </div>
  );
};

export default TeamDetail; 