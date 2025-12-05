
import React, { useState, useMemo } from 'react';
import { Risk, RiskCategory, ActionPlan, Comment, User } from '../types';
import RiskList from './RiskList';
import { X, Filter } from 'lucide-react';
import RiskHeatMap, { CellFilter } from './RiskHeatMap';

interface Props {
  risks: Risk[];
  actions: ActionPlan[];
  comments: Comment[];
  currentUser: User;
  onSelectRisk: (risk: Risk) => void;
  visibleColumns: string[]; // Receive prop
}

const RiskCategoryDashboard: React.FC<Props> = ({ risks, actions, comments, currentUser, onSelectRisk, visibleColumns }) => {
  const [activeFilter, setActiveFilter] = useState<CellFilter | null>(null);

  // Bucket Logic
  const categorizedRisks = useMemo(() => {
    return {
      'All Risks': risks, // Consolidated view first
      'Strategic Risks': risks.filter(r => r.category === RiskCategory.STRATEGIC),
      'Finance Risks': risks.filter(r => r.category === RiskCategory.FINANCIAL),
      'Operational Risks': risks.filter(r => r.category === RiskCategory.OPERATIONAL),
      'Compliance Risks': risks.filter(r => r.category === RiskCategory.COMPLIANCE),
      // Custom bucket for HSE (Health, Safety, Environment) often requested separately
      'HSE Risks': risks.filter(r => r.functionArea === 'HSE' || r.register.includes('HSE') || r.description.toLowerCase().includes('safety')),
    };
  }, [risks]);

  // Filter the list based on selection
  const filteredList = useMemo(() => {
    if (!activeFilter) return risks;

    const { categoryLabel, impact, likelihood, type } = activeFilter;
    
    // Get the base bucket again
    // @ts-ignore
    const bucket = categorizedRisks[categoryLabel || 'All Risks'] || [];

    // Filter by cell coordinates and type
    return bucket.filter((r: Risk) => {
       const rImpact = type === 'inherent' ? r.inherentImpact : r.residualImpact;
       const rLikelihood = type === 'inherent' ? r.inherentLikelihood : r.residualLikelihood;
       return rImpact === impact && rLikelihood === likelihood;
    });
  }, [risks, activeFilter, categorizedRisks]);

  const handleCellClick = (categoryLabel: string, impact: number, likelihood: number, type: 'inherent' | 'residual') => {
    if (activeFilter && activeFilter.categoryLabel === categoryLabel && activeFilter.impact === impact && activeFilter.likelihood === likelihood && activeFilter.type === type) {
      // Toggle off
      setActiveFilter(null);
    } else {
      setActiveFilter({ categoryLabel, impact, likelihood, type });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Heat Maps Section */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x scrollbar-thin">
        {Object.entries(categorizedRisks).map(([label, bucket]) => (
          <div key={label} className="snap-start min-w-[300px]">
             <RiskHeatMap 
                title={label} 
                risks={bucket} 
                type="residual" // Default to residual for category view
                onCellClick={(i, l, t) => handleCellClick(label, i, l, t)}
                activeFilter={activeFilter}
                className="h-full"
             />
          </div>
        ))}
      </div>

      {/* Filter Status Bar */}
      {activeFilter && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                <Filter size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Filtered View Active</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing <strong>{filteredList.length}</strong> risks in 
                  <span className="font-bold text-blue-600 dark:text-blue-400 ml-1">{activeFilter.categoryLabel}</span> 
                  (Impact: {activeFilter.impact}, Prob: {activeFilter.likelihood})
                </p>
              </div>
           </div>
           <button 
             onClick={() => setActiveFilter(null)}
             className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 hover:border-red-200 transition-colors"
           >
             <X size={14} /> Clear Selection
           </button>
        </div>
      )}

      {/* Filtered Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white">Risk Details</h3>
        </div>
        <RiskList 
          risks={filteredList}
          actions={actions}
          comments={comments}
          currentUser={currentUser}
          onSelectRisk={onSelectRisk}
          sortOrder="newest"
          visibleColumns={visibleColumns} // Pass columns
        />
      </div>
    </div>
  );
};

export default RiskCategoryDashboard;
