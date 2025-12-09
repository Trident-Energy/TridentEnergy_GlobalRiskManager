
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LayoutDashboard, BarChart3, Settings, Search, Plus, User as UserIcon, LogOut, XCircle, Download, RefreshCw, AlertCircle, AlertTriangle, Moon, Sun, Grid2x2, Columns, CheckSquare, Square, EyeOff, Shield, BookOpen } from 'lucide-react';
import RiskDashboard from './components/RiskDashboard';
import RiskList from './components/RiskList';
import RiskDetail from './components/RiskDetail';
import RiskCategoryDashboard from './components/RiskCategoryDashboard';
import UserManagement from './components/UserManagement';
import AdminBulkActions from './components/AdminBulkActions';
import UserGuide from './components/UserGuide';
import { MOCK_RISKS, MOCK_ACTIONS, MOCK_COMMENTS, COUNTRIES, MOCK_USERS, GROUPS, calculateRiskScore, getRiskLevel, AVAILABLE_COLUMNS } from './constants';
import { Country, Risk, ActionPlan, Comment, User, RiskStatus, RiskLevel, AuditLogEntry, UserRole, EscalationLevel, ScoreSnapshot, SortOption } from './types';
import { CellFilter } from './components/RiskHeatMap';

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-4 rounded-t-lg ${
      active 
        ? 'border-white text-white bg-white/10' 
        : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);

const App = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'categoryDashboard' | 'reports' | 'admin' | 'help'>('dashboard');
  const [selectedCountry, setSelectedCountry] = useState<Country | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filters State
  const [filterOwner, setFilterOwner] = useState('ALL');
  const [filterRegister, setFilterRegister] = useState('ALL');
  const [filterFunction, setFilterFunction] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterScore, setFilterScore] = useState('ALL');
  const [filterLastReviewer, setFilterLastReviewer] = useState('ALL');
  
  // Sorting State
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');

  // Quick Filter State (Dashboard Interaction)
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'MY_RISKS' | 'COLLAB' | 'ESCALATED'>('ALL');
  const [dashboardHeatMapFilter, setDashboardHeatMapFilter] = useState<CellFilter | null>(null);

  // Column Visibility State
  // Default visible columns: all except 'id'
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.map(c => c.key).filter(key => key !== 'id')
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data State
  const [risks, setRisks] = useState<Risk[]>(MOCK_RISKS);
  const [actions, setActions] = useState<ActionPlan[]>(MOCK_ACTIONS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  // Current User State (Initialized with Admin user)
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); 
  
  // Selected Risk for Detail View
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Admin Confirmation Modal State
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Click outside to close column menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) 
        ? prev.filter(c => c !== key) 
        : [...prev, key]
    );
  };

  // Derived Lists for Dropdowns
  const uniqueOwners = useMemo(() => Array.from(new Set(risks.map(r => r.owner))).sort(), [risks]);
  const uniqueRegisters = useMemo(() => Array.from(new Set(risks.map(r => r.register))).sort(), [risks]);
  const uniqueFunctions = useMemo(() => Array.from(new Set(risks.map(r => r.functionArea))).sort(), [risks]);
  const uniqueLastReviewers = useMemo(() => Array.from(new Set(risks.map(r => r.lastReviewer))).filter(Boolean).sort(), [risks]);

  // 1. Authorized Risks (Permissions Only)
  // This list contains everything the user is ALLOWED to see, ignoring UI filters (search, country, etc.)
  // Used for global stats and activity feed.
  const authorizedRisks = useMemo(() => {
    return risks.filter(r => {
      // PERMISSION CHECK
      if (currentUser.role === 'RMIA') {
        return true; // Admin sees all
      } else {
         // Everyone else (including Country Manager) sees: Own OR Collaborator OR Escalated To Them
         // The previous rule allowing Country Managers to see all risks for their country has been removed.
         const isOwner = r.owner === currentUser.name;
         const isCollaborator = r.collaborators.includes(currentUser.name);
         const isEscalated = (r.escalations || []).some(e => e.userId === currentUser.id);
         
         return isOwner || isCollaborator || isEscalated;
      }
    });
  }, [risks, currentUser]);

  // 2. Dashboard Risks (Filtered by UI controls)
  // This list applies the user's current view filters (Search, Country Select, Dropdowns)
  const dashboardRisks = useMemo(() => {
    return authorizedRisks.filter(r => {
      // Country Filter
      const matchCountry = selectedCountry === 'ALL' || r.country === selectedCountry;
      
      // Search Text
      const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Dropdown Filters
      const matchOwner = filterOwner === 'ALL' || r.owner === filterOwner;
      const matchRegister = filterRegister === 'ALL' || r.register === filterRegister;
      const matchFunction = filterFunction === 'ALL' || r.functionArea === filterFunction;
      const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
      const matchLastReviewer = filterLastReviewer === 'ALL' || r.lastReviewer === filterLastReviewer;
      
      // Score Filter
      let matchScore = true;
      if (filterScore !== 'ALL') {
         const score = calculateRiskScore(r.residualImpact, r.residualLikelihood);
         const level = getRiskLevel(score, r.residualImpact).label;
         matchScore = level === filterScore;
      }

      return matchCountry && matchSearch && matchOwner && matchRegister && matchFunction && matchStatus && matchLastReviewer && matchScore;
    });
  }, [authorizedRisks, selectedCountry, searchQuery, filterOwner, filterRegister, filterFunction, filterStatus, filterLastReviewer, filterScore]);

  // 3. List Risks (Context for the Grid)
  const listRisks = useMemo(() => {
    return dashboardRisks.filter(r => {
      // Dashboard HeatMap Filter
      if (dashboardHeatMapFilter) {
        if (dashboardHeatMapFilter.type === 'inherent') {
           if (r.inherentImpact !== dashboardHeatMapFilter.impact || r.inherentLikelihood !== dashboardHeatMapFilter.likelihood) {
             return false;
           }
        } else {
           if (r.residualImpact !== dashboardHeatMapFilter.impact || r.residualLikelihood !== dashboardHeatMapFilter.likelihood) {
             return false;
           }
        }
      }

      if (quickFilter === 'MY_RISKS') {
        return r.owner === currentUser.name;
      }
      if (quickFilter === 'COLLAB') {
        return r.collaborators.includes(currentUser.name);
      }
      if (quickFilter === 'ESCALATED') {
        return r.escalations?.some(e => e.userId === currentUser.id);
      }
      return true;
    });
  }, [dashboardRisks, quickFilter, currentUser, dashboardHeatMapFilter]);

  // Calculate Escalations for the DASHBOARD context
  const myEscalationsCount = useMemo(() => {
    return dashboardRisks.filter(r => 
      r.escalations?.some(e => e.userId === currentUser.id)
    ).length;
  }, [dashboardRisks, currentUser]);

  // --- Helpers for Audit Logging ---
  const addAuditLog = (riskId: string, action: string, details: string) => {
    const timestamp = new Date().toISOString();
    const newLog: AuditLogEntry = {
      id: `H-${Date.now()}-${Math.random()}`,
      date: timestamp,
      user: currentUser.name,
      action: action,
      details: details
    };

    setRisks(prevRisks => prevRisks.map(r => {
      if (r.id === riskId) {
        return {
          ...r,
          history: [newLog, ...(r.history || [])]
        };
      }
      return r;
    }));

    // Manually update selectedRisk to trigger immediate UI feedback in RiskDetail
    if (selectedRisk && selectedRisk.id === riskId) {
       setSelectedRisk(prev => prev ? ({
          ...prev,
          history: [newLog, ...(prev.history || [])]
       }) : null);
    }
  };

  // --- Handlers ---

  const handleSaveRisk = (updatedRisk: Risk) => {
    const exists = risks.find(r => r.id === updatedRisk.id);
    if (exists) {
      setRisks(risks.map(r => r.id === updatedRisk.id ? updatedRisk : r));
    } else {
      setRisks([updatedRisk, ...risks]);
    }
    setIsDetailOpen(false);
  };
  
  const handleDeleteRisk = (riskId: string) => {
    setRisks(risks.filter(r => r.id !== riskId));
    setIsDetailOpen(false);
  };

  // Actions
  const handleAddAction = (action: ActionPlan) => {
    setActions([...actions, action]);
    addAuditLog(action.riskId, 'Action Plan Added', `Action '${action.title}' created.`);
  };

  const handleUpdateAction = (updatedAction: ActionPlan) => {
    const oldAction = actions.find(a => a.id === updatedAction.id);
    setActions(actions.map(a => a.id === updatedAction.id ? updatedAction : a));
    
    if (oldAction) {
       const changes = [];
       if (oldAction.title !== updatedAction.title) changes.push('Title');
       if (oldAction.status !== updatedAction.status) changes.push(`Status to '${updatedAction.status}'`);
       if (oldAction.dueDate !== updatedAction.dueDate) changes.push(`Due Date to '${updatedAction.dueDate}'`);
       if (oldAction.owner !== updatedAction.owner) changes.push(`Owner to '${updatedAction.owner}'`);
       
       const details = changes.length > 0 ? `Updated: ${changes.join(', ')}` : `Action '${updatedAction.title}' updated.`;
       addAuditLog(updatedAction.riskId, 'Action Plan Updated', details);
    }
  };

  const handleDeleteAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    setActions(actions.filter(a => a.id !== actionId));
    if (action) {
      addAuditLog(action.riskId, 'Action Plan Deleted', `Action '${action.title}' deleted.`);
    }
  };

  // Comments
  const handleAddComment = (riskId: string, text: string, parentId?: string) => {
    const newComment: Comment = {
      id: `C-${Date.now()}`,
      riskId,
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString(),
      text,
      parentId // Optional parent ID for threading
    };
    setComments([...comments, newComment]);
    addAuditLog(riskId, 'Comment Added', parentId ? 'Reply posted to thread' : 'New comment thread started');
  };

  const handleDeleteComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    
    // Delete comment and its children
    const commentsToDelete = new Set<string>([commentId]);
    let added = true;
    while(added) {
      added = false;
      comments.forEach(c => {
        if(c.parentId && commentsToDelete.has(c.parentId) && !commentsToDelete.has(c.id)) {
          commentsToDelete.add(c.id);
          added = true;
        }
      });
    }

    setComments(comments.filter(c => !commentsToDelete.has(c.id)));
    
    if (comment) {
      addAuditLog(comment.riskId, 'Comment Deleted', `Comment by ${comment.userName} deleted.`);
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const currentLikes = c.likes || [];
        const userId = currentUser.id;
        if (currentLikes.includes(userId)) {
          // Unlike
          return { ...c, likes: currentLikes.filter(id => id !== userId) };
        } else {
          // Like
          return { ...c, likes: [...currentLikes, userId] };
        }
      }
      return c;
    }));
  };

  // User Management Handlers
  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert("You cannot delete yourself.");
      return;
    }
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  // Admin Bulk Actions Handlers
  const handleBulkEscalation = (country: Country, register: string, level: EscalationLevel, userId: string) => {
     const user = users.find(u => u.id === userId);
     if (!user) return;

     setRisks(prev => prev.map(risk => {
       // Filter by Country
       if (risk.country !== country) return risk;

       // Filter by Register
       if (register !== 'ALL' && risk.register !== register) return risk;

       // Check if already escalated to this level/user combination
       const existingEscalation = risk.escalations?.find(e => e.level === level && e.userId === userId);
       if (existingEscalation) return risk;

       // Create new history entry
       const timestamp = new Date().toISOString();
       const logEntry: AuditLogEntry = {
          id: `H-${Date.now()}-${Math.random()}`,
          date: timestamp,
          user: currentUser.name,
          action: 'Bulk Escalation',
          details: `Assigned ${user.name} as ${level} via bulk action`
       };

       return {
         ...risk,
         escalations: [...(risk.escalations || []), {
            level,
            userId: user.id,
            userName: user.name,
            date: timestamp
         }],
         history: [logEntry, ...(risk.history || [])]
       };
     }));
     alert("Bulk escalation assignment completed.");
  };

  const handleBulkTransferOwnership = (fromUserId: string, toUserId: string) => {
     const fromUser = users.find(u => u.id === fromUserId);
     const toUser = users.find(u => u.id === toUserId);
     if (!fromUser || !toUser) return;

     setRisks(prev => prev.map(risk => {
       if (risk.owner !== fromUser.name) return risk;

       const timestamp = new Date().toISOString();
       const logEntry: AuditLogEntry = {
          id: `H-${Date.now()}-${Math.random()}`,
          date: timestamp,
          user: currentUser.name,
          action: 'Owner Changed (Bulk)',
          details: `From '${fromUser.name}' to '${toUser.name}'`
       };

       return {
         ...risk,
         owner: toUser.name,
         history: [logEntry, ...(risk.history || [])]
       };
     }));
     alert("Bulk ownership transfer completed.");
  };

  const handleBulkAddCollaborator = (country: Country, register: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setRisks(prev => prev.map(risk => {
       if (risk.country !== country) return risk;
       
       // Filter by register if specific one selected
       if (register !== 'ALL' && risk.register !== register) return risk;
       
       if (risk.collaborators.includes(user.name)) return risk; // Already exists

       const timestamp = new Date().toISOString();
       const logEntry: AuditLogEntry = {
          id: `H-${Date.now()}-${Math.random()}`,
          date: timestamp,
          user: currentUser.name,
          action: 'Collaborator Added (Bulk)',
          details: `Added '${user.name}' as collaborator`
       };

       return {
         ...risk,
         collaborators: [...risk.collaborators, user.name],
         history: [logEntry, ...(risk.history || [])]
       };
    }));
    alert("Bulk collaborator assignment completed.");
  };

  const handleResetRiskStatus = () => {
    setShowResetConfirm(true);
  };

  // UPDATED: Execute Reset and Snapshots current scores for Trend Analysis (History of 4 quarters)
  const executeReset = () => {
    // Calculate current quarter string
    const now = new Date();
    const q = Math.floor((now.getMonth() + 3) / 3);
    const quarterLabel = `Q${q} ${now.getFullYear()}`;

    setRisks(risks.map(r => {
      // 1. Calculate current residual score
      const currentScore = calculateRiskScore(r.residualImpact, r.residualLikelihood);
      
      // 2. Create snapshot object
      const snapshot: ScoreSnapshot = {
        date: now.toISOString().split('T')[0],
        score: currentScore,
        quarter: quarterLabel
      };

      // 3. Manage history array (Limit to 4)
      // Add new snapshot to the BEGINNING of array
      const newHistory = [snapshot, ...(r.historicalScores || [])].slice(0, 4);

      return {
        ...r,
        status: RiskStatus.OPEN, // Reset Status
        previousScore: currentScore, // Keep simple previousScore for immediate arrow logic
        historicalScores: newHistory // Capture full history for dashboards
      };
    }));
    setShowResetConfirm(false);
  };

  const handleExport = () => {
    const headers = [
      'Risk ID', 'Country', 'Risk Register', 'Title', 'Risk Description', 'Risk Owner', 
      'Function/Area', 'Risk Category', 'Principal Risk', 
      'Inherent Impact', 'Inherent Likelihood', 'Inherent Score', 'Inherent Level',
      'Controls In Place', 'Controls Rating', 
      'Residual Impact', 'Residual Likelihood', 'Residual Score', 'Residual Level',
      'Status', 'Last Review Date', 'Last Reviewer'
    ];

    const csvContent = listRisks.map(risk => {
      const iScore = calculateRiskScore(risk.inherentImpact, risk.inherentLikelihood);
      const iLevel = getRiskLevel(iScore, risk.inherentImpact).label;
      const rScore = calculateRiskScore(risk.residualImpact, risk.residualLikelihood);
      const rLevel = getRiskLevel(rScore, risk.residualImpact).label;

      const row = [
        risk.id,
        risk.country,
        risk.register,
        risk.title,
        risk.description,
        risk.owner,
        risk.functionArea,
        risk.category,
        risk.groupPrincipalRisk,
        risk.inherentImpact,
        risk.inherentLikelihood,
        iScore,
        iLevel,
        risk.controlsText,
        risk.controlsRating,
        risk.residualImpact,
        risk.residualLikelihood,
        rScore,
        rLevel,
        risk.status,
        risk.lastReviewDate,
        risk.lastReviewer
      ];

      return row.map(field => {
        const stringField = String(field || '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',');
    });

    const csvString = '\uFEFF' + [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Risk_Register_Export_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearFilters = () => {
    setFilterOwner('ALL');
    setFilterRegister('ALL');
    setFilterFunction('ALL');
    setFilterStatus('ALL');
    setFilterScore('ALL');
    setFilterLastReviewer('ALL');
    setSortOrder('newest');
    setSearchQuery('');
    setQuickFilter('ALL');
    setDashboardHeatMapFilter(null);
  };

  const hiddenColumnsCount = AVAILABLE_COLUMNS.length - visibleColumns.length;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans w-full max-w-full overflow-hidden transition-colors duration-200">
      
      {/* Main Header + Nav */}
      <header className="bg-[#283C50] border-b border-[#1f3041] shadow-md z-10 shrink-0 transition-colors">
        <div className="w-full px-6">
          <div className="flex items-center justify-between py-4">
             <div className="flex items-center gap-4">
                <img src="https://www.trident-energy.com/app/themes/trident-energy/dist/images/favicon.png?id=2e0b14e50770eab630923c46b052a708" alt="Logo" className="w-8 h-8 object-contain" />
                <h1 className="font-bold text-xl tracking-tight text-white">Risk Management Tool</h1>
             </div>
             
             <div className="flex items-center gap-4">

               {/* User Switcher for Testing */}
               <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/10 mr-2">
                  <div className="p-1.5 bg-white/10 rounded-md">
                    <UserIcon size={14} className="text-white" />
                  </div>
                  <select
                    value={currentUser.id}
                    onChange={(e) => {
                      const selectedUser = users.find(u => u.id === e.target.value);
                      if (selectedUser) setCurrentUser(selectedUser);
                    }}
                    className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer border-none focus:ring-0 py-1 pr-1 max-w-[100px] sm:max-w-none"
                    title="Switch User Identity"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="text-slate-800">{u.name}</option>
                    ))}
                  </select>
               </div>
               
               {/* Role Switcher for Testing */}
               <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/10 mr-2">
                  <div className="p-1.5 bg-white/10 rounded-md">
                    <Shield size={14} className="text-white" />
                  </div>
                  <select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                    className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer border-none focus:ring-0 py-1 pr-1"
                    title="Switch user role for testing permissions"
                  >
                    <option value="Manager" className="text-slate-800">Manager</option>
                    <option value="RMIA" className="text-slate-800">RMIA (Admin)</option>
                    <option value="Functional Manager" className="text-slate-800">Functional Manager</option>
                    <option value="TEML Functional" className="text-slate-800">TEML Functional</option>
                    <option value="Country Manager" className="text-slate-800">Country Manager</option>
                    <option value="TEML Leadership Team" className="text-slate-800">TEML Leadership</option>
                    <option value="CEO" className="text-slate-800">CEO</option>
                  </select>
               </div>

               {/* Dark Mode Toggle */}
               <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
               >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>

               <div className="flex items-center gap-3 px-4 py-1.5 bg-black/20 rounded-full border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                    <UserIcon size={16} />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white leading-none">{currentUser.name}</p>
                    <p className="text-xs text-slate-300 leading-none mt-1">{currentUser.role}</p>
                  </div>
               </div>
               <button className="text-slate-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"><LogOut size={20} /></button>
             </div>
          </div>

          {/* Horizontal Navigation */}
          <nav className="flex gap-2">
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              active={currentView === 'dashboard'} 
              onClick={() => setCurrentView('dashboard')} 
            />
            <NavItem 
              icon={<Grid2x2 size={18} />} 
              label="Risk Overview" 
              active={currentView === 'categoryDashboard'} 
              onClick={() => setCurrentView('categoryDashboard')} 
            />
            <NavItem 
              icon={<BarChart3 size={18} />} 
              label="Reports" 
              active={currentView === 'reports'} 
              onClick={() => setCurrentView('reports')} 
            />
             <NavItem 
              icon={<BookOpen size={18} />} 
              label="Help & Guide" 
              active={currentView === 'help'} 
              onClick={() => setCurrentView('help')} 
            />
            <NavItem 
              icon={<Settings size={18} />} 
              label="Admin" 
              active={currentView === 'admin'} 
              onClick={() => setCurrentView('admin')} 
            />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 w-full transition-colors">
        <div className="w-full px-6 py-6">
          
          {/* Shared Filter Strip (Dashboard + Category Dashboard) - ADDED RELATIVE Z-30 */}
          {(currentView === 'dashboard' || currentView === 'categoryDashboard') && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 mb-6 transition-colors relative z-30">
              
              {/* Top Row: Countries + Search + New Button */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Country Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
                   <button 
                      onClick={() => setSelectedCountry('ALL')}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCountry === 'ALL' ? 'bg-[#283C50] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                    >
                      All Locations
                    </button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    {COUNTRIES.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => setSelectedCountry(c.code)}
                        className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[60px] border ${selectedCountry === c.code ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:ring-blue-800' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                         <img 
                          src={c.flagUrl} 
                          alt={c.label} 
                          className={`w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm transition-transform ${selectedCountry === c.code ? 'scale-110' : 'group-hover:scale-105'}`} 
                        />
                         <span className={`text-[10px] font-bold ${selectedCountry === c.code ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{c.code}</span>
                      </button>
                    ))}
                </div>

                {/* Search & Actions */}
                <div className="flex flex-1 w-full md:w-auto gap-3 items-center justify-end">
                   <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search risks (ID, Title, Owner)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    
                    {/* Column Visibility Toggle */}
                    <div className="relative" ref={columnMenuRef}>
                        <button 
                          onClick={() => setShowColumnMenu(!showColumnMenu)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all whitespace-nowrap text-sm border relative ${
                             showColumnMenu 
                               ? 'bg-[#283C50] text-white border-[#1f3041]' 
                               : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Columns size={18} /> 
                          Customize Columns
                          {hiddenColumnsCount > 0 && (
                             <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                               {hiddenColumnsCount} hidden
                             </span>
                          )}
                        </button>
                        
                        {showColumnMenu && (
                          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[100] p-2 animate-fade-in max-h-96 overflow-y-auto">
                             <div className="flex justify-between items-center px-3 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Show / Hide Columns</span>
                                <button 
                                  onClick={() => setVisibleColumns(AVAILABLE_COLUMNS.map(c => c.key))}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  Reset All
                                </button>
                             </div>
                             {AVAILABLE_COLUMNS.map(col => (
                               <button 
                                 key={col.key}
                                 onClick={() => toggleColumn(col.key)}
                                 disabled={col.mandatory}
                                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                                   visibleColumns.includes(col.key) 
                                     ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                     : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-75'
                                 } ${col.mandatory ? 'opacity-50 cursor-not-allowed' : ''}`}
                               >
                                  {visibleColumns.includes(col.key) 
                                    ? <CheckSquare size={16} className="text-blue-600 dark:text-blue-400" />
                                    : <Square size={16} className="text-slate-300 dark:text-slate-600" />
                                  }
                                  <span className="font-bold">
                                    {col.label} {col.mandatory && <span className="text-[10px] text-slate-400 ml-1">(Required)</span>}
                                  </span>
                                  {!visibleColumns.includes(col.key) && <EyeOff size={14} className="ml-auto text-slate-300" />}
                               </button>
                             ))}
                          </div>
                        )}
                    </div>

                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-lg font-medium shadow-sm transition-all whitespace-nowrap text-sm"
                    >
                      <Download size={18} /> Export
                    </button>
                </div>
              </div>

              {/* Bottom Row: Detailed Dropdown Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {/* Risk Owner */}
                  <select 
                    value={filterOwner} 
                    onChange={(e) => setFilterOwner(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="ALL">All Risk Owners</option>
                    {uniqueOwners.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>

                  {/* Risk Register */}
                  <select 
                    value={filterRegister} 
                    onChange={(e) => setFilterRegister(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="ALL">All Risk Registers</option>
                    {uniqueRegisters.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  {/* Function/Area */}
                  <select 
                    value={filterFunction} 
                    onChange={(e) => setFilterFunction(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="ALL">All Functions</option>
                    {uniqueFunctions.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>

                  {/* Risk Status */}
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="ALL">All Risk Status</option>
                    {Object.values(RiskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {/* Residual Risk Score (Band) */}
                  <select 
                    value={filterScore} 
                    onChange={(e) => setFilterScore(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="ALL">Residual Score</option>
                    {Object.values(RiskLevel).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>

                   {/* Last Reviewer */}
                   <select 
                    value={filterLastReviewer} 
                    onChange={(e) => setFilterLastReviewer(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="ALL">Last Reviewers</option>
                    {uniqueLastReviewers.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  {/* Sort Order */}
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value as SortOption)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                  >
                    <option value="newest">Sort by: Newest First</option>
                    <option value="oldest">Sort by: Oldest First</option>
                    <option value="last_reviewed_newest">Sort by: Last Reviewed (Newest)</option>
                    <option value="last_reviewed_oldest">Sort by: Last Reviewed (Oldest)</option>
                    <option value="highest_residual">Sort by: Highest Residual Score</option>
                    <option value="lowest_risk">Sort by: Lowest Risk Score</option>
                    <option value="escalations">Sort by: Escalations</option>
                    <option value="ownership">Sort by: Ownership</option>
                    <option value="function">Sort by: Function / Department</option>
                    <option value="last_reviewer_az">Sort by: Last Reviewer (A–Z)</option>
                    <option value="last_reviewer_za">Sort by: Last Reviewer (Z–A)</option>
                    <option value="newest_comments">Sort by: Newest Comments</option>
                  </select>

                  {/* Clear Button */}
                  <button 
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900"
                  >
                    <XCircle size={16} /> Clear Filters
                  </button>
              </div>

            </div>
          )}

          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <div className="space-y-6 animate-fade-in w-full">
              {/* KPIs & Quick Filters */}
              <RiskDashboard 
                risks={dashboardRisks} 
                escalatedCount={myEscalationsCount}
                currentUser={currentUser}
                quickFilter={quickFilter}
                onQuickFilterChange={setQuickFilter}
                activeHeatMapFilter={dashboardHeatMapFilter}
                onHeatMapFilterChange={setDashboardHeatMapFilter}
              />

              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Risk Register</h3>
                <button 
                  onClick={() => {
                    setSelectedRisk(null); // Create new
                    setIsDetailOpen(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all whitespace-nowrap text-sm"
                >
                  <Plus size={18} /> New Risk
                </button>
              </div>

              {/* Risk List Table (Filtered by Quick Filter) */}
              <RiskList 
                risks={listRisks}
                actions={actions}
                comments={comments}
                currentUser={currentUser}
                onSelectRisk={(r) => {
                  setSelectedRisk(r);
                  setIsDetailOpen(true);
                }}
                sortOrder={sortOrder}
                visibleColumns={visibleColumns} // Pass columns
              />
            </div>
          )}

          {/* CATEGORY DASHBOARD VIEW (NEW) */}
          {currentView === 'categoryDashboard' && (
             <RiskCategoryDashboard 
               risks={dashboardRisks} // Pass filtered risks
               actions={actions}
               comments={comments}
               currentUser={currentUser}
               onSelectRisk={(r) => {
                 setSelectedRisk(r);
                 setIsDetailOpen(true);
               }}
               visibleColumns={visibleColumns} // Pass columns
               onNewRisk={() => {
                 setSelectedRisk(null); // Create new
                 setIsDetailOpen(true);
               }}
             />
          )}

          {/* REPORT VIEW */}
          {currentView === 'reports' && (
            <div className="h-[calc(100vh-140px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col animate-fade-in transition-colors">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800 dark:text-white">Enterprise Risk Report</h2>
                 <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Export PDF</button>
              </div>
              
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group">
                 <div className="text-center z-10">
                    <BarChart3 size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">PowerBI Dashboard Integration</h3>
                    <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto mt-2">This placeholder represents the embedded PowerBI Report. In a production environment, the iframe would load here.</p>
                 </div>
                 {/* Decorative background pattern to look like a chart */}
                 <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg width="100%" height="100%">
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                           <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                 </div>
              </div>
            </div>
          )}

          {/* HELP / USER GUIDE VIEW */}
          {currentView === 'help' && (
             <UserGuide />
          )}

          {/* ADMIN VIEW */}
          {currentView === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Risk Review Cycle Control */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                       <RefreshCw size={24} className="text-orange-500" />
                       Risk Review Cycle
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                       Initiate a new risk review cycle. This action will reset the status of <strong>ALL risks</strong> in the database to <span className="font-bold text-blue-600 dark:text-blue-400">Open</span>. 
                       <br/>
                       <span className="text-orange-600 dark:text-orange-400 font-bold">New:</span> This also takes a snapshot of all current scores to establish a new baseline for Trend Analysis.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800 flex gap-4 items-start max-w-md">
                     <AlertCircle className="text-orange-600 dark:text-orange-400 flex-shrink-0" size={20} />
                     <div className="space-y-3">
                        <p className="text-xs text-orange-800 dark:text-orange-300 font-medium">Warning: This action affects the entire organization and cannot be undone.</p>
                        {currentUser.role === 'RMIA' ? (
                          <button 
                             onClick={handleResetRiskStatus}
                             className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors w-full"
                          >
                             Start New Review Cycle (Reset All Risks)
                          </button>
                        ) : (
                          <div className="text-xs text-slate-500 italic bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                             Only Admins can perform this action.
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>

               {/* Bulk Actions for Admins */}
               {currentUser.role === 'RMIA' && (
                  <AdminBulkActions 
                    users={users}
                    risks={risks}
                    onBulkEscalate={handleBulkEscalation}
                    onBulkTransferOwnership={handleBulkTransferOwnership}
                    onBulkAddCollaborator={handleBulkAddCollaborator}
                  />
               )}

              {/* User Management */}
              <UserManagement 
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            </div>
          )}

        </div>
      </main>

      {/* Detail Modal */}
      {isDetailOpen && (
        <RiskDetail 
          risk={selectedRisk} 
          currentUser={currentUser}
          users={users}
          onClose={() => setIsDetailOpen(false)}
          onSave={handleSaveRisk}
          onDelete={handleDeleteRisk}
          actions={selectedRisk ? actions.filter(a => a.riskId === selectedRisk.id) : []}
          onAddAction={handleAddAction}
          onUpdateAction={handleUpdateAction}
          onDeleteAction={handleDeleteAction}
          comments={selectedRisk ? comments.filter(c => c.riskId === selectedRisk.id) : []}
          onAddComment={(txt, parentId) => selectedRisk && handleAddComment(selectedRisk.id, txt, parentId)}
          onDeleteComment={handleDeleteComment}
          onLikeComment={handleLikeComment}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-md w-full border-t-4 border-orange-500 relative">
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                      <AlertTriangle size={32} className="text-orange-600 dark:text-orange-400" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white">Confirm Global Reset</h3>
                   <div className="text-slate-600 dark:text-slate-300 text-sm space-y-2">
                      <p>Are you sure you want to reset <strong>ALL</strong> risk statuses to 'Open'?</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-800">
                         This will also <strong>Snapshot</strong> all current risk scores for the current quarter to track trends over the last 4 cycles.
                      </p>
                   </div>
                   
                   <div className="flex gap-3 w-full mt-2">
                      <button 
                         onClick={() => setShowResetConfirm(false)}
                         className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                         onClick={executeReset}
                         className="flex-1 px-4 py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                         Yes, Reset All
                      </button>
                   </div>
                </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default App;
