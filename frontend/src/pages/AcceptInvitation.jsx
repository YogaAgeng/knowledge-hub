/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { acceptInvitation, rejectInvitation } from '../api/collaborationService';

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // You might want to fetch invitation details here
    // For now, we'll just show the accept/reject buttons
  }, [token]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const result = await acceptInvitation(token);
      toast.success('Invitation accepted successfully!');
      
      // Redirect to the document
      if (result.documentId) {
        navigate(`/documents/${result.documentId}`);
      } else {
        navigate('/documents');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to accept invitation';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectInvitation(token);
      toast.success('Invitation rejected');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject invitation';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="text-blue-500 text-5xl mb-4">🤝</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Collaboration Invitation
          </h2>
          <p className="text-gray-600 mb-8">
            You've been invited to collaborate on a document. Would you like to accept this invitation?
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Accepting...' : 'Accept Invitation'}
            </button>
            
            <button
              onClick={handleReject}
              disabled={loading}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Rejecting...' : 'Decline Invitation'}
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <Link to="/dashboard" className="text-blue-500 hover:text-blue-700">
              Go to Dashboard instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;