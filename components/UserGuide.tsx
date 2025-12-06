
import React, { useState } from 'react';
import { BookOpen, AlertTriangle, Shield, TrendingUp, Users, Target, Activity, FileText, CheckSquare, Sparkles, ChevronRight, LayoutDashboard, Grid2X2, Map, Table, AlertCircle, ArrowUp, ArrowDown, Square, Triangle } from 'lucide-react';

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
          <nav className="space-y-1">
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
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                   <BookOpen size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Getting Started</h2>
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
                             <strong>New Risk:</strong> This item is newly created and still in 'Open' status.
                          </td>
                        </tr>
                        <tr>
                           <td className="px-4 py-2 text-center"><ArrowUp size={18} className="text-red-600 inline" /></td>
                           <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                              <strong>Risk Increased:</strong> The risk score has gone up since the last review.
                           </td>
                        </tr>
                        <tr>
                           <td className="px-4 py-2 text-center"><ArrowDown size={18} className="text-green-600 inline" /></td>
                           <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                              <strong>Risk Decreased:</strong> The risk score has gone down since the last review.
                           </td>
                        </tr>
                        <tr>
                           <td className="px-4 py-2 text-center"><Square size={14} className="text-amber-400 fill-amber-400 inline" /></td>
                           <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                              <strong>Stable:</strong> No change in score since the last review.
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
                                Shows if you are the <span className="text-blue-600 font-bold">Owner</span> (responsible) or a <span className="text-purple-600 font-bold">Collaborator</span> (consulted/informed).
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
                             <td className="px-4 py-2">Lists any higher management levels currently notified about this risk.</td>
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
                      <div className="font-bold text-lg text-slate-800 dark:text-white mt-1">Inherent Impact × Inherent Likelihood</div>
                   </div>
                </div>
                <div>
                   <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Residual Risk</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      The remaining risk level <strong>after</strong> effective controls are applied. This is the "Actual Exposure".
                   </p>
                   <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center">
                      <span className="text-xs font-bold uppercase text-slate-500">Formula</span>
                      <div className="font-bold text-lg text-slate-800 dark:text-white mt-1">Residual Impact × Residual Likelihood</div>
                   </div>
                </div>
             </div>

             <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                   <strong>Golden Rule:</strong> Residual Risk can never be higher than Inherent Risk. If your controls make the risk worse, they are not controls!
                </div>
             </div>
          </section>
        )}

        {/* 4. HEAT MAP */}
        {activeSection === 'risk-heatmap' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                   <Map size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">4. Risk Heat Map</h2>
             </div>

             <p className="text-slate-600 dark:text-slate-300 mb-6">
               The matrix below defines the risk severity levels based on the score (Impact × Likelihood). 
               Refer to this when determining the urgency and management strategy for your risks.
             </p>

             {/* VISUAL MATRIX */}
             <div className="overflow-x-auto mb-8">
                <table className="w-full min-w-[500px] border-collapse text-center text-sm">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="border border-slate-300 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300"></th>
                      <th colSpan={5} className="border border-slate-300 bg-slate-100 dark:bg-slate-800 p-2 font-bold text-slate-700 dark:text-slate-200">Likelihood</th>
                    </tr>
                    <tr className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <th className="border border-slate-300 p-2 w-[18%]">1 - Extremely Remote</th>
                      <th className="border border-slate-300 p-2 w-[18%]">2 - Remote</th>
                      <th className="border border-slate-300 p-2 w-[18%]">3 - Unlikely</th>
                      <th className="border border-slate-300 p-2 w-[18%]">4 - Likely</th>
                      <th className="border border-slate-300 p-2 w-[18%]">5 - Frequent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 5 - Catastrophic */}
                    <tr>
                      <td className="border border-slate-300 bg-slate-50 dark:bg-slate-800 font-semibold p-2 text-left text-xs">
                        <span className="block font-bold">5 - Catastrophic</span>
                      </td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">5</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">10</td>
                      <td className="border border-slate-300 bg-red-600 text-white font-bold p-3">15</td>
                      <td className="border border-slate-300 bg-red-600 text-white font-bold p-3">20</td>
                      <td className="border border-slate-300 bg-red-600 text-white font-bold p-3">25</td>
                    </tr>
                     {/* Row 4 - Severe */}
                     <tr>
                      <td className="border border-slate-300 bg-slate-50 dark:bg-slate-800 font-semibold p-2 text-left text-xs">
                        <span className="block font-bold">4 - Severe</span>
                      </td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">4</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">8</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">12</td>
                      <td className="border border-slate-300 bg-red-600 text-white font-bold p-3">16</td>
                      <td className="border border-slate-300 bg-red-600 text-white font-bold p-3">20</td>
                    </tr>
                     {/* Row 3 - Average */}
                     <tr>
                      <td className="border border-slate-300 bg-slate-50 dark:bg-slate-800 font-semibold p-2 text-left text-xs">
                        <span className="block font-bold">3 - Average</span>
                      </td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">3</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">6</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">9</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">12</td>
                      <td className="border border-slate-300 bg-red-600 text-white font-bold p-3">15</td>
                    </tr>
                     {/* Row 2 - Marginal */}
                     <tr>
                      <td className="border border-slate-300 bg-slate-50 dark:bg-slate-800 font-semibold p-2 text-left text-xs">
                        <span className="block font-bold">2 - Marginal</span>
                      </td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">2</td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">4</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">6</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">8</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">10</td>
                    </tr>
                     {/* Row 1 - Negligible */}
                     <tr>
                      <td className="border border-slate-300 bg-slate-50 dark:bg-slate-800 font-semibold p-2 text-left text-xs">
                        <span className="block font-bold">1 - Negligible</span>
                      </td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">1</td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">2</td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">3</td>
                      <td className="border border-slate-300 bg-green-500 text-white font-bold p-3">4</td>
                      <td className="border border-slate-300 bg-yellow-400 text-slate-900 font-bold p-3">5</td>
                    </tr>
                  </tbody>
                </table>
             </div>

             {/* LEGEND / DEFINITIONS */}
             <div className="space-y-4">
                <div className="flex flex-col md:flex-row border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900 rounded-lg overflow-hidden">
                   <div className="bg-red-600 text-white p-4 w-full md:w-48 flex-shrink-0 flex items-center justify-center font-bold text-center">
                      Significant Risk<br/>(Not Tolerable)
                   </div>
                   <div className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      Active management and Continuous monitoring. Risks where current treatment options require active review and 
                      Immediate risk mitigation strategy required to reduce the level of risk or cease the activity.
                   </div>
                </div>

                <div className="flex flex-col md:flex-row border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900 rounded-lg overflow-hidden">
                   <div className="bg-yellow-400 text-slate-900 p-4 w-full md:w-48 flex-shrink-0 flex items-center justify-center font-bold text-center">
                      Moderate Risk
                   </div>
                   <div className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      Periodic monitoring. Controls are not strong, but risk impact is not very high. 
                      Options to improve control or monitor risk impact to ensure it does not increase over time.
                   </div>
                </div>

                <div className="flex flex-col md:flex-row border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900 rounded-lg overflow-hidden">
                   <div className="bg-green-600 text-white p-4 w-full md:w-48 flex-shrink-0 flex items-center justify-center font-bold text-center">
                      Low Risk<br/>(Tolerable)
                   </div>
                   <div className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      Risk where systems and processes managing the risks are adequate and subject to minimal monitoring, correction and optimization.
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
             
             <p className="text-slate-600 dark:text-slate-400 mb-6">
                Controls are the processes, policies, or physical devices that act to minimize the risk.
             </p>

             <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                         <tr>
                            <th className="px-4 py-2">Control Rating</th>
                            <th className="px-4 py-2">Definition</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                         <tr>
                            <td className="px-4 py-2 font-bold text-green-600">Excellent / Good</td>
                            <td className="px-4 py-2">Controls are robust, documented, and tested regularly.</td>
                         </tr>
                         <tr>
                            <td className="px-4 py-2 font-bold text-amber-600">Fair</td>
                            <td className="px-4 py-2">Controls exist but effectiveness is inconsistent or undocumented.</td>
                         </tr>
                         <tr>
                            <td className="px-4 py-2 font-bold text-red-600">Poor / Unsatisfactory</td>
                            <td className="px-4 py-2">Controls are weak, manual, or non-existent.</td>
                         </tr>
                      </tbody>
                   </table>
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
                Escalation ensures that risks exceeding local appetite are visible to senior leadership.
             </p>

             <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                   <h3 className="font-bold text-slate-800 dark:text-white mb-4">How to Escalate</h3>
                   <ol className="list-decimal list-inside space-y-3 text-slate-600 dark:text-slate-300 text-sm">
                      <li>Navigate to the <strong>Escalation</strong> tab inside a risk.</li>
                      <li>Identify the appropriate authority level (e.g., <em>Country Manager Escalation</em>).</li>
                      <li>Toggle the <strong>checkbox</strong> next to that level.</li>
                      <li>The system will automatically assign the risk to the default authority (e.g., the specific Country Manager for that region).</li>
                      <li>The risk will now appear on that manager's "My Escalations" dashboard.</li>
                   </ol>
                </div>

                <div>
                   <h3 className="font-bold text-slate-800 dark:text-white mb-2">Hierarchy of Authority</h3>
                   <div className="flex flex-col gap-2">
                      {['Functional Manager', 'TEML Functional Review', 'TEML Leadership Team', 'Country Manager', 'Corporate Risk Profile'].map((level, idx) => (
                         <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 text-sm z-10">
                               {idx + 1}
                            </div>
                            <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{level}</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </section>
        )}

         {/* 7. Action Plans */}
         {activeSection === 'action-plans' && (
           <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-lg text-pink-600 dark:text-pink-400">
                   <CheckSquare size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">7. Action Plans</h2>
             </div>

             <p className="text-slate-600 dark:text-slate-300 mb-4">
                If the Residual Risk is higher than acceptable (Moderate or Significant), an <strong>Action Plan</strong> is mandatory.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-white block mb-1">Specific</span>
                    <span className="text-xs text-slate-500">Clear deliverables</span>
                 </div>
                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-white block mb-1">Owner</span>
                    <span className="text-xs text-slate-500">Assigned individual</span>
                 </div>
                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-white block mb-1">Due Date</span>
                    <span className="text-xs text-slate-500">Deadline for completion</span>
                 </div>
             </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default UserGuide;
