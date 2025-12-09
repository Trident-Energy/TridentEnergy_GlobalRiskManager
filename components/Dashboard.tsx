
import React, { useMemo, useState, useEffect } from 'react';
import { ContractData, ContractStatus, Entity, User } from '../types';
import { MOCK_USERS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Clock, DollarSign, Search, Filter, ArrowRight, MessageSquare, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Paperclip, UserCheck, Briefcase, Layers, XCircle, User as UserIcon, Activity, Timer, X } from 'lucide-react';

interface DashboardProps {
  contracts: ContractData[];
  onViewContract: (contract: ContractData) => void;
  currentUser: User;
}

const STATUS_COLORS: Record<string, string> = {
  [ContractStatus.SUBMITTED]: '#3b82f6',       // Blue
  [ContractStatus.PENDING_CEO]: '#f97316',     // Orange
  [ContractStatus.APPROVED]: '#22c55e',        // Green
  [ContractStatus.REJECTED]: '#ef4444',        // Red
  [ContractStatus.CHANGES_REQUESTED]: '#eab308', // Yellow
  [ContractStatus.DRAFT]: '#94a3b8',           // Slate
};

const FLAG_URLS: Record<string, string> = {
  'London': 'https://flagcdn.com/w80/gb.png',
  'Brazil': 'https://flagcdn.com/w80/br.png',
  'Congo': 'https://flagcdn.com/w80/cg.png',
  'Equatorial Guinea': 'https://flagcdn.com/w80/gq.png'
};

export const Dashboard: React.FC<DashboardProps> = ({ contracts, onViewContract, currentUser }) => {
  const [selectedEntity, setSelectedEntity] = useState<string | 'ALL'>('ALL');
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedSubmitter, setSelectedSubmitter] = useState<string>('ALL');
  const [isHighRiskFilter, setIsHighRiskFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modal State
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Compute available departments based on selected Entity (to avoid showing empty filters)
  const availableDepartments = useMemo(() => {
    let data = [...contracts];
    if (selectedEntity !== 'ALL') {
      data = data.filter(c => 
        selectedEntity === 'London' ? c.entity === Entity.LONDON :
        selectedEntity === 'Brazil' ? c.entity === Entity.BRAZIL :
        selectedEntity === 'Congo' ? c.entity === Entity.CONGO :
        c.entity === Entity.EQUATORIAL_GUINEA
      );
    }
    const depts = new Set(data.map(c => c.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [contracts, selectedEntity]);

  // Compute available submitters based on current contracts
  const availableSubmitters = useMemo(() => {
    const ids = new Set(contracts.map(c => c.submitterId).filter(Boolean));
    return Array.from(ids).map(id => {
        const u = MOCK_USERS.find(user => user.id === id);
        return { id, name: u ? u.name : 'Unknown' };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [contracts]);

  // Filter & Sort Logic
  const filteredContracts = useMemo(() => {
    let data = [...contracts]; // Create a shallow copy to sort safely
    
    // Filter by Entity
    if (selectedEntity !== 'ALL') {
      data = data.filter(c => 
        selectedEntity === 'London' ? c.entity === Entity.LONDON :
        selectedEntity === 'Brazil' ? c.entity === Entity.BRAZIL :
        selectedEntity === 'Congo' ? c.entity === Entity.CONGO :
        c.entity === Entity.EQUATORIAL_GUINEA
      );
    }

    // Filter by Status
    if (selectedStatus === 'REVIEW') {
      data = data.filter(c => c.status === ContractStatus.SUBMITTED || c.status === ContractStatus.PENDING_CEO);
    } else if (selectedStatus !== 'ALL') {
      data = data.filter(c => c.status === selectedStatus);
    }

    // Filter by Type
    if (selectedType !== 'ALL') {
      data = data.filter(c => c.contractType === selectedType);
    }

    // Filter by Department
    if (selectedDepartment !== 'ALL') {
      data = data.filter(c => c.department === selectedDepartment);
    }

    // Filter by Submitter
    if (selectedSubmitter !== 'ALL') {
      data = data.filter(c => c.submitterId === selectedSubmitter);
    }

    // Filter by High Risk
    if (isHighRiskFilter) {
      data = data.filter(c => c.isHighRisk);
    }

    // Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(c => 
        c.contractorName.toLowerCase().includes(lower) || 
        (c.title && c.title.toLowerCase().includes(lower)) ||
        (c.project && c.project.toLowerCase().includes(lower)) ||
        c.id.toLowerCase().includes(lower) ||
        c.scopeOfWork.toLowerCase().includes(lower)
      );
    }

    // Sort by Date
    data.sort((a, b) => {
      const dateA = a.submissionDate || 0;
      const dateB = b.submissionDate || 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return data;
  }, [contracts, selectedEntity, selectedStatus, selectedType, selectedDepartment, selectedSubmitter, searchTerm, sortOrder, isHighRiskFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedEntity, selectedStatus, selectedType, selectedDepartment, selectedSubmitter, searchTerm, itemsPerPage, isHighRiskFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContracts, currentPage, itemsPerPage]);

  // Metrics Calculation
  const kpiBaseContracts = useMemo(() => {
    if (selectedEntity === 'ALL') return contracts;
    return contracts.filter(c => 
      selectedEntity === 'London' ? c.entity === Entity.LONDON :
      selectedEntity === 'Brazil' ? c.entity === Entity.BRAZIL :
      selectedEntity === 'Congo' ? c.entity === Entity.CONGO :
      c.entity === Entity.EQUATORIAL_GUINEA
    );
  }, [contracts, selectedEntity]);

  const metrics = useMemo(() => {
    const pending = kpiBaseContracts.filter(c => c.status === ContractStatus.SUBMITTED || c.status === ContractStatus.PENDING_CEO).length;
    const totalValue = kpiBaseContracts.reduce((acc, c) => acc + c.amount, 0);
    const highRisk = kpiBaseContracts.filter(c => c.isHighRisk).length;
    const avgDays = kpiBaseContracts.length > 0 ? 2.5 : 0;
    
    const statusData = [
      { name: ContractStatus.SUBMITTED, value: kpiBaseContracts.filter(c => c.status === ContractStatus.SUBMITTED).length },
      { name: ContractStatus.PENDING_CEO, value: kpiBaseContracts.filter(c => c.status === ContractStatus.PENDING_CEO).length },
      { name: ContractStatus.APPROVED, value: kpiBaseContracts.filter(c => c.status === ContractStatus.APPROVED).length },
      { name: ContractStatus.REJECTED, value: kpiBaseContracts.filter(c => c.status === ContractStatus.REJECTED).length },
    ].filter(d => d.value > 0);

    const spendData = [
       { name: 'London', value: kpiBaseContracts.filter(c => c.entity === Entity.LONDON).reduce((acc, c) => acc + c.amount, 0) },
       { name: 'Brazil', value: kpiBaseContracts.filter(c => c.entity === Entity.BRAZIL).reduce((acc, c) => acc + c.amount, 0) },
       { name: 'Congo', value: kpiBaseContracts.filter(c => c.entity === Entity.CONGO).reduce((acc, c) => acc + c.amount, 0) },
       { name: 'Eq. Guinea', value: kpiBaseContracts.filter(c => c.entity === Entity.EQUATORIAL_GUINEA).reduce((acc, c) => acc + c.amount, 0) },
    ];

    return { pending, totalValue, highRisk, avgDays, statusData, spendData };
  }, [kpiBaseContracts]);

  // Aggregate Recent Activity (All and Slice)
  const allActivities = useMemo(() => {
    const activities = contracts.flatMap(c => 
      c.auditTrail.map(log => ({
        ...log,
        contractId: c.id,
        contractTitle: c.contractorName,
        contractStatus: c.status
      }))
    );
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }, [contracts]);

  const recentActivity = useMemo(() => {
    return allActivities.slice(0, 5);
  }, [allActivities]);

  const FlagButton = ({ label, flagUrl }: { label: string, flagUrl: string }) => (
    <button 
      onClick={() => {
        setSelectedEntity(selectedEntity === label ? 'ALL' : label);
        // Reset department when entity changes as departments might not exist in new entity
        setSelectedDepartment('ALL');
      }}
      className={`group relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 border-2 ${
        selectedEntity === label 
        ? 'bg-blue-50 border-blue-500 shadow-md dark:bg-blue-900/20 dark:border-blue-400' 
        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700'
      }`}
    >
      <div className="w-12 h-8 rounded overflow-hidden shadow-sm relative">
        <img src={flagUrl} alt={label} className="w-full h-full object-cover" />
        {selectedEntity === label && (
           <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
             <CheckCircle size={16} className="text-white drop-shadow-md" />
           </div>
        )}
      </div>
      <span className={`text-xs mt-2 font-semibold ${selectedEntity === label ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </span>
    </button>
  );

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case ContractStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case ContractStatus.PENDING_CEO:
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case ContractStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case ContractStatus.CHANGES_REQUESTED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case ContractStatus.DRAFT:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getAgeBadge = (date: number) => {
    const days = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
    if (days < 3) return { text: `${days}d`, class: 'text-green-600 bg-green-50 border-green-200' };
    if (days < 7) return { text: `${days}d`, class: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { text: `${days}d`, class: 'text-red-600 bg-red-50 border-red-200 font-bold' };
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleKPIClick = (type: 'PENDING' | 'VALUE' | 'RISK' | 'AVG') => {
     if (type === 'PENDING') {
       setSelectedStatus('REVIEW');
       setIsHighRiskFilter(false);
     } else if (type === 'RISK') {
       setSelectedStatus('ALL');
       setIsHighRiskFilter(true);
     } else {
       setSelectedStatus('ALL');
       setIsHighRiskFilter(false);
     }
  };

  const clearFilters = () => {
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setSelectedDepartment('ALL');
    setSelectedSubmitter('ALL');
    setSearchTerm('');
    setIsHighRiskFilter(false);
  };

  const hasActiveFilters = selectedStatus !== 'ALL' || selectedType !== 'ALL' || selectedDepartment !== 'ALL' || selectedSubmitter !== 'ALL' || searchTerm !== '' || isHighRiskFilter;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* 1. Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of high-risk contracts across all entities.</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto justify-start md:justify-end">
           <FlagButton label="London" flagUrl={FLAG_URLS['London']} />
           <FlagButton label="Brazil" flagUrl={FLAG_URLS['Brazil']} />
           <FlagButton label="Congo" flagUrl={FLAG_URLS['Congo']} />
           <FlagButton label="Equatorial Guinea" flagUrl={FLAG_URLS['Equatorial Guinea']} />
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
          title="Contracts Under Review" 
          value={metrics.pending} 
          icon={<Clock size={24} />} 
          color="blue" 
          onClick={() => handleKPIClick('PENDING')}
          active={selectedStatus === 'REVIEW'}
        />
        <KPICard 
          title="Total Value (USD)" 
          value={`$${(metrics.totalValue / 1000000).toFixed(1)}M`} 
          icon={<DollarSign size={24} />} 
          color="green" 
          onClick={() => handleKPIClick('VALUE')}
        />
        <KPICard 
          title="High Risk Identified" 
          value={metrics.highRisk} 
          icon={<AlertCircle size={24} />} 
          color="orange" 
          onClick={() => handleKPIClick('RISK')}
          active={isHighRiskFilter}
        />
        <KPICard 
          title="Avg Review Time" 
          value={`${metrics.avgDays} Days`} 
          icon={<CheckCircle size={24} />} 
          color="purple" 
          onClick={() => handleKPIClick('AVG')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 3. Charts - Spans 3 columns */}
        <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Contract Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    onClick={(data) => {
                      setSelectedStatus(data.name);
                      setIsHighRiskFilter(false);
                    }}
                    cursor="pointer"
                  >
                    {metrics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Total Contract Value by Entity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.spendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Value']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* 4. Recent Activity Feed - Spans 1 column */}
        <div className="xl:col-span-1 bg-white dark:bg-slate-800 p-0 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full max-h-[400px] xl:max-h-none">
           <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Recent Activity
              </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((log, i) => (
                <div key={i} className="flex gap-3 relative pb-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0">
                   <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {log.userName.charAt(0)}
                      </div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                         {log.action}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                         {log.contractTitle}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          by {log.userName}
                        </span>
                      </div>
                   </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
              )}
           </div>
           <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-center">
              <button 
                onClick={() => setShowAuditModal(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Full Audit Log
              </button>
           </div>
        </div>
      </div>

      {/* 5. Contract Register Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
           
           <div className="flex flex-col gap-1">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
               Contract Register
               {isHighRiskFilter && (
                  <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700 border border-orange-200">High Risk Only</span>
               )}
               <span className="text-xs font-normal text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                 {filteredContracts.length}
               </span>
             </h2>
           </div>

           {/* Toolbar controls */}
           <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto items-start sm:items-center">
             
             {/* Search */}
             <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
               <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search contracts..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 ring-blue-500 outline-none" 
               />
             </div>
             
             {/* Status Filter */}
             <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 focus-within:ring-2 ring-blue-500">
               <Filter size={16} className="text-slate-400" />
               <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer max-w-[120px]"
                title="Filter by Status"
               >
                 <option value="ALL">All Statuses</option>
                 <option value="REVIEW">Under Review</option>
                 {Object.values(ContractStatus).map(status => (
                   <option key={status} value={status}>{status}</option>
                 ))}
               </select>
             </div>

             {/* Type Filter */}
             <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 focus-within:ring-2 ring-blue-500">
               <Layers size={16} className="text-slate-400" />
               <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer max-w-[120px]"
                title="Filter by Type"
               >
                 <option value="ALL">All Types</option>
                 <option value="CAPEX">CAPEX</option>
                 <option value="OPEX">OPEX</option>
                 <option value="MIXED">MIXED</option>
               </select>
             </div>

             {/* Department Filter */}
             <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 focus-within:ring-2 ring-blue-500">
               <Briefcase size={16} className="text-slate-400" />
               <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer max-w-[120px]"
                title="Filter by Department"
               >
                 <option value="ALL">All Depts</option>
                 {availableDepartments.map(dept => (
                   <option key={dept} value={dept}>{dept}</option>
                 ))}
               </select>
             </div>

             {/* Submitter Filter */}
             <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 focus-within:ring-2 ring-blue-500">
               <UserIcon size={16} className="text-slate-400" />
               <select 
                value={selectedSubmitter}
                onChange={(e) => setSelectedSubmitter(e.target.value)}
                className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer max-w-[120px]"
                title="Filter by Submitter"
               >
                 <option value="ALL">All Submitters</option>
                 {availableSubmitters.map(s => (
                   <option key={s.id} value={s.id}>{s.name}</option>
                 ))}
               </select>
             </div>

             {/* Clear Filters Button */}
             {hasActiveFilters && (
               <button 
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Clear All Filters"
               >
                 <XCircle size={16} /> Clear
               </button>
             )}
           </div>
         </div>
         
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
               <tr>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Contract Title</th>
                 <th className="px-6 py-4">Type</th>
                 <th className="px-6 py-4">Department</th>
                 <th className="px-6 py-4">Contractor</th>
                 <th className="px-6 py-4">Submitted By</th>
                 <th className="px-6 py-4">Entity</th>
                 <th className="px-6 py-4">Amount (USD)</th>
                 <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                  onClick={toggleSortOrder}
                 >
                   <div className="flex items-center gap-1">
                     Aging
                     {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                   </div>
                 </th>
                 <th className="px-6 py-4 text-center" title="Attachments">
                    <Paperclip size={16} className="mx-auto"/>
                 </th>
                 <th className="px-6 py-4 text-center">Comments</th>
                 <th className="px-6 py-4 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {paginatedContracts.map(c => {
                 const isAdHoc = c.adHocReviewers?.some(r => r.userId === currentUser.id);
                 const age = getAgeBadge(c.submissionDate || Date.now());
                 return (
                 <tr 
                    key={c.id} 
                    onClick={() => onViewContract(c)} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                 >
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusBadge(c.status)}`}>
                       {c.status}
                     </span>
                     {isAdHoc && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                           <UserCheck size={10} /> Ad-Hoc
                        </div>
                     )}
                   </td>
                   <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                     {c.title || c.contractorName}
                     {c.project && <div className="text-xs text-slate-500 font-normal mt-0.5">{c.project}</div>}
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                     <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.contractType === 'CAPEX' ? 'bg-orange-100 text-orange-700' : 
                        c.contractType === 'OPEX' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                     }`}>
                       {c.contractType}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                     {c.department}
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{c.contractorName}</td>
                   <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                           {MOCK_USERS.find(u => u.id === c.submitterId)?.name.charAt(0) || '?'}
                        </div>
                        <span className="truncate max-w-[100px]" title={MOCK_USERS.find(u => u.id === c.submitterId)?.name}>{MOCK_USERS.find(u => u.id === c.submitterId)?.name || 'Unknown'}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center" title={c.entity}>
                        <img 
                          src={FLAG_URLS[c.entity]} 
                          alt={c.entity} 
                          className="w-8 h-5 rounded shadow-sm object-cover border border-slate-200 dark:border-slate-600 hover:scale-110 transition-transform"
                        />
                     </div>
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">${c.amount.toLocaleString()}</td>
                   <td className="px-6 py-4 text-sm">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${age.class}`}>
                        <Timer size={10} /> {age.text}
                      </span>
                   </td>
                   <td className="px-6 py-4 text-center">
                     {c.documents && c.documents.length > 0 && (
                       <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400" title={`${c.documents.length} file(s) attached`}>
                         <Paperclip size={14} />
                       </div>
                     )}
                   </td>
                   <td className="px-6 py-4 text-center">
                     {c.comments && c.comments.length > 0 && (
                       <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                         c.hasUnreadComments 
                         ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                         : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                       }`}>
                         <MessageSquare size={12} className={c.hasUnreadComments ? "animate-pulse" : ""} />
                         <span>{c.comments.length}</span>
                       </div>
                     )}
                   </td>
                   <td className="px-6 py-4 text-right">
                     <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
                       <ArrowRight size={16} />
                     </span>
                   </td>
                 </tr>
               )})}
               {paginatedContracts.length === 0 && (
                 <tr>
                   <td colSpan={12} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                     No contracts found matching your filters.
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>

         {/* Pagination Footer */}
         <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <span className="hidden sm:inline">
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredContracts.length)}-{Math.min(currentPage * itemsPerPage, filteredContracts.length)} of {filteredContracts.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
                {currentPage} / {totalPages || 1}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronRight size={20} />
              </button>
            </div>
         </div>
      </div>

      {/* Full Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Full Audit Log
              </h3>
              <button 
                onClick={() => setShowAuditModal(false)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-0">
              <table className="w-full text-left border-collapse text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 sticky top-0 z-10">
                   <tr>
                     <th className="px-6 py-3 font-semibold">Time</th>
                     <th className="px-6 py-3 font-semibold">User</th>
                     <th className="px-6 py-3 font-semibold">Action</th>
                     <th className="px-6 py-3 font-semibold">Contract</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {allActivities.map((log, i) => (
                     <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                       <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                         {new Date(log.timestamp).toLocaleString()}
                       </td>
                       <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                         {log.userName}
                       </td>
                       <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                         {log.action}
                         {log.details && <div className="text-xs text-slate-400 mt-0.5">{log.details}</div>}
                       </td>
                       <td className="px-6 py-3 text-blue-600 dark:text-blue-400 font-medium">
                         {log.contractTitle}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const KPICard = ({ title, value, icon, color, onClick, active }: { title: string, value: string | number, icon: any, color: string, onClick?: () => void, active?: boolean }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  }[color];

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-xl shadow-sm border transition-all cursor-pointer ${
        active 
        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500 ring-1 ring-blue-400' 
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${colorClasses}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
