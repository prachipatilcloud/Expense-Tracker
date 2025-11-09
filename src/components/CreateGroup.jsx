import React, { useState } from 'react';
import { useGroups } from '../context/GroupContext.jsx';

const CreateGroup = ({ onBack, onGroupCreated }) => {
  const { addGroup } = useGroups();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [members, setMembers] = useState([
    { id: Date.now().toString(), name: '', email: '' }
  ]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = members.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    setMembers(updatedMembers);
  };

  const addMember = () => {
    setMembers(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', email: '' }
    ]);
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }

    const validMembers = members.filter(member => member.name.trim());
    if (validMembers.length < 2) {
      newErrors.members = 'At least 2 members are required';
    }

    // Check for duplicate member names
    const memberNames = validMembers.map(m => m.name.trim().toLowerCase());
    const duplicates = memberNames.filter((name, index) => memberNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      newErrors.members = 'Member names must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const validMembers = members
      .filter(member => member.name.trim())
      .map(member => ({
        id: member.id,
        name: member.name.trim(),
        email: member.email.trim()
      }));

    const groupData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      members: validMembers
    };

    addGroup(groupData);
    
    if (onGroupCreated) {
      onGroupCreated();
    }
  };

  return (
    <div className="create-group">
      <div className="create-group-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>Create New Group</h2>
      </div>

      <form onSubmit={handleSubmit} className="create-group-form">
        <div className="form-section">
          <h3>Group Details</h3>
          
          <div className="form-control">
            <label htmlFor="name">Group Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Trip to Goa, Flatmates, Office Lunch"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-control">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the group"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="members-header">
            <h3>Group Members</h3>
            <button type="button" className="add-member-btn" onClick={addMember}>
              + Add Member
            </button>
          </div>

          <div className="members-list">
            {members.map((member, index) => (
              <div key={member.id} className="member-input-row">
                <div className="member-inputs">
                  <input
                    type="text"
                    placeholder="Member name *"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="member-name-input"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    className="member-email-input"
                  />
                </div>
                {members.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => removeMember(index)}
                    title="Remove member"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {errors.members && <span className="error-message">{errors.members}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;