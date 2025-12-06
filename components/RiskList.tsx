
import React, { useState, useEffect } from 'react';
import { Risk, Country, ActionPlan, User, RiskStatus, Comment } from '../types';
import { calculateRiskScore, getRiskLevel, getControlRatingColor, COUNTRIES } from '../constants';
import { ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, AlertTriangle, User as UserIcon, Users, ArrowUpDown, MessageSquare, ArrowUp, ArrowDown, Square, Triangle, ShieldAlert, AlertCircle } from 'lucide-react';
import { SortOption } from '../App';

interface Props {
  risks: Risk[];
  actions: ActionPlan[];
  comments: Comment[];
  currentUser: User;
  onSelectRisk: (risk: Risk) => void;
  sortOrder: SortOption;
  visibleColumns?: string[]; // New optional prop
}

const ITEMS_PER_PAGE = 25;

const RiskList: React.FC<Props> = ({ risks, actions, comments, currentUser, onSelectRisk, sortOrder, visibleColumns }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Risk | 'residualScore' | 'escalationCount' | 'latestComment'>('creationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Default to all columns if prop not provided (for backward compatibility)
  const isVisible = (key: string) => !visibleColumns || visibleColumns.includes(key);

  // Reset page when risks (filters) change
  useEffect(() => {
    setCurrentPage(1);
  }, [risks]);

  // Sync sorting with parent filter
  useEffect(() => {
    switch (sortOrder) {
      case 'newest':
        setSortKey('creationDate');
        setSortDirection('desc');
        break;
      case 'oldest':
        setSortKey('creationDate');
        setSortDirection('asc');
        break;
      case 'last_reviewed_newest':
        setSortKey('lastReviewDate');
        setSortDirection('desc');
        break;
      case 'last_reviewed_oldest':
        setSortKey('lastReviewDate');
        setSortDirection('asc');
        break;
      case 'highest_residual':
        setSortKey('residualScore');
        setSortDirection('desc');
        break;
      case 'lowest_risk':
        setSortKey('residualScore');
        setSortDirection('asc');
        break;
      case 'escalations':
        setSortKey('escalationCount');
        setSortDirection('desc');
        break;
      case 'ownership':
        setSortKey('owner');
        setSortDirection('asc');
        break;
      case 'function':
        setSortKey('functionArea');
        setSortDirection('asc');
        break;
      case 'last_reviewer_az':
        setSortKey('lastReviewer');
        setSortDirection('asc');
        break;
      case 'last_reviewer_za':
        setSortKey('lastReviewer');
        setSortDirection('desc');
        break;
      case 'newest_comments':
        setSortKey('latestComment');
        setSortDirection('desc');
        break;
      default:
        setSortKey('creationDate');
        setSortDirection('desc');
    }
  }, [sortOrder]);

  const handleSort = (key: keyof Risk) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Default to descending for new columns
    }
  };

  const sortedRisks = [...risks].sort((a, b) => {
    // Handle computed/special keys first
    if (sortKey === 'residualScore') {
       const scoreA = calculateRiskScore(a.residualImpact, a.residualLikelihood);
       const scoreB = calculateRiskScore(b.residualImpact, b.residualLikelihood);
       return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    }

    if (sortKey === 'escalationCount') {
       const countA = a.escalations?.length || 0;
       const countB = b.escalations?.length || 0;
       return sortDirection === 'asc' ? countA - countB : countB - countA;
    }

    if (sortKey === 'latestComment') {
       const getLatest = (rId: string) => {
           const riskComments = comments.filter(c => c.riskId === rId);
           if (!riskComments.length) return 0;
           return Math.max(...riskComments.map(c => new Date(c.date).getTime()));
       };
       const dateA = getLatest(a.id);
       const dateB = getLatest(b.id);
       return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // Standard Property Sort
    const aValue = a[sortKey as keyof Risk];
    const bValue = b[sortKey as keyof Risk];

    if (aValue === bValue) return 0;
    
    // Handle string/number comparison
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    const compareResult = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? compareResult : -compareResult;
  });

  const totalPages = Math.ceil(sortedRisks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRisks = sortedRisks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getFlag = (c: Country) => {
    const country = COUNTRIES.find(co => co.code === c);
    return country?.flagUrl ? (
      <img src={country.flagUrl} alt={c} className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
    ) : (
      <span className="text-lg">🏳️</span>
    );
  };

  const hasActionPlan = (riskId: string) => {
    return actions.some(a => a.riskId === riskId);
  };

  // Helper to check for comments and recency
  const getCommentInfo = (riskId: string) => {
    const riskComments = comments.filter(c => c.riskId === riskId);
    const count = riskComments.length;
    
    // Logic for "New": Is the latest comment from the last 3 days?
    let hasNew = false;
    if (count > 0) {
      const latestDate = new Date(Math.max(...riskComments.map(c => new Date(c.date).getTime())));
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      if (latestDate > threeDaysAgo) {
        hasNew = true;
      }
    }
    return { count, hasNew };
  };
  
  // Helper to calculate trend
  const getRiskTrend = (risk: Risk) => {
    if (risk.status === RiskStatus.OPEN) return 'new';

    if (!risk.history || risk.history.length === 0) return 'stable';

    // Find latest impact/likelihood changes
    const impactLog = risk.history.find(h => h.action.includes('Residual Impact Changed'));
    const likelihoodLog = risk.history.find(h => h.action.includes('Residual Likelihood Changed'));

    if (!impactLog && !likelihoodLog) return 'stable';

    // Current Score
    const currentScore = risk.residualImpact * risk.residualLikelihood;

    // Previous Score Calculation
    // We need to parse the "old" values from the logs.
    // Format: "From 'X' to 'Y'"
    const parseOldValue = (details: string): number | null => {
      const match = details.match(/From '(\d+)'/);
      return match ? parseInt(match[1]) : null;
    };

    let prevImpact = risk.residualImpact;
    let prevLikelihood = risk.residualLikelihood;

    if (impactLog) {
       const old = parseOldValue(impactLog.details);
       if (old !== null) prevImpact = old;
    }
    if (likelihoodLog) {
       const old = parseOldValue(likelihoodLog.details);
       if (old !== null) prevLikelihood = old;
    }

    const prevScore = prevImpact * prevLikelihood;

    if (currentScore > prevScore) return 'increase';
    if (currentScore < prevScore) return 'decrease';
    return 'stable';
  };

  const renderTrendIcon = (trend: 'new' | 'increase' | 'decrease' | 'stable') => {
    let icon, text;
    switch(trend) {
      case 'new':
        icon = <Triangle size={18} className="fill-purple-600 text-purple-600" />;
        text = "New Risk";
        break;
      case 'increase':
        icon = <ArrowUp size={20} className="text-red-600 stroke-[3]" />;
        text = "Risk Increased";
        break;
      case 'decrease':
        icon = <ArrowDown size={20} className="text-green-600 stroke-[3]" />;
        text = "Risk Decreased";
        break;
      case 'stable':
        icon = <Square size={16} className="fill-amber-400 text-amber-400" />;
        text = "No Change";
        break;
    }

    return (
      <div className="group/trend relative inline-flex items-center justify-center">
        {icon}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded opacity-0 group-hover/trend:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
           {text}
           {/* Arrow pointing down */}
           <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
        </div>
      </div>
    );
  };

  // Helper to get user's escalation levels for a risk
  const getUserEscalationLevels = (risk: Risk) => {
    if (!risk.escalations) return [];
    return risk.escalations
      .filter(e => e.userId === currentUser.id || e.userName === currentUser.name)
      .map(e => e.level);
  };

  const SortHeader = ({ label, columnKey, width }: { label: string, columnKey: keyof Risk, width?: string }) => (
    <th 
      className={`px-4 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group select-none ${width}`}
      onClick={() => handleSort(columnKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={`text-slate-400 ${sortKey === columnKey ? 'text-blue-600 dark:text-blue-400 opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      </div>
    </th>
  );

  // Dynamic table layout: If fewer than 8 columns are visible, force width to 'w-full' to remove scrollbars and fill space.
  const tableMinWidth = !visibleColumns || visibleColumns.length > 8 ? 'min-w-[1200px]' : 'w-full';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col w-full transition-colors">
      <div className="overflow-x-auto w-full">
        <table className={`w-full text-left border-collapse ${tableMinWidth}`}>
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isVisible('warning') && <th className="px-4 py-4 w-10"></th>} {/* 1. Warning Icon */}
              {isVisible('role') && <th className="px-4 py-4 w-32">My Role</th>} {/* 2. My Role */}
              {isVisible('country') && <th className="px-4 py-4 w-20">Country</th>} {/* 3. Country */}
              {isVisible('register') && <SortHeader label="Risk Register" columnKey="register" width="w-32" />} {/* 4. Risk Register */}
              {isVisible('id') && <SortHeader label="Risk Id" columnKey="id" width="w-24" />} {/* 5. Risk ID */}
              {isVisible('title') && <SortHeader label="Key Business Risk Title" columnKey="title" width="w-80" />} {/* 6. Key Business Risk Title */}
              {isVisible('functionArea') && <SortHeader label="Function/Area" columnKey="functionArea" width="w-48" />} {/* 7. Function/Area */}
              {isVisible('trend') && <th className="px-4 py-4 w-16 text-center">Trend</th>} {/* 8. Trend */}
              {isVisible('inherentScore') && <th className="px-4 py-4 w-40">Inherent Risk Score</th>} {/* 9. Inherent Risk Score */}
              {isVisible('controlsRating') && <th className="px-4 py-4 w-32">Controls rating</th>} {/* 10. Controls Rating */}
              {isVisible('residualScore') && <th className="px-4 py-4 w-40">Residual Risk Score</th>} {/* 11. Residual Risk Score */}
              {isVisible('owner') && <SortHeader label="Risk Owner" columnKey="owner" width="w-40" />} {/* 12. Risk Owner */}
              {isVisible('status') && <SortHeader label="Risk Status" columnKey="status" width="w-32" />} {/* 13. Risk Status */}
              {isVisible('comments') && <th className="px-4 py-4 w-20 text-center">Comments</th>} {/* 14. Comments */}
              {isVisible('escalation') && <th className="px-4 py-4 w-40">Escalation</th>} {/* 15. Escalation */}
              {isVisible('creationDate') && <SortHeader label="Created" columnKey="creationDate" width="w-28" />} {/* 16. Created */}
              {isVisible('lastReviewDate') && <SortHeader label="Last Review Date" columnKey="lastReviewDate" width="w-32" />} {/* 17. Last Review Date */}
              {isVisible('lastReviewer') && <th className="px-4 py-4 w-40">Last Reviewer</th>} {/* 18. Last Reviewer */}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedRisks.length === 0 ? (
              <tr>
                <td colSpan={18} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No risks found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedRisks.map((risk) => {
                const iScore = calculateRiskScore(risk.inherentImpact, risk.inherentLikelihood);
                const rScore = calculateRiskScore(risk.residualImpact, risk.residualLikelihood);
                const iLevel = getRiskLevel(iScore, risk.inherentImpact);
                const rLevel = getRiskLevel(rScore, risk.residualImpact);
                const controlColor = getControlRatingColor(risk.controlsRating);
                const hasActions = hasActionPlan(risk.id);
                const { count: commentCount, hasNew: hasNewComments } = getCommentInfo(risk.id);
                const trend = getRiskTrend(risk);
                
                const isOwner = currentUser.name === risk.owner;
                const isCollaborator = risk.collaborators.includes(currentUser.name);
                
                // Get specific escalation levels for current user
                const escalationLevels = getUserEscalationLevels(risk);

                const isClosed = risk.status === RiskStatus.CLOSED;

                // Determine if warning should be shown:
                // 1. Scoring Error (Residual > Inherent) - Critical
                const isScoringError = rScore > iScore;

                // 2. Missing Action Plan
                // No actions + Not closed + Residual is Moderate OR Significant
                const showMissingActionWarning = !hasActions && !isClosed && (rLevel.label === 'Moderate' || rLevel.label === 'Significant');

                return (
                  <tr 
                    key={risk.id} 
                    onClick={() => onSelectRisk(risk)}
                    className={`cursor-pointer transition-colors group text-sm ${
                      isClosed 
                        ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {/* 1. Warning Column */}
                    {isVisible('warning') && (
                      <td className="px-4 py-3 text-center overflow-visible">
                         <div className="flex items-center justify-center gap-1">
                          {isScoringError && (
                             <div className="group/tooltip relative inline-flex justify-center">
                               <AlertCircle size={18} className="text-red-600 fill-red-50 dark:fill-red-900/20" />
                               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-max max-w-[200px] px-3 py-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 z-50 pointer-events-none transition-opacity shadow-xl whitespace-normal text-left">
                                 Scoring Error: Residual Risk cannot be higher than Inherent Risk
                                 <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                               </div>
                             </div>
                          )}

                          {showMissingActionWarning && !isScoringError && (
                            <div className="group/tooltip relative inline-flex justify-center">
                              <AlertTriangle size={18} className="text-red-500 fill-red-50 dark:fill-red-900/20" />
                              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-max max-w-[200px] px-3 py-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 z-50 pointer-events-none transition-opacity shadow-xl whitespace-normal text-left">
                                High/Moderate Risk without Action Plan
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}

                    {/* 2. My Role Column */}
                    {isVisible('role') && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          {isOwner && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${isClosed ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800'}`}>
                              <UserIcon size={12} /> Owner
                            </span>
                          )}
                          {isCollaborator && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${isClosed ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800'}`}>
                              <Users size={12} /> Collab
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* 3. Country */}
                    {isVisible('country') && (
                      <td className="px-4 py-3 text-center">
                        <div className={`flex justify-center ${isClosed ? 'opacity-50 grayscale' : ''}`}>{getFlag(risk.country)}</div>
                      </td>
                    )}

                    {/* 4. Register */}
                    {isVisible('register') && <td className="px-4 py-3">{risk.register}</td>}

                    {/* 5. ID */}
                    {isVisible('id') && <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{risk.id}</td>}

                    {/* 6. Title */}
                    {isVisible('title') && (
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className={isClosed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}>
                            {risk.title}
                          </span>
                          {isClosed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 uppercase tracking-wide">
                                Closed
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* 7. Function */}
                    {isVisible('functionArea') && <td className="px-4 py-3">{risk.functionArea}</td>}

                    {/* 8. Trend Column */}
                    {isVisible('trend') && (
                      <td className="px-4 py-3 text-center overflow-visible">
                        <div className="flex justify-center">
                          {renderTrendIcon(trend)}
                        </div>
                      </td>
                    )}
                    
                    {/* 9. Inherent Score */}
                    {isVisible('inherentScore') && (
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold w-full ${isClosed ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : iLevel.color}`}>
                          {iScore} - {iLevel.label}
                        </span>
                      </td>
                    )}

                    {/* 10. Controls Rating */}
                    {isVisible('controlsRating') && (
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold w-full ${isClosed ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : controlColor}`}>
                          {risk.controlsRating}
                        </span>
                      </td>
                    )}

                    {/* 11. Residual Score */}
                    {isVisible('residualScore') && (
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold w-full ${isClosed ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : rLevel.color}`}>
                          {rScore} - {rLevel.label}
                        </span>
                      </td>
                    )}

                    {/* 12. Owner */}
                    {isVisible('owner') && (
                      <td className={`px-4 py-3 ${isClosed ? 'text-slate-400 dark:text-slate-500' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}>{risk.owner}</td>
                    )}

                    {/* 13. Status */}
                    {isVisible('status') && (
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isClosed ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400' : 
                          risk.status === 'Open' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          risk.status === 'Updated' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {risk.status}
                        </span>
                      </td>
                    )}

                    {/* 14. Comments Column */}
                    {isVisible('comments') && (
                      <td className="px-4 py-3 text-center">
                        {commentCount > 0 && (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
                            hasNewComments 
                              ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' // High visibility for new
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400' // Muted for old
                          }`}>
                            <MessageSquare size={14} className={hasNewComments ? 'fill-blue-500/20' : ''} />
                            <span className="font-bold text-xs">{commentCount}</span>
                            
                            {/* Only show the pulsing red dot if comments are recent (< 3 days) */}
                            {hasNewComments && (
                              <span className="relative flex h-2 w-2 ml-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    )}

                    {/* 15. Escalation Column */}
                    {isVisible('escalation') && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          {escalationLevels.map(level => (
                            <span key={level} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border whitespace-nowrap ${isClosed ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800'}`}>
                                <ShieldAlert size={10} /> {level}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}

                    {/* 16. Creation Date */}
                    {isVisible('creationDate') && (
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {risk.creationDate}
                      </td>
                    )}

                    {/* 17. Last Review Date */}
                    {isVisible('lastReviewDate') && (
                      <td className="px-4 py-3">
                        {risk.lastReviewDate || '-'}
                      </td>
                    )}

                    {/* 18. Last Reviewer */}
                    {isVisible('lastReviewer') && (
                      <td className="px-4 py-3 text-xs">
                        {risk.lastReviewer}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, risks.length)}</span> of <span className="font-medium">{risks.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskList;
