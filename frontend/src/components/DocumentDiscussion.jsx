import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import axios from '../utils/axios';

const DocumentDiscussion = ({ documentId, currentUser }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [documentId, page]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/documents/${documentId}/discussions`, {
        params: { page, limit: 20 }
      });
      
      if (page === 1) {
        setDiscussions(response.data.data.discussions);
      } else {
        setDiscussions(prev => [...prev, ...response.data.data.discussions]);
      }
      
      setHasMore(response.data.data.pagination.hasNext);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const payload = {
        content: newComment,
        parentDiscussionId: replyTo
      };

      const response = await axios.post(
        `/api/documents/${documentId}/discussions`,
        payload
      );

      if (replyTo) {
        // Add reply to parent discussion
        setDiscussions(prevDiscussions => 
          prevDiscussions.map(disc => {
            if (disc._id === replyTo) {
              return {
                ...disc,
                replies: [...(disc.replies || []), response.data.data.discussion],
                replyCount: (disc.replyCount || 0) + 1
              };
            }
            return disc;
          })
        );
      } else {
        // Add new top-level discussion
        setDiscussions(prev => [response.data.data.discussion, ...prev]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  const handleEditComment = async (discussionId) => {
    try {
      await axios.put(`/api/discussions/${discussionId}`, {
        content: editContent
      });

      setDiscussions(prevDiscussions =>
        updateDiscussionInTree(prevDiscussions, discussionId, {
          content: editContent,
          edited: true,
          editedAt: new Date()
        })
      );

      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
      alert(error.response?.data?.message || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (discussionId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`/api/discussions/${discussionId}`);

      setDiscussions(prevDiscussions =>
        updateDiscussionInTree(prevDiscussions, discussionId, {
          content: '[This comment has been deleted]',
          isDeleted: true
        })
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleReaction = async (discussionId, reactionType) => {
    try {
      const response = await axios.post(`/api/discussions/${discussionId}/reactions`, {
        type: reactionType
      });

      setDiscussions(prevDiscussions =>
        updateDiscussionInTree(prevDiscussions, discussionId, {
          reactions: response.data.data.reactions,
          userReaction: response.data.data.userReaction
        })
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Helper function to update discussion in nested tree
  const updateDiscussionInTree = (discussions, targetId, updates) => {
    return discussions.map(disc => {
      if (disc._id === targetId) {
        return { ...disc, ...updates };
      }
      if (disc.replies && disc.replies.length > 0) {
        return {
          ...disc,
          replies: updateDiscussionInTree(disc.replies, targetId, updates)
        };
      }
      return disc;
    });
  };

  const DiscussionItem = ({ discussion, isReply = false }) => {
    const canEdit = discussion.author._id === currentUser?._id && !discussion.isDeleted;
    const timeSincePost = Date.now() - new Date(discussion.createdAt).getTime();
    const canStillEdit = canEdit && timeSincePost < 30 * 60 * 1000; // 30 minutes

    return (
      <div className={`${isReply ? 'ml-12 mt-4' : 'mb-6'} ${discussion.isDeleted ? 'opacity-60' : ''}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {discussion.author.nama?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {discussion.author.nama}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(discussion.createdAt), {
                      addSuffix: true,
                      locale: localeId
                    })}
                  </span>
                  {discussion.edited && (
                    <span className="text-xs text-gray-500">(edited)</span>
                  )}
                </div>

                {canEdit && !discussion.isDeleted && (
                  <div className="flex items-center space-x-2">
                    {canStillEdit && (
                      <button
                        onClick={() => {
                          setEditingId(discussion._id);
                          setEditContent(discussion.content);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(discussion._id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === discussion._id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(discussion._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap">{discussion.content}</p>
              )}
            </div>

            {/* Reactions and Reply button */}
            {!discussion.isDeleted && (
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  {['like', 'helpful', 'insightful'].map(reaction => {
                    const count = discussion.reactions?.filter(r => r.type === reaction).length || 0;
                    const isActive = discussion.userReaction === reaction;
                    
                    return (
                      <button
                        key={reaction}
                        onClick={() => handleReaction(discussion._id, reaction)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm transition-colors ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span>{getReactionEmoji(reaction)}</span>
                        {count > 0 && <span>{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {!isReply && (
                  <button
                    onClick={() => setReplyTo(discussion._id)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Reply
                  </button>
                )}
              </div>
            )}

            {/* Replies */}
            {discussion.replies && discussion.replies.length > 0 && (
              <div className="mt-4">
                {discussion.replies.map(reply => (
                  <DiscussionItem key={reply._id} discussion={reply} isReply={true} />
                ))}
              </div>
            )}

            {/* Reply form */}
            {replyTo === discussion._id && (
              <div className="mt-4 ml-12">
                <form onSubmit={handleSubmitComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getReactionEmoji = (type) => {
    const emojis = {
      like: '👍',
      helpful: '💡',
      insightful: '🤔',
      question: '❓'
    };
    return emojis[type] || '👍';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Discussion</h3>

      {/* New comment form */}
      {!replyTo && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Start a discussion..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Comment
            </button>
          </div>
        </form>
      )}

      {/* Discussions list */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No discussions yet. Be the first to start a conversation!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {discussions.map(discussion => (
              <DiscussionItem key={discussion._id} discussion={discussion} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                {loading ? 'Loading...' : 'Load More Comments'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentDiscussion;