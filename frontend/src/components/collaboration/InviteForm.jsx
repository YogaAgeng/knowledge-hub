/* eslint-disable react/prop-types */
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import * as collaborationService from '../../api/collaborationService';

const InviteForm = ({ documentId, onInviteSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      await collaborationService.inviteCollaborator(documentId, {
        email: formData.email.trim(),
        role: formData.role,
        message: formData.message.trim()
      });
      
      setFormData({ email: '', role: 'viewer', message: '' });
      toast.success('Invitation sent successfully!');
      if (onInviteSuccess) onInviteSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send invitation';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions = {
    viewer: 'Can view the document but cannot make changes or comments',
    commenter: 'Can view the document and add comments, but cannot edit',
    editor: 'Can view, comment, and edit the document content'
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
        <span className="text-lg mr-2">📧</span>
        Invite Collaborator
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter collaborator's email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="viewer">Viewer</option>
            <option value="commenter">Commenter</option>
            <option value="editor">Editor</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            {roleDescriptions[formData.role]}
          </p>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <span className="mr-1">{showAdvanced ? '▼' : '▶'}</span>
          Advanced Options
        </button>

        {/* Optional Message */}
        {showAdvanced && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Add a personal message to the invitation..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
                maxLength="500"
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  This message will be included in the invitation email
                </p>
                <span className="text-xs text-gray-400">
                  {formData.message.length}/500
                </span>
              </div>
            </div>

            {/* Role Permissions Preview */}
            <div className="bg-gray-50 rounded p-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Permissions:
              </h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  View document content
                </li>
                {(formData.role === 'commenter' || formData.role === 'editor') && (
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Add and reply to comments
                  </li>
                )}
                {formData.role === 'editor' && (
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Edit document content
                  </li>
                )}
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  Manage collaborators or settings
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setFormData({ email: '', role: 'viewer', message: '' });
              setShowAdvanced(false);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading || !formData.email.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </span>
            ) : (
              'Send Invitation'
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 pt-3 border-t border-blue-200">
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">💡 Tips:</p>
          <ul className="space-y-1 ml-4">
            <li>• The collaborator will receive an email invitation</li>
            <li>• They must have a KnowledgeHub account to accept</li>
            <li>• You can change roles anytime after they join</li>
            <li>• Invitations expire after 7 days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InviteForm;