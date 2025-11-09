import React, { useState } from 'react';
import { useGroups } from '../context/GroupContext.jsx';

const GroupList = ({ onGroupSelect, onCreateGroup }) => {
  const { groups, deleteGroup } = useGroups();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleDeleteGroup = (groupId) => {
    deleteGroup(groupId);
    setShowDeleteConfirm(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="group-list">
      <div className="group-list-header">
        <h2>Your Groups</h2>
        <button className="btn btn-primary" onClick={onCreateGroup}>
          + Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Groups Yet</h3>
          <p>Create your first group to start tracking shared expenses</p>
          <button className="btn btn-primary" onClick={onCreateGroup}>
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-card-header">
                <h3 className="group-name" onClick={() => onGroupSelect(group.id)}>
                  {group.name}
                </h3>
                <div className="group-actions">
                  <button 
                    className="btn-icon btn-danger"
                    onClick={() => setShowDeleteConfirm(group.id)}
                    title="Delete Group"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <p className="group-description">{group.description}</p>
              
              <div className="group-stats">
                <div className="stat">
                  <span className="stat-label">Members</span>
                  <span className="stat-value">{group.members.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Expenses</span>
                  <span className="stat-value">{group.expenses.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{formatCurrency(group.totalExpense)}</span>
                </div>
              </div>

              <div className="group-members">
                <div className="members-list">
                  {group.members.slice(0, 3).map(member => (
                    <div key={member.id} className="member-avatar" title={member.name}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="member-avatar more">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-outline view-group-btn"
                onClick={() => onGroupSelect(group.id)}
              >
                View Group
              </button>

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm === group.id && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>Delete Group</h3>
                    <p>Are you sure you want to delete "{group.name}"? This action cannot be undone.</p>
                    <div className="modal-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;