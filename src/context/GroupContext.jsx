import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GroupContext = createContext();

const groupReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GROUPS':
      return {
        ...state,
        groups: action.payload
      };
    
    case 'ADD_GROUP':
      const newGroup = {
        id: Date.now().toString(),
        name: action.payload.name,
        description: action.payload.description,
        members: action.payload.members,
        expenses: [],
        createdAt: new Date().toISOString(),
        totalExpense: 0
      };
      return {
        ...state,
        groups: [...state.groups, newGroup]
      };
    
    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload)
      };
    
    case 'ADD_MEMBER':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, members: [...group.members, action.payload.member] }
            : group
        )
      };
    
    case 'REMOVE_MEMBER':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { 
                ...group, 
                members: group.members.filter(member => member.id !== action.payload.memberId) 
              }
            : group
        )
      };
    
    case 'ADD_GROUP_EXPENSE':
      const updatedGroups = state.groups.map(group => {
        if (group.id === action.payload.groupId) {
          const newExpense = {
            id: Date.now().toString(),
            description: action.payload.description,
            amount: action.payload.amount,
            paidBy: action.payload.paidBy,
            splitType: action.payload.splitType,
            splits: action.payload.splits,
            date: action.payload.date || new Date().toISOString(),
            category: action.payload.category || 'General'
          };
          
          const updatedExpenses = [...group.expenses, newExpense];
          const totalExpense = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
          
          return {
            ...group,
            expenses: updatedExpenses,
            totalExpense
          };
        }
        return group;
      });
      
      return {
        ...state,
        groups: updatedGroups
      };
    
    case 'DELETE_GROUP_EXPENSE':
      return {
        ...state,
        groups: state.groups.map(group => {
          if (group.id === action.payload.groupId) {
            const updatedExpenses = group.expenses.filter(exp => exp.id !== action.payload.expenseId);
            const totalExpense = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            return {
              ...group,
              expenses: updatedExpenses,
              totalExpense
            };
          }
          return group;
        })
      };
    
    case 'SETTLE_DEBT':
      return {
        ...state,
        groups: state.groups.map(group => {
          if (group.id === action.payload.groupId) {
            const settlementExpense = {
              id: Date.now().toString(),
              description: `Settlement: ${action.payload.from} → ${action.payload.to}`,
              amount: action.payload.amount,
              paidBy: action.payload.from,
              splitType: 'exact',
              splits: [
                { memberId: action.payload.from, amount: action.payload.amount },
                { memberId: action.payload.to, amount: -action.payload.amount }
              ],
              date: new Date().toISOString(),
              category: 'Settlement',
              isSettlement: true
            };
            
            return {
              ...group,
              expenses: [...group.expenses, settlementExpense]
            };
          }
          return group;
        })
      };
    
    default:
      return state;
  }
};

// Split calculation utilities
export const calculateSplits = (amount, members, splitType, customSplits = []) => {
  switch (splitType) {
    case 'equal':
      const equalAmount = amount / members.length;
      return members.map(member => ({
        memberId: member.id,
        amount: equalAmount
      }));
    
    case 'exact':
      return customSplits;
    
    case 'percentage':
      return customSplits.map(split => ({
        ...split,
        amount: (amount * split.percentage) / 100
      }));
    
    default:
      return [];
  }
};

// Calculate debts between all members
export const calculateGroupDebts = (group) => {
  const memberBalances = {};
  
  // Initialize balances
  group.members.forEach(member => {
    memberBalances[member.id] = 0;
  });
  
  // Calculate balances from all expenses
  group.expenses.forEach(expense => {
    // Add payment to payer
    memberBalances[expense.paidBy] += expense.amount;
    
    // Subtract splits from members
    expense.splits.forEach(split => {
      memberBalances[split.memberId] -= split.amount;
    });
  });
  
  // Create debt relationships
  const debts = [];
  const creditors = [];
  const debtors = [];
  
  Object.entries(memberBalances).forEach(([memberId, balance]) => {
    if (balance > 0.01) {
      creditors.push({ memberId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ memberId, amount: Math.abs(balance) });
    }
  });
  
  // Simplify debts using greedy algorithm
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const settleAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settleAmount > 0.01) {
      debts.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: settleAmount
      });
    }
    
    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;
    
    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }
  
  return debts;
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(groupReducer, {
    groups: []
  });
  
  // Load groups from localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem('expenseGroups');
    if (savedGroups) {
      dispatch({ type: 'SET_GROUPS', payload: JSON.parse(savedGroups) });
    }
  }, []);
  
  // Save groups to localStorage
  useEffect(() => {
    localStorage.setItem('expenseGroups', JSON.stringify(state.groups));
  }, [state.groups]);
  
  const addGroup = (groupData) => {
    dispatch({ type: 'ADD_GROUP', payload: groupData });
  };
  
  const deleteGroup = (groupId) => {
    dispatch({ type: 'DELETE_GROUP', payload: groupId });
  };
  
  const addMember = (groupId, member) => {
    dispatch({ type: 'ADD_MEMBER', payload: { groupId, member } });
  };
  
  const removeMember = (groupId, memberId) => {
    dispatch({ type: 'REMOVE_MEMBER', payload: { groupId, memberId } });
  };
  
  const addGroupExpense = (groupId, expenseData) => {
    dispatch({ type: 'ADD_GROUP_EXPENSE', payload: { groupId, ...expenseData } });
  };
  
  const deleteGroupExpense = (groupId, expenseId) => {
    dispatch({ type: 'DELETE_GROUP_EXPENSE', payload: { groupId, expenseId } });
  };
  
  const settleDebt = (groupId, from, to, amount) => {
    dispatch({ type: 'SETTLE_DEBT', payload: { groupId, from, to, amount } });
  };
  
  const getGroup = (groupId) => {
    return state.groups.find(group => group.id === groupId);
  };
  
  const getMember = (groupId, memberId) => {
    const group = getGroup(groupId);
    return group ? group.members.find(member => member.id === memberId) : null;
  };
  
  return (
    <GroupContext.Provider value={{
      groups: state.groups,
      addGroup,
      deleteGroup,
      addMember,
      removeMember,
      addGroupExpense,
      deleteGroupExpense,
      settleDebt,
      getGroup,
      getMember,
      calculateGroupDebts
    }}>
      {children}
    </GroupContext.Provider>
  );
};