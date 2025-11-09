import React, { useState } from 'react';
import GroupList from './GroupList.jsx';
import CreateGroup from './CreateGroup.jsx';
import GroupDetails from './GroupDetails.jsx';
import AddGroupExpense from './AddGroupExpense.jsx';

const Groups = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedGroupId(null);
  };

  const handleCreateGroup = () => {
    setCurrentView('create');
  };

  const handleGroupCreated = () => {
    setCurrentView('list');
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
    setCurrentView('details');
  };

  const handleAddExpense = () => {
    setCurrentView('addExpense');
  };

  const handleExpenseAdded = () => {
    setCurrentView('details');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <GroupList 
            onGroupSelect={handleGroupSelect}
            onCreateGroup={handleCreateGroup}
          />
        );
      
      case 'create':
        return (
          <CreateGroup 
            onBack={handleBackToList}
            onGroupCreated={handleGroupCreated}
          />
        );
      
      case 'details':
        return (
          <GroupDetails 
            groupId={selectedGroupId}
            onBack={handleBackToList}
            onAddExpense={handleAddExpense}
          />
        );
      
      case 'addExpense':
        return (
          <AddGroupExpense 
            groupId={selectedGroupId}
            onBack={() => setCurrentView('details')}
            onExpenseAdded={handleExpenseAdded}
          />
        );
      
      default:
        return <GroupList onGroupSelect={handleGroupSelect} onCreateGroup={handleCreateGroup} />;
    }
  };

  return (
    <div className="groups-section">
      {renderCurrentView()}
    </div>
  );
};

export default Groups;