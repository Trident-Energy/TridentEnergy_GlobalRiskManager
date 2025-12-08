import React, { useMemo } from 'react';
import { Risk, RiskStatus, User } from '../types';
import { UserCheck, Users, BarChart as BarChartIcon, Filter, X, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import RiskHeatMap, { CellFilter } from './RiskHeatMap';

interface Props {
  risks: Risk[];
  escalatedCount: number;
  currentUser: User;
  quickFilter: 'ALL' | 'MY_RISKS' | 'COLLAB' | 'ESCALATED';
  onQuickFilterChange: (filter: 'ALL' | 'MY_RISKS' | 'COLLAB' | 'ESCALATED') => void;
  activeHeatMapFilter: CellFilter | null;
  onHeatMapFilterChange: (filter: CellFilter | null) => void;
}

const InteractiveCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  isActive, 
  onClick 
}: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  color: string, 
  isActive: boolean,
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className={`p-5 rounded-xl shadow-sm border flex items-center justify-between transition-all w-full text-left group h-full ${
      isActive 
        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
    }`}
  >
    <div className="flex flex-col justify-center">
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{title}</p>
      <h3 className={`text-3xl font-bold ${isActive ? 'text-blue-900 dark:text-white' : 'text-slate-800 dark:text-white'}`}>{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color} bg-opacity-20 dark:bg-opacity-20 ${isActive ? 'ring-2 ring-white dark:ring-slate-900 shadow-sm' : ''}`}>
      {icon}
    </div>
  </button>
);

const RiskDashboard: React.FC<Props> = ({ 
  risks, 
  escalatedCount, 
  currentUser, 
  quickFilter, 
  onQuickFilterChange,
  activeHeatMapFilter,
  onHeatMapFilterChange
}) => {
  
  // Filter risks for Chart statistics based on HeatMap selection
  const filteredRisks = useMemo(() => {
    if (!activeHeatMapFilter) return risks;
    
    return risks.filter(r => {
      const impact = activeHeatMapFilter.type === 'inherent' ? r.inherentImpact : r.residualImpact;
      const likelihood = activeHeatMapFilter.type === 'inherent' ? r.inherentLikelihood : r.residualLikelihood;
      return impact === activeHeatMapFilter.impact && likelihood === activeHeatMapFilter.likelihood;
    });
  }, [risks, activeHeatMapFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const sourceData = filteredRisks;
    const totalRisks = sourceData.length;
    
    const openRisks = sourceData.filter(r => r.status === RiskStatus.OPEN).length;
    const reviewedRisks = sourceData.filter(r => r.status === RiskStatus.REVIEWED).length;
    const updatedRisks = sourceData.filter(r => r.status === RiskStatus.UPDATED).length;

    // Personal Stats
    const myRisksCount = sourceData.filter(r => r.owner === currentUser.name).length;
    const collabRisksCount = sourceData.filter(r => r.collaborators.includes(currentUser.name)).length;
    
    // Recalculate escalations based on filtered view
    const localEscalatedCount = sourceData.filter(r => r.escalations?.some(e => e.userId === currentUser.id)).length;

    return { totalRisks, openRisks, reviewedRisks, updatedRisks, myRisksCount, collabRisksCount, localEscalatedCount };
  }, [filteredRisks, currentUser]);

  // Chart Data
  const chartData = [
    { name: 'Active', value: stats.totalRisks, color: '#3b82f6' }, // Blue
    { name: 'Open', value: stats.openRisks, color: '#6366f1' },   // Indigo
    { name: 'Reviewed', value: stats.reviewedRisks, color: '#10b981' }, // Emerald
    { name: 'Updated', value: stats.updatedRisks, color: '#f59e0b' }, // Amber
  ];

  const handleCardClick = (filter: 'MY_RISKS' | 'COLLAB' | 'ESCALATED') => {
    if (quickFilter === filter) {
      onQuickFilterChange('ALL');
    } else {
      onQuickFilterChange(filter);
    }
  };

  const handleHeatMapClick = (impact: number, likelihood: number, type: 'inherent' | 'residual') => {
    if (activeHeatMapFilter && activeHeatMapFilter.impact === impact && activeHeatMapFilter.likelihood === likelihood && activeHeatMapFilter.type === type) {
      onHeatMapFilterChange(null);
    } else {
      onHeatMapFilterChange({ impact, likelihood, type });
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* Expanded Grid to 4 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Interactive Quick Filters (1 Column) */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-[350px]">
          <div className="flex-1">
            <InteractiveCard 
              title="My Ownership" 
              value={stats.myRisksCount} 
              icon={<UserCheck className="text-blue-600 dark:text-blue-400" size={24} />} 
              color="bg-blue-100 dark:bg-blue-900" 
              isActive={quickFilter === 'MY_RISKS'}
              onClick={() => handleCardClick('MY_RISKS')}
            />
          </div>
          <div className="flex-1">
            <InteractiveCard 
              title="Collaborating" 
              value={stats.collabRisksCount} 
              icon={<Users className="text-purple-600 dark:text-purple-400" size={24} />} 
              color="bg-purple-100 dark:bg-purple-900" 
              isActive={quickFilter === 'COLLAB'}
              onClick={() => handleCardClick('COLLAB')}
            />
          </div>
          <div className="flex-1">
            <InteractiveCard 
              title="Reviewer" 
              value={stats.localEscalatedCount} 
              icon={<ShieldAlert className="text-orange-600 dark:text-orange-400" size={24} />} 
              color="bg-orange-100 dark:bg-orange-900" 
              isActive={quickFilter === 'ESCALATED'}
              onClick={() => handleCardClick('ESCALATED')}
            />
          </div>
        </div>

        {/* Center Column: All Risks Heat Maps (1 Column) */}
        <RiskHeatMap 
          title="All Residual Risks" 
          risks={risks}
          type="residual"
          onCellClick={handleHeatMapClick}
          activeFilter={activeHeatMapFilter}
          className="lg:col-span-1 h-full min-h-[350px]"
        />

        {/* Center Right Column: Portfolio Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col transition-colors h-full min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <BarChartIcon size={20} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Portfolio</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Overview Stats.</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stats.totalRisks}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total Risks</div>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }} 
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                  itemStyle={{ color: '#334155', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1000}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Active HeatMap Filter Indicator */}
      {activeHeatMapFilter && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-xl animate-fade-in">
           <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                <Filter size={16} />
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Filtered by {activeHeatMapFilter.type === 'inherent' ? 'Inherent' : 'Residual'} Matrix: <strong>Impact {activeHeatMapFilter.impact}</strong> / <strong>Prob {activeHeatMapFilter.likelihood}</strong>
              </p>
           </div>
           <button 
             onClick={() => onHeatMapFilterChange(null)}
             className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 hover:border-red-200 transition-colors"
           >
             <X size={14} /> Clear
           </button>
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;