import React, { useState } from 'react';
import { useGroups, calculateGroupDebts } from '../context/GroupContext.jsx';

const GroupDetails = ({ groupId, onBack, onAddExpense, onSettleUp }) => {
  const { getGroup, getMember } = useGroups();
  const [activeTab, setActiveTab] = useState('expenses');
  
  const group = getGroup(groupId);
  
  // Debug: Check if onSettleUp is passed
  console.log('GroupDetails onSettleUp:', typeof onSettleUp);
  
  if (!group) {
    return (
      <div className="group-not-found">
        <h2>Group not found</h2>
        <button className="btn btn-primary" onClick={onBack}>
          Back to Groups
        </button>
      </div>
    );
  }

  const debts = calculateGroupDebts(group);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const ExpensesTab = () => (
    <div className="expenses-tab">
      <div className="expenses-header">
        <h3>Group Expenses</h3>
        <div className="expenses-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              console.log('Settle Up button clicked');
              alert('Button works! Now testing navigation...'); 
              if (onSettleUp) {
                console.log('Calling onSettleUp...');
                onSettleUp();
              } else {
                console.error('onSettleUp is not provided');
                alert('Error: onSettleUp function not provided');
              }
            }}
          >
            Settle Up
          </button>
          <button className="btn btn-primary" onClick={onAddExpense}>
            + Add Expense
          </button>
        </div>
      </div>

      {group.expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h4>No Expenses Yet</h4>
          <p>Start by adding your first group expense</p>
        </div>
      ) : (
        <div className="expenses-list">
          {group.expenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-main">
                <div className="expense-info">
                  <h4>{expense.description}</h4>
                  <div className="expense-meta">
                    <span>Paid by {getMember(groupId, expense.paidBy)?.name}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                    <span>•</span>
                    <span className="expense-category">{expense.category}</span>
                  </div>
                </div>
                <div className="expense-amount">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
              
              <div className="expense-splits">
                <h5>Split Details:</h5>
                <div className="splits-list">
                  {expense.splits.map((split, index) => (
                    <div key={index} className="split-item">
                      <span>{getMember(groupId, split.memberId)?.name}</span>
                      <span>{formatCurrency(split.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const BalancesTab = () => (
    <div className="balances-tab">
      <div className="balances-header">
        <h3>Balances & Settlements</h3>
        {debts.length > 0 && (
          <button 
            className="btn btn-primary" 
            onClick={() => {
              console.log('Balances Settle Up button clicked');
              if (onSettleUp) {
                onSettleUp();
              } else {
                console.error('onSettleUp is not provided in balances');
              }
            }}
          >
            Settle Up
          </button>
        )}
      </div>
      
      {debts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h4>All Settled Up!</h4>
          <p>Everyone is even. No outstanding debts.</p>
        </div>
      ) : (
        <div className="debts-list">
          {debts.map((debt, index) => (
            <div key={index} className="debt-item">
              <div className="debt-info">
                <span className="debtor">{getMember(groupId, debt.from)?.name}</span>
                <span className="debt-arrow">owes</span>
                <span className="creditor">{getMember(groupId, debt.to)?.name}</span>
              </div>
              <div className="debt-amount">
                {formatCurrency(debt.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const MembersTab = () => (
    <div className="members-tab">
      <h3>Group Members ({group.members.length})</h3>
      
      <div className="members-list">
        {group.members.map(member => (
          <div key={member.id} className="member-item">
            <div className="member-avatar">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="member-info">
              <h4>{member.name}</h4>
              {member.email && <p>{member.email}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="group-details">
      <div className="group-details-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <div className="group-info">
          <h1>{group.name}</h1>
          {group.description && <p>{group.description}</p>}
        </div>
      </div>

      <div className="group-summary">
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <div className="summary-value">{formatCurrency(group.totalExpense)}</div>
        </div>
        <div className="summary-card">
          <h3>Number of Expenses</h3>
          <div className="summary-value">{group.expenses.length}</div>
        </div>
        <div className="summary-card">
          <h3>Outstanding Debts</h3>
          <div className="summary-value">{debts.length}</div>
        </div>
      </div>

      <div className="group-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </button>
          <button 
            className={`tab-button ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
          >
            Balances
          </button>
          <button 
            className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'expenses' && <ExpensesTab />}
          {activeTab === 'balances' && <BalancesTab />}
          {activeTab === 'members' && <MembersTab />}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;