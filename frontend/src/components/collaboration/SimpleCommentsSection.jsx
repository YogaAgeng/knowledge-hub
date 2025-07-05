/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as api from '../../api/apiService';

const SimpleCommentsSection = ({ documentId, userRole, canComment }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (documentId) {
      fetchComments();
    }
  }, [documentId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.getComments(documentId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.addComment(documentId, {
        content: newComment.trim()
      });
      
      setNewComment('');
      fetchComments();
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };


  const getCurrentUserId = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}').id;
    } catch {
      return null;
    }
  };

  const canEditComment = (comment) => {
    return comment.user._id === getCurrentUserId() && !comment.resolved;
  };

  const canDeleteComment = (comment) => {
    return comment.user._id === getCurrentUserId() || userRole === 'owner';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {canComment && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a comment
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, ask questions, or provide feedback..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              maxLength="1000"
              disabled={submitting}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {newComment.length}/1000 characters
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">💬</div>
          <p className="text-gray-500 font-medium">No comments yet</p>
          {canComment ? (
            <p className="text-sm text-gray-400 mt-1">Be the first to add a comment</p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Comments will appear here</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Showing {comments.length} comments
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleCommentsSection;