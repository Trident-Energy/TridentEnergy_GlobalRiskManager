import React, { useMemo } from 'react';
import { Risk } from '../types';
import { calculateRiskScore, getRiskLevel } from '../constants';

export interface CellFilter {
  categoryLabel?: string;
  impact: number;
  likelihood: number;
  type: 'inherent' | 'residual';
}

const IMPACT_LEVELS = [1, 2, 3, 4, 5]; // X-Axis
const LIKELIHOOD_LEVELS = [5, 4, 3, 2, 1]; // Y-Axis (Reversed for chart flow)

interface Props { 
  title: string;
  risks: Risk[]; 
  type: 'inherent' | 'residual';
  onCellClick: (impact: number, likelihood: number, type: 'inherent' | 'residual') => void;
  activeFilter: CellFilter | null;
  className?: string;
  minimal?: boolean;
  hideHeader?: boolean;
}

const RiskHeatMap: React.FC<Props> = ({ 
  title, 
  risks, 
  type,
  onCellClick, 
  activeFilter,
  className,
  minimal = false,
  hideHeader = false
}) => {
  
  // Calculate counts for each cell based on type
  const matrixData = useMemo(() => {
    const map = new Map<string, number>();
    risks.forEach(r => {
      const impact = type === 'inherent' ? r.inherentImpact : r.residualImpact;
      const l = type === 'inherent' ? r.inherentLikelihood : r.residualLikelihood;
      const key = `${impact}-${l}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [risks, type]);

  // If categoryLabel is present in filter, match it. If not (global dashboard), ignore label check.
  // Also check if the active filter type matches this map's type
  const isMapActive = activeFilter 
    ? (activeFilter.type === type && (activeFilter.categoryLabel ? activeFilter.categoryLabel === title : true))
    : false;

  const containerClasses = minimal 
    ? `flex flex-col items-center flex-1 transition-colors ${className || ''}`
    : `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 flex flex-col items-center flex-1 transition-colors ${className || ''}`;

  return (
    <div className={containerClasses}>
       {!hideHeader && (
         <div className="flex justify-between w-full items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-wider">{title}</h3>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{risks.length} Risks</span>
         </div>
       )}

       {/* Added ml-12 to shift grid right to accommodate the far-left label */}
       <div className="relative ml-12">
          {/* Y-Axis Label: Moved to -left-14 to clear color zone completely */}
          <div className="absolute -left-14 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Likelihood
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 gap-1">
             {LIKELIHOOD_LEVELS.map(likelihood => (
                <React.Fragment key={`row-${likelihood}`}>
                   {IMPACT_LEVELS.map(impact => {
                      const score = calculateRiskScore(impact, likelihood);
                      const level = getRiskLevel(score, impact);
                      
                      // Extract color classes
                      let bgClass = '';
                      if (level.label === 'Significant') bgClass = 'bg-red-600 dark:bg-red-700';
                      else if (level.label === 'Moderate') bgClass = 'bg-yellow-400 dark:bg-yellow-500';
                      else bgClass = 'bg-emerald-500 dark:bg-emerald-600';

                      const count = matrixData.get(`${impact}-${likelihood}`) || 0;
                      
                      const isCellActive = isMapActive && activeFilter?.impact === impact && activeFilter?.likelihood === likelihood;
                      // Dim if map is active but this cell is not selected
                      const isDimmed = isMapActive && !isCellActive; 
                      // Also dim if another map (different type) is active
                      const isOtherMapActive = activeFilter ? activeFilter.type !== type : false;

                      return (
                        <button
                           key={`${impact}-${likelihood}`}
                           onClick={() => count > 0 && onCellClick(impact, likelihood, type)}
                           disabled={count === 0 || isOtherMapActive}
                           title={`Impact: ${impact}, Likelihood: ${likelihood}, Score: ${score}`}
                           className={`
                             w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded transition-all duration-200 relative
                             ${bgClass}
                             ${count === 0 ? 'opacity-30 cursor-default' : isOtherMapActive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 dark:hover:ring-offset-slate-900'}
                             ${isCellActive ? 'ring-2 ring-offset-2 ring-blue-600 dark:ring-blue-400 z-10 scale-110 shadow-lg' : ''}
                             ${isDimmed ? 'opacity-20 grayscale' : ''}
                           `}
                        >
                           {count > 0 && (
                             <span className="bg-white text-slate-900 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                               {count}
                             </span>
                           )}
                        </button>
                      );
                   })}
                </React.Fragment>
             ))}
          </div>
          
          {/* X-Axis Label */}
          <div className="mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
            Impact
          </div>
       </div>
    </div>
  );
};

export default RiskHeatMap;