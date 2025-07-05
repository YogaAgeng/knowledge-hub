/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

const StudyGroups = () => {
  const [studyGroups, setStudyGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, joined, discover
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStudyGroups([
        {
          _id: '1',
          name: 'Kalkulus Study Group',
          description: 'Belajar bareng kalkulus untuk persiapan UTS',
          subject: 'Kalkulus',
          semester: 'Semester 3',
          isPrivate: false,
          isMember: true,
          stats: {
            memberCount: 8,
            documentCount: 24,
            lastActivity: new Date()
          },
          owner: {
            nama: 'John Doe',
            email: 'john@example.com'
          }
        },
        {
          _id: '2',
          name: 'Algoritma & Pemrograman',
          description: 'Diskusi soal-soal algoritma dan coding',
          subject: 'Algoritma',
          semester: 'Semester 2',
          isPrivate: false,
          isMember: false,
          stats: {
            memberCount: 5,
            documentCount: 15,
            lastActivity: new Date()
          },
          owner: {
            nama: 'Jane Smith',
            email: 'jane@example.com'
          }
        },
        {
          _id: '3',
          name: 'Database Systems Private',
          description: 'Kelompok belajar database untuk kelas A',
          subject: 'Database',
          semester: 'Semester 4',
          isPrivate: true,
          isMember: true,
          stats: {
            memberCount: 4,
            documentCount: 10,
            lastActivity: new Date()
          },
          owner: {
            nama: 'Mike Johnson',
            email: 'mike@example.com'
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterGroups();
  }, [studyGroups, activeTab, searchQuery, selectedSubject]);

  const filterGroups = () => {
    let filtered = [...studyGroups];

    // Filter by tab
    if (activeTab === 'joined') {
      filtered = filtered.filter(group => group.isMember);
    } else if (activeTab === 'discover') {
      filtered = filtered.filter(group => !group.isMember && !group.isPrivate);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(group => group.subject === selectedSubject);
    }

    setFilteredGroups(filtered);
  };

  const handleJoinGroup = (groupId) => {
    // Simulate joining group
    const updatedGroups = studyGroups.map(group => {
      if (group._id === groupId) {
        return {
          ...group,
          isMember: true,
          stats: {
            ...group.stats,
            memberCount: group.stats.memberCount + 1
          }
        };
      }
      return group;
    });
    setStudyGroups(updatedGroups);
    alert('Successfully joined the group!');
  };

  const handleCreateGroup = (formData) => {
    const newGroup = {
      _id: Date.now().toString(),
      ...formData,
      isMember: true,
      stats: {
        memberCount: 1,
        documentCount: 0,
        lastActivity: new Date()
      },
      owner: {
        nama: 'Current User',
        email: 'user@example.com'
      }
    };
    setStudyGroups([newGroup, ...studyGroups]);
    setShowCreateModal(false);
    alert('Study group created successfully!');
  };

  const uniqueSubjects = [...new Set(studyGroups.map(g => g.subject).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Study Groups</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Group
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {['all', 'joined', 'discover'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                onJoin={handleJoinGroup}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">No study groups found</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateGroup}
        />
      )}
    </div>
  );
};

// Group Card Component
const GroupCard = ({ group, onJoin }) => {
  const getMemberCountColor = (count) => {
    if (count >= 8) return 'text-red-600 bg-red-50';
    if (count >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{group.name}</h3>
          <p className="text-sm text-gray-600">{group.subject} • {group.semester}</p>
        </div>
        {group.isPrivate && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            Private
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {group.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <span className={`px-2 py-1 rounded-full ${getMemberCountColor(group.stats.memberCount)}`}>
            {group.stats.memberCount}/10 members
          </span>
          <span className="text-gray-500">
            {group.stats.documentCount} docs
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        {!group.isMember && (
          <button
            onClick={() => onJoin(group._id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join Group
          </button>
        )}
        {group.isMember && (
          <button
            disabled
            className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-not-allowed"
          >
            Joined
          </button>
        )}
      </div>
    </div>
  );
};

// Create Group Modal Component
const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    semester: '',
    isPrivate: false
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.subject || !formData.semester) {
      alert('Please fill in all required fields');
      return;
    }
    onSuccess(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Study Group</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                placeholder="e.g., Kalkulus"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <input
                type="text"
                placeholder="e.g., Semester 3"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
              Make this group private (requires join code)
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;