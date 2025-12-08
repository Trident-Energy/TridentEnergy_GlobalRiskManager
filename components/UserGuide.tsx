


import React, { useState } from 'react';
import { BookOpen, AlertTriangle, Shield, TrendingUp, Target, Activity, CheckSquare, Sparkles, ChevronRight, LayoutDashboard, Grid2X2, Map, Table, AlertCircle, ArrowUp, ArrowDown, Square, Triangle } from 'lucide-react';

const UserGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: <BookOpen size={16} /> },
    { id: 'main-grid', label: '1. Main Grid Reference', icon: <Table size={16} /> },
    { id: 'risk-identification', label: '2. Identification', icon: <Target size={16} /> },
    { id: 'risk-scoring', label: '3. Scoring Matrix', icon: <Activity size={16} /> },
    { id: 'risk-heatmap', label: '4. Risk Heat Map', icon: <Map size={16} /> },
    { id: 'controls-mitigation', label: '5. Controls & Mitigation', icon: <Shield size={16} /> },
    { id: 'escalation-protocol', label: '6. Escalation Protocol', icon: <TrendingUp size={16} /> },
    { id: 'action-plans', label: '7. Action Plans', icon: <CheckSquare size={16} /> },
  ];

  return (
    <div className="flex h-full gap-6 animate-fade-in pb-12 items-start">
      {/* Sidebar Navigation - Sticky and Fixed Height */}
      <div className="w-64 flex-shrink-0 hidden md:block sticky top-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 px-2">Table of Contents</h3>
          <nav className="space-y-1 mb-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {section.icon}
                <span className="truncate">{section.label}</span>
                {activeSection === section.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area - Displays only the active section */}
      <div className="flex-1 max-w-4xl min-h-[500px]">
        
        {/* Intro Section */}
        {activeSection === 'getting-started' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                     <BookOpen size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Getting Started</h2>
               </div>
             </div>
             <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Welcome to the Global Risk Manager tool. This platform is designed to help our organization identify, assess, and mitigate risks across all global operations (UK, Brazil, Equatorial Guinea, Congo).
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                   <h4 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200 mb-2">
                      <LayoutDashboard size={16} /> Dashboard
                   </h4>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Your command center. View Key Performance Indicators (KPIs), filter risks by category, and access your "My Ownership" quick list.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                   <h4 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200 mb-2">
                      <Grid2X2 size={16} /> Risk Heatmap
                   </h4>
                   <p className="text-sm text-slate-500 dark:text-slate-400">A visual matrix (5x5) displaying risks based on Impact vs. Likelihood. Click any cell to filter the list below.</p>
                </div>
             </div>

             <div className="mt-8">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">User Roles & Access Permissions</h3>
               <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs">
                     <tr>
                       <th className="px-4 py-3">User Role</th>
                       <th className="px-4 py-3">View Scope</th>
                       <th className="px-4 py-3">Edit Permissions</th>
                       <th className="px-4 py-3">Delete</th>
                       <th className="px-4 py-3">Admin</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                     <tr>
                       <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">RMIA</td>
                       <td className="px-4 py-3"><strong>Global Access.</strong> Can view all risks, comments, and actions across all countries.</td>
                       <td className="px-4 py-3">Can edit any risk.</td>
                       <td className="px-4 py-3"><strong>Yes.</strong> Exclusive right to delete risks.</td>
                       <td className="px-4 py-3">User Management, Global Reset Cycles.</td>
                     </tr>
                     <tr>
                       <td className="px-4 py-3 font-bold text-orange-600 dark:text-orange-400">Country Manager</td>
                       <td className="px-4 py-3"><strong>Restricted.</strong> Views risks escalated to them, plus risks they own or collaborate on.</td>
                       <td className="px-4 py-3">Can edit owned/assigned risks.</td>
                       <td className="px-4 py-3">No.</td>
                       <td className="px-4 py-3">None.</td>
                     </tr>
                     <tr>
                       <td className="px-4 py-3 font-bold text-cyan-600 dark:text-cyan-400">Functional Manager</td>
                       <td className="px-4 py-3"><strong>Restricted.</strong> Views risks escalated to them, plus risks they own or collaborate on.</td>
                       <td className="px-4 py-3">Can edit owned/assigned risks.</td>
                       <td className="px-4 py-3">No.</td>
                       <td className="px-4 py-3">None.</td>
                     </tr>
                     <tr>
                       <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">Manager</td>
                       <td className="px-4 py-3"><strong>Personal.</strong> Views only risks they Own or are listed as a Collaborator.</td>
                       <td className="px-4 py-3">Can edit owned risks.</td>
                       <td className="px-4 py-3">No.</td>
                       <td className="px-4 py-3">None.</td>
                     </tr>
                     <tr>
                       <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">CEO / TEML Leadership</td>
                       <td className="px-4 py-3"><strong>Oversight.</strong> Views risks escalated to the corporate level.</td>
                       <td className="px-4 py-3">Can edit owned risks.</td>
                       <td className="px-4 py-3">No.</td>
                       <td className="px-4 py-3">None.</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>
          </section>
        )}

        {/* 1. Main Grid Reference */}
        {activeSection === 'main-grid' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                   <Table size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">1. Main Grid Reference</h2>
             </div>

             <p className="text-slate-600 dark:text-slate-300 mb-6">
                The main risk table provides a comprehensive view of all risks. Below is a guide to the columns and visual indicators used.
             </p>

             <div className="space-y-8">
                {/* Visual Indicators Table */}
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-slate-500" /> Visual Icons & Warnings
                  </h3>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                        <tr>
                          <th className="px-4 py-2 w-16 text-center">Icon</th>
                          <th className="px-4 py-2">Meaning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="px-4 py-2 text-center"><AlertTriangle size={18} className="text-red-500 inline" /></td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                             <strong>Missing Action Plan:</strong> The risk is rated Moderate or Significant but has no open action plan assigned.
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-center"><AlertCircle size={18} className="text-red-600 inline" /></td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                             <strong>Scoring Error:</strong> The Residual Risk score is higher than the Inherent Risk score (which is logically impossible).
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-center"><Triangle size={16} className="text-purple-600 fill-purple-600 inline" /></td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                             <strong>New Risk:</strong> This item is newly created and has no baseline from the previous Review Cycle.
                          </td>
                        </tr>
                        <tr>
                           <td className="px-4 py-2 text-center"><ArrowUp size={18} className="text-red-600 inline" /></td>
                           <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                              <strong>Risk Increased:</strong> The risk score has gone up compared to the previous Review Cycle snapshot.
                           </td>
                        </tr>
                        <tr>
                           <td className="px-4 py-2 text-center"><ArrowDown size={18} className="text-green-600 inline" /></td>
                           <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                              <strong>Risk Decreased:</strong> The risk score has gone down compared to the previous Review Cycle snapshot.
                           </td>
                        </tr>
                        <tr>
                           <td className="px-4 py-2 text-center"><Square size={14} className="text-amber-400 fill-amber-400 inline" /></td>
                           <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                              <strong>Stable:</strong> No change in score since the last Review Cycle.
                           </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Key Columns Table */}
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <LayoutDashboard size={18} className="text-slate-500" /> Key Column Definitions
                  </h3>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                         <tr>
                           <th className="px-4 py-2 w-40">Column</th>
                           <th className="px-4 py-2">Description</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                          <tr>
                             <td className="px-4 py-2 font-bold">My Role</td>
                             <td className="px-4 py-2">
                                Shows if you are the <span className="text-blue-600 font-bold">Owner</span>, a <span className="text-purple-600 font-bold">Collaborator</span>, or a <span className="text-orange-600 font-bold">Reviewer</span> (risk escalated to you).
                             </td>
                          </tr>
                          <tr>
                             <td className="px-4 py-2 font-bold">Risk Register</td>
                             <td className="px-4 py-2">The specific departmental or asset register the risk belongs to (e.g., "BR Asset", "Supply Chain").</td>
                          </tr>
                          <tr>
                             <td className="px-4 py-2 font-bold">Residual Score</td>
                             <td className="px-4 py-2">The current risk rating (1-25) colored by severity (Green/Yellow/Red).</td>
                          </tr>
                          <tr>
                             <td className="px-4 py-2 font-bold">Status</td>
                             <td className="px-4 py-2">
                                <span className="text-blue-600 font-bold">Open</span>: Active, needs review.<br/>
                                <span className="text-amber-600 font-bold">Updated</span>: Recently modified.<br/>
                                <span className="text-emerald-600 font-bold">Reviewed</span>: Confirmed as current.<br/>
                                <span className="text-slate-400 font-bold">Closed</span>: Archived/No longer a risk.
                             </td>
                          </tr>
                          <tr>
                             <td className="px-4 py-2 font-bold">Escalation</td>
                             <td className="px-4 py-2">Lists the highest management level currently notified about this risk.</td>
                          </tr>
                       </tbody>
                     </table>
                  </div>
                </div>
             </div>
          </section>
        )}

        {/* 2. Identification */}
        {activeSection === 'risk-identification' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                   <Target size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">2. Risk Identification</h2>
             </div>
             
             <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">The Description Formula</h3>
                <p className="text-slate-600 dark:text-slate-300">
                   To ensure clarity and consistency, all risk descriptions must follow this standard structure:
                </p>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-r-lg my-4">
                   <p className="font-mono text-sm md:text-base text-purple-900 dark:text-purple-100 font-semibold">
                      "There is a risk that <span className="underline decoration-wavy">[EVENT]</span>, caused by <span className="underline decoration-wavy">[CAUSE]</span>, which may result in <span className="underline decoration-wavy">[IMPACT]</span>."
                   </p>
                </div>

                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-2 ml-2">
                   <li><strong>Event:</strong> What might happen? (The uncertainty)</li>
                   <li><strong>Cause:</strong> What triggers this event? (Root cause)</li>
                   <li><strong>Impact:</strong> What is the consequence? (Financial, Reputational, Safety)</li>
                </ul>

                <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                   <Sparkles size={16} className="text-purple-500" />
                   <span><strong>Pro Tip:</strong> Use the "Improve with AI" button in the risk form to automatically rewrite your draft into this format.</span>
                </div>

                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                   <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Principal Risks</h4>
                   <p className="text-sm text-slate-600 dark:text-slate-400">
                      When selecting a <strong>Risk Category</strong> (e.g., Operational, Financial), the system will filter and display the relevant <strong>Principal Risks</strong>. Select the one that best aligns with your identified risk to ensure accurate corporate reporting.
                   </p>
                </div>
             </div>
          </section>
        )}

        {/* 3. Scoring */}
        {activeSection === 'risk-scoring' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                   <Activity size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">3. Scoring Matrix</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Inherent Risk</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      The risk level in its raw state, <strong>before</strong> considering any controls. This represents the "Worst Case Scenario".
                   </p>
                   <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center">
                      <span className="text-xs font-bold uppercase text-slate-500">Formula</span>
                      <div className="text-lg font-mono font-bold text-slate-800 dark:text-white mt-1">Impact × Likelihood = Risk Score</div>
                   </div>
                </div>

                <div>
                   <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Residual Risk</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      The remaining risk level <strong>after</strong> applying controls. This is your actual current exposure.
                   </p>
                </div>
             </div>

             <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500 mt-8">
                <h4 className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-1">
                    <Sparkles size={16} /> The Golden Rule
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300 italic mb-2">
                    "The Residual Risk Score (Net Risk) <strong>cannot be higher</strong> than the Inherent Risk Score (Gross Risk)."
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                    Controls are designed to reduce risk. If the system detects a Residual Score higher than the Inherent Score, it will flag an error and prevent you from saving the record.
                </p>
            </div>
          </section>
        )}

        {/* 4. Heat Map */}
        {activeSection === 'risk-heatmap' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                   <Map size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">4. Risk Heat Map</h2>
             </div>

             <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300">
                   Risks are visualized on a 5x5 matrix. The score determines the color urgency.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">Low (1-4)</div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">Acceptable risk. Monitor periodically.</p>
                   </div>
                   <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
                      <div className="text-yellow-600 dark:text-yellow-400 font-bold mb-1">Moderate (5-12)</div>
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">ALARP (As Low As Reasonably Practicable). Action plan required.</p>
                   </div>
                   <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
                      <div className="text-red-600 dark:text-red-400 font-bold mb-1">Significant (15-25)</div>
                      <p className="text-xs text-red-800 dark:text-red-300">Unacceptable. Immediate mitigation and escalation mandatory.</p>
                   </div>
                </div>
             </div>
          </section>
        )}

        {/* 5. Controls */}
        {activeSection === 'controls-mitigation' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                   <Shield size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">5. Controls & Mitigation</h2>
             </div>
             
             <p className="text-slate-600 dark:text-slate-300 mb-4">
                Controls are the barriers you put in place to lower the likelihood or impact of a risk.
             </p>

             <ul className="space-y-3 mb-6">
               <li className="flex items-start gap-2">
                 <CheckSquare size={16} className="text-green-500 mt-1" />
                 <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Excellent (5):</strong> Robust, documented, automated, and tested regularly.</span>
               </li>
               <li className="flex items-start gap-2">
                 <CheckSquare size={16} className="text-green-500 mt-1" />
                 <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Good (4):</strong> Effective but may have minor documentation gaps.</span>
               </li>
               <li className="flex items-start gap-2">
                 <CheckSquare size={16} className="text-yellow-500 mt-1" />
                 <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Fair (3):</strong> Controls exist but effectiveness is inconsistent.</span>
               </li>
               <li className="flex items-start gap-2">
                 <CheckSquare size={16} className="text-red-500 mt-1" />
                 <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Poor/Unsatisfactory (1-2):</strong> Weak, manual, or non-existent controls.</span>
               </li>
             </ul>

             <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="font-bold text-slate-800 dark:text-white">New: Granular Controls & Star Ratings</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                    We have moved away from free-text blocks. You can now:
                </p>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-2 ml-2">
                    <li><strong>Add Individual Controls:</strong> List specific barriers (e.g., "Firewall", "Insurance", "Training").</li>
                    <li><strong>Star Rating (1-5):</strong> Rate the effectiveness of <em>each</em> control individually using the star system.</li>
                    <li><strong>Auto-Averaging:</strong> The system automatically calculates the <strong>Overall Controls Rating</strong> based on the average of your individual items.</li>
                </ul>
                
                <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                     <Activity size={16} className="text-blue-500" />
                     <span><strong>Tip:</strong> You can manually override the calculated average if the mathematical average doesn't reflect the true mitigation strength (e.g., one "Excellent" control outweighs three "Poor" ones).</span>
                </div>
            </div>
          </section>
        )}

        {/* 6. Escalation */}
        {activeSection === 'escalation-protocol' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
                   <TrendingUp size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">6. Escalation Protocol</h2>
             </div>

             <p className="text-slate-600 dark:text-slate-300 mb-6">
                Escalation is required when a risk exceeds the risk appetite of the current management level or requires resources outside the current budget to mitigate.
             </p>

             <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Levels of Authority</h4>
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Functional Manager Escalation</span>
                   </div>
                   <div className="w-0.5 h-4 bg-slate-300 ml-4"></div>
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">2</div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">TEML Functional Review</span>
                   </div>
                   <div className="w-0.5 h-4 bg-slate-300 ml-4"></div>
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">3</div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Country Manager Escalation</span>
                   </div>
                   <div className="w-0.5 h-4 bg-slate-300 ml-4"></div>
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">4</div>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-bold">TEML Leadership / Corporate Risk Profile</span>
                   </div>
                </div>
             </div>
          </section>
        )}

        {/* 7. Action Plans */}
        {activeSection === 'action-plans' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                   <CheckSquare size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">7. Action Plans</h2>
             </div>
             
             <p className="text-slate-600 dark:text-slate-300 mb-4">
                Action Plans are tasks designed to treat a risk (reduce likelihood or impact).
             </p>

             <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1">Requirement Rule</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                   Any risk rated as <strong>Moderate</strong> or <strong>Significant</strong> MUST have at least one active Action Plan.
                </p>
             </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default UserGuide;