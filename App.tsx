import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NewSubmission } from './components/NewSubmission';
import { ReviewDetail } from './components/ReviewDetail';
import { AdminSettings } from './components/AdminSettings';
import { UserGuide } from './components/UserGuide';
import { MOCK_USERS, MOCK_CONTRACTS } from './constants';
import { ContractData, UserRole } from './types';
import { Mail, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState(MOCK_USERS[0]);
  const [view, setView] = useState('dashboard');
  const [contracts, setContracts] = useState<ContractData[]>(MOCK_CONTRACTS);
  const [selectedContract, setSelectedContract] = useState<ContractData | null>(null);
  const [editingContract, setEditingContract] = useState<ContractData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState<{to: string, subject: string} | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for simulated emails
  useEffect(() => {
    const handleEmailEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNotification({ to: detail.to, subject: detail.subject });
      // Auto dismiss
      setTimeout(() => setNotification(null), 5000);
    };

    window.addEventListener('email-sent', handleEmailEvent);
    return () => window.removeEventListener('email-sent', handleEmailEvent);
  }, []);

  const handleContractSubmit = (contract: ContractData) => {
    if (editingContract) {
      // Update existing
      setContracts(prev => prev.map(c => c.id === contract.id ? contract : c));
      setEditingContract(null);
    } else {
      // Create new
      setContracts(prev => [contract, ...prev]);
    }
    setView('dashboard');
  };

  const handleContractUpdate = (updated: ContractData) => {
    // 1. Update the main list
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    
    // 2. CRITICAL FIX: Update the selected contract if it's currently open
    // This ensures comments and approvals appear immediately without closing/reopening
    if (selectedContract && selectedContract.id === updated.id) {
      setSelectedContract(updated);
    }
  };

  const handleViewContract = (contract: ContractData) => {
    // Mark as read when viewing
    if (contract.hasUnreadComments) {
      const updated = { ...contract, hasUnreadComments: false };
      handleContractUpdate(updated);
      setSelectedContract(updated);
    } else {
      setSelectedContract(contract);
    }
  };

  const handleEditContract = () => {
    if (selectedContract) {
      setEditingContract(selectedContract);
      setSelectedContract(null); // Close modal
      setView('new');
    }
  };

  const handleViewChange = (v: string) => {
    setView(v);
    setSelectedContract(null);
    setEditingContract(null); // Reset edit state if navigating away
  };

  const renderContent = () => {
    if (selectedContract) {
      return (
        <ReviewDetail 
          contract={selectedContract} 
          currentUser={user} 
          onUpdate={handleContractUpdate}
          onClose={() => setSelectedContract(null)}
          onEdit={handleEditContract}
        />
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            contracts={contracts} 
            onViewContract={handleViewContract} 
            currentUser={user}
          />
        );
      
      case 'new':
        return (
          <NewSubmission 
            user={user} 
            initialData={editingContract}
            onSubmit={handleContractSubmit} 
            onCancel={() => {
              setView('dashboard');
              setEditingContract(null);
            }} 
          />
        );

      case 'admin':
        return <AdminSettings currentUser={user} />;
        
      case 'guide':
        return <UserGuide />;

      default:
        return <div>Not found</div>;
    }
  };

  return (
    <Layout 
      user={user} 
      currentView={view} 
      onChangeView={handleViewChange} 
      onChangeUser={(id) => setUser(MOCK_USERS.find(u => u.id === id) || MOCK_USERS[0])}
      onChangeRole={(role) => setUser({ ...user, role })}
      allUsers={MOCK_USERS}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
    >
      {renderContent()}

      {/* Email Simulation Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
          <div className="bg-white dark:bg-slate-800 border-l-4 border-blue-500 rounded shadow-2xl p-4 max-w-sm flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Email Notification Sent</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400"><span className="font-semibold">To:</span> {notification.to}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-1">{notification.subject}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;