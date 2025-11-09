import React, { useState } from 'react';
import { useGroups, calculateSplits } from '../context/GroupContext.jsx';

const AddGroupExpense = ({ groupId, onBack, onExpenseAdded }) => {
  const { getGroup, addGroupExpense } = useGroups();
  const group = getGroup(groupId);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: group?.members[0]?.id || '',
    splitType: 'equal',
    category: 'General',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [customSplits, setCustomSplits] = useState(
    group?.members.map(member => ({
      memberId: member.id,
      amount: 0,
      percentage: 0,
      included: true
    })) || []
  );
  
  const [errors, setErrors] = useState({});

  if (!group) {
    return (
      <div className="group-not-found">
        <h2>Group not found</h2>
        <button className="btn btn-primary" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

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

  const handleSplitChange = (memberId, field, value) => {
    const numValue = parseFloat(value) || 0;
    
    setCustomSplits(prev => {
      const updated = prev.map(split => 
        split.memberId === memberId 
          ? { ...split, [field]: numValue }
          : split
      );
      
      // Auto-calculate remaining amount for exact splits
      if (field === 'amount' && formData.splitType === 'exact' && formData.amount) {
        const totalAmount = parseFloat(formData.amount);
        const activeSplits = updated.filter(split => split.included);
        const changedSplitIndex = activeSplits.findIndex(split => split.memberId === memberId);
        
        if (activeSplits.length > 1) {
          // Calculate total of manually entered amounts (excluding the one being changed)
          let manualTotal = 0;
          let unsetCount = 0;
          let lastUnsetIndex = -1;
          
          activeSplits.forEach((split, index) => {
            if (index === changedSplitIndex) {
              manualTotal += numValue;
            } else if (split.amount > 0) {
              manualTotal += split.amount;
            } else {
              unsetCount++;
              lastUnsetIndex = index;
            }
          });
          
          // If only one amount is unset, auto-calculate it
          if (unsetCount === 1 && lastUnsetIndex !== -1) {
            const remaining = totalAmount - manualTotal;
            if (remaining >= 0) {
              const lastSplit = activeSplits[lastUnsetIndex];
              return updated.map(split => 
                split.memberId === lastSplit.memberId 
                  ? { ...split, amount: remaining }
                  : split
              );
            }
          }
          
          // If this is the last person being set and others are already set, adjust this amount
          if (unsetCount === 0 && changedSplitIndex === activeSplits.length - 1) {
            const othersTotal = activeSplits.slice(0, -1).reduce((sum, split) => sum + split.amount, 0);
            const remaining = totalAmount - othersTotal;
            if (remaining >= 0) {
              return updated.map(split => 
                split.memberId === memberId 
                  ? { ...split, amount: remaining }
                  : split
              );
            }
          }
        }
      }
      
      return updated;
    });
  };

  const handleIncludeToggle = (memberId) => {
    setCustomSplits(prev => prev.map(split => 
      split.memberId === memberId 
        ? { ...split, included: !split.included }
        : split
    ));
  };

  const getActiveSplits = () => {
    return customSplits.filter(split => split.included);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    // Validate splits based on type
    const activeSplits = getActiveSplits();
    if (activeSplits.length === 0) {
      newErrors.splits = 'At least one member must be included in the split';
    }

    if (formData.splitType === 'exact') {
      const totalSplit = activeSplits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        newErrors.splits = `Split amounts must add up to ${amount}. Current total: ${totalSplit.toFixed(2)}`;
      }
    }

    if (formData.splitType === 'percentage') {
      const totalPercentage = activeSplits.reduce((sum, split) => sum + split.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        newErrors.splits = `Percentages must add up to 100%. Current total: ${totalPercentage.toFixed(1)}%`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const amount = parseFloat(formData.amount);
    const activeSplits = getActiveSplits();
    const activeMembers = activeSplits.map(split => 
      group.members.find(member => member.id === split.memberId)
    );

    let finalSplits;
    if (formData.splitType === 'equal') {
      finalSplits = calculateSplits(amount, activeMembers, 'equal');
    } else if (formData.splitType === 'exact') {
      finalSplits = activeSplits.map(split => ({
        memberId: split.memberId,
        amount: split.amount
      }));
    } else if (formData.splitType === 'percentage') {
      finalSplits = activeSplits.map(split => ({
        memberId: split.memberId,
        amount: (amount * split.percentage) / 100
      }));
    }

    const expenseData = {
      description: formData.description.trim(),
      amount,
      paidBy: formData.paidBy,
      splitType: formData.splitType,
      splits: finalSplits,
      category: formData.category,
      date: formData.date
    };

    addGroupExpense(groupId, expenseData);
    
    if (onExpenseAdded) {
      onExpenseAdded();
    }
  };

  const getSplitPreview = () => {
    if (!formData.amount) return null;
    
    const amount = parseFloat(formData.amount);
    const activeSplits = getActiveSplits();
    const activeMembers = activeSplits.map(split => 
      group.members.find(member => member.id === split.memberId)
    );

    if (formData.splitType === 'equal') {
      const equalAmount = amount / activeMembers.length;
      return activeMembers.map(member => ({
        name: member.name,
        amount: equalAmount
      }));
    }

    if (formData.splitType === 'exact') {
      return activeSplits.map(split => {
        const member = group.members.find(m => m.id === split.memberId);
        return {
          name: member.name,
          amount: split.amount || 0
        };
      });
    }

    if (formData.splitType === 'percentage') {
      return activeSplits.map(split => {
        const member = group.members.find(m => m.id === split.memberId);
        const splitAmount = (amount * (split.percentage || 0)) / 100;
        return {
          name: member.name,
          amount: splitAmount
        };
      });
    }

    return [];
  };

  const getSplitSummary = () => {
    const preview = getSplitPreview();
    if (!preview || !formData.amount) return null;
    
    const totalSplit = preview.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = parseFloat(formData.amount);
    const difference = totalAmount - totalSplit;
    
    return {
      totalSplit,
      totalAmount,
      difference,
      isValid: Math.abs(difference) < 0.01
    };
  };

  const splitPreview = getSplitPreview();
  const splitSummary = getSplitSummary();

  return (
    <div className="add-group-expense">
      <div className="add-expense-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>Add Group Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-expense-form">
        <div className="form-section">
          <h3>Expense Details</h3>
          
          <div className="form-control">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Dinner at restaurant, Hotel booking"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-control">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.amount ? 'error' : ''}
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>

            <div className="form-control">
              <label htmlFor="paidBy">Paid By *</label>
              <select
                id="paidBy"
                name="paidBy"
                value={formData.paidBy}
                onChange={handleInputChange}
                className={errors.paidBy ? 'error' : ''}
              >
                <option value="">Select member</option>
                {group.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {errors.paidBy && <span className="error-message">{errors.paidBy}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-control">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="General">General</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Split Details</h3>
          
          <div className="form-control">
            <label htmlFor="splitType">Split Type</label>
            <select
              id="splitType"
              name="splitType"
              value={formData.splitType}
              onChange={handleInputChange}
            >
              <option value="equal">Split Equally</option>
              <option value="exact">Exact Amounts</option>
              <option value="percentage">By Percentage</option>
            </select>
          </div>

          <div className="splits-section">
            <h4>Members ({getActiveSplits().length} of {group.members.length} included)</h4>
            
            <div className="members-splits">
              {group.members.map(member => {
                const split = customSplits.find(s => s.memberId === member.id);
                return (
                  <div key={member.id} className="member-split-row">
                    <div className="member-info">
                      <input
                        type="checkbox"
                        checked={split?.included || false}
                        onChange={() => handleIncludeToggle(member.id)}
                      />
                      <span className="member-name">{member.name}</span>
                    </div>
                    
                    {split?.included && formData.splitType === 'exact' && (
                      <input
                        type="number"
                        value={split.amount}
                        onChange={(e) => handleSplitChange(member.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="split-input"
                      />
                    )}
                    
                    {split?.included && formData.splitType === 'percentage' && (
                      <div className="percentage-input">
                        <input
                          type="number"
                          value={split.percentage}
                          onChange={(e) => handleSplitChange(member.id, 'percentage', e.target.value)}
                          placeholder="0"
                          step="0.1"
                          min="0"
                          max="100"
                          className="split-input"
                        />
                        <span>%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {errors.splits && <span className="error-message">{errors.splits}</span>}
          </div>

          {splitPreview && (
            <div className="split-preview">
              <h4>Split Preview</h4>
              <div className="preview-list">
                {splitPreview.map((item, index) => (
                  <div key={index} className="preview-item">
                    <span>{item.name}</span>
                    <span>₹{item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {splitSummary && formData.splitType !== 'equal' && (
                <div className={`split-summary ${splitSummary.isValid ? 'valid' : 'invalid'}`}>
                  <div className="summary-row">
                    <span>Total Split:</span>
                    <span>₹{splitSummary.totalSplit.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <span>₹{splitSummary.totalAmount.toFixed(2)}</span>
                  </div>
                  {!splitSummary.isValid && (
                    <div className="summary-row difference">
                      <span>Difference:</span>
                      <span className={splitSummary.difference > 0 ? 'positive' : 'negative'}>
                        ₹{Math.abs(splitSummary.difference).toFixed(2)} 
                        {splitSummary.difference > 0 ? ' remaining' : ' over'}
                      </span>
                    </div>
                  )}
                  {splitSummary.isValid && (
                    <div className="summary-row valid-indicator">
                      <span>✓ Split is balanced</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGroupExpense;