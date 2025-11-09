import React, { useState } from 'react';
import { useGroups, calculateGroupDebts } from '../context/GroupContext.jsx';

const SettleUp = ({ groupId, onBack }) => {
  console.log('SettleUp component rendered with groupId:', groupId);
  
  const { getGroup, getMember, settleDebt } = useGroups();
  const group = getGroup(groupId);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [description, setDescription] = useState('');

  console.log('SettleUp group:', group);

  if (!group) {
    return (
      <div className="settle-up-container">
        <h2>Group not found</h2>
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  const debts = calculateGroupDebts(group);
  
  const handleSettleClick = (debt) => {
    setSelectedDebt(debt);
    setSettlementAmount(debt.amount.toFixed(2));
    setDescription(`Settlement from ${getMember(groupId, debt.from)?.name} to ${getMember(groupId, debt.to)?.name}`);
    setIsModalOpen(true);
  };

  const handleSettleConfirm = () => {
    console.log('Settlement confirmation triggered');
    console.log('Selected debt:', selectedDebt);
    console.log('Settlement amount:', settlementAmount);
    console.log('Description:', description);
    
    if (selectedDebt && settlementAmount) {
      const amount = parseFloat(settlementAmount);
      console.log('Parsed amount:', amount);
      console.log('Max amount allowed:', selectedDebt.amount);
      
      if (amount > 0 && amount <= selectedDebt.amount) {
        console.log('Calling settleDebt with:', {
          groupId,
          fromMemberId: selectedDebt.from,
          toMemberId: selectedDebt.to,
          amount,
          description: description || `Settlement from ${getMember(groupId, selectedDebt.from)?.name} to ${getMember(groupId, selectedDebt.to)?.name}`
        });
        
        settleDebt(
          groupId,
          selectedDebt.from,
          selectedDebt.to,
          amount,
          description || `Settlement from ${getMember(groupId, selectedDebt.from)?.name} to ${getMember(groupId, selectedDebt.to)?.name}`
        );
        
        console.log('Settlement completed, closing modal');
        setIsModalOpen(false);
        setSelectedDebt(null);
        setSettlementAmount('');
        setDescription('');
      } else {
        console.log('Invalid amount - either <= 0 or > max allowed');
        alert('Please enter a valid settlement amount');
      }
    } else {
      console.log('Missing required data - selectedDebt or settlementAmount');
      alert('Please fill in all required fields');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDebt(null);
    setSettlementAmount('');
    setDescription('');
  };

  const getSettlementHistory = () => {
    return group.settlements || [];
  };

  return (
    <div className="settle-up-container">
      <div className="settle-up-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>Settle Up - {group.name}</h2>
      </div>

      <div className="settle-up-content">
        {/* Outstanding Debts */}
        <div className="debts-section">
          <h3>Outstanding Debts</h3>
          
          {debts.length === 0 ? (
            <div className="no-debts">
              <div className="no-debts-icon">✅</div>
              <h4>All settled up!</h4>
              <p>Everyone in this group is all settled up. No outstanding debts.</p>
            </div>
          ) : (
            <div className="debts-list">
              {debts.map((debt, index) => {
                const fromMember = getMember(groupId, debt.from);
                const toMember = getMember(groupId, debt.to);
                
                return (
                  <div key={index} className="debt-card">
                    <div className="debt-info">
                      <div className="debt-participants">
                        <span className="debtor">{fromMember?.name}</span>
                        <span className="debt-arrow">→</span>
                        <span className="creditor">{toMember?.name}</span>
                      </div>
                      <div className="debt-amount">₹{debt.amount.toFixed(2)}</div>
                    </div>
                    <button 
                      className="settle-btn"
                      onClick={() => handleSettleClick(debt)}
                    >
                      Settle Up
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settlement History */}
        <div className="settlement-history">
          <h3>Settlement History</h3>
          
          {getSettlementHistory().length === 0 ? (
            <div className="no-settlements">
              <p>No settlements recorded yet.</p>
            </div>
          ) : (
            <div className="settlements-list">
              {getSettlementHistory()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((settlement) => {
                  const fromMember = getMember(groupId, settlement.fromMemberId);
                  const toMember = getMember(groupId, settlement.toMemberId);
                  const date = new Date(settlement.date).toLocaleDateString();
                  
                  return (
                    <div key={settlement.id} className="settlement-card">
                      <div className="settlement-info">
                        <div className="settlement-participants">
                          <span className="settlement-from">{fromMember?.name}</span>
                          <span className="settlement-arrow">→</span>
                          <span className="settlement-to">{toMember?.name}</span>
                        </div>
                        <div className="settlement-details">
                          <span className="settlement-amount">₹{settlement.amount.toFixed(2)}</span>
                          <span className="settlement-date">{date}</span>
                        </div>
                      </div>
                      {settlement.description && (
                        <div className="settlement-description">{settlement.description}</div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Settlement Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="settle-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Settle Debt</h3>
              <button className="modal-close" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-content">
              {selectedDebt && (
                <>
                  <div className="settlement-summary">
                    <p>
                      <strong>{getMember(groupId, selectedDebt.from)?.name}</strong> owes{' '}
                      <strong>{getMember(groupId, selectedDebt.to)?.name}</strong>{' '}
                      <span className="debt-amount">₹{selectedDebt.amount.toFixed(2)}</span>
                    </p>
                  </div>
                  
                  <div className="form-control">
                    <label htmlFor="settlementAmount">Settlement Amount</label>
                    <input
                      type="number"
                      id="settlementAmount"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      max={selectedDebt.amount}
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label htmlFor="description">Description (Optional)</label>
                    <input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Cash payment, Bank transfer"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSettleConfirm}
                disabled={!settlementAmount || parseFloat(settlementAmount) <= 0}
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettleUp;