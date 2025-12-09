
import React, { useState } from 'react';
import { Book, LayoutDashboard, FilePlus, ShieldAlert, Users, CheckCircle, Bot, ArrowRight, List, CheckSquare, BookOpen } from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export const UserGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');

  const sections: GuideSection[] = [
    {
      id: 'intro',
      title: '1. Introduction & Governance',
      icon: <Book size={18} />,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Trident Contract Guard</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Trident Contract Guard is the centralized platform for managing high-value and high-risk contracts across our global entities (Brazil, Congo, Equatorial Guinea, and London).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">System Objectives</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                  <span><strong>Compliance:</strong> Ensure all high-value commitments adhere to the Delegation of Authority (DoA).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                  <span><strong>Visibility:</strong> Provide a single pane of glass for Legal teams to track exposure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                  <span><strong>Efficiency:</strong> Reduce approval turnaround time through automated routing and AI assistance.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">User Roles</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><strong className="text-blue-600 dark:text-blue-400">SCM / Contract Owner:</strong> Initiates contracts, uploads documents, and answer reviewer queries.</li>
                <li><strong className="text-purple-600 dark:text-purple-400">Contracts Lead:</strong> Reviews submissions for technical and commercial validity.</li>
                <li><strong className="text-orange-600 dark:text-orange-400">CEO:</strong> Final approver for contracts flagged as "High Risk".</li>
                <li><strong className="text-slate-600 dark:text-slate-400">Ad-Hoc Reviewer:</strong> Subject Matter Experts invited to consult on specific contracts.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: '2. Dashboard & Navigation',
      icon: <LayoutDashboard size={18} />,
      content: (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Navigating the Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The dashboard is designed to answer three questions immediately: What is pending? What is high risk? Where is the money going?
            </p>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Global vs. Local View</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Use the <strong>Flag Icons</strong> at the top right to filter the entire dashboard by Entity. 
                Selecting "Brazil" will filter KPIs, charts, and the contract register to show only Brazil-related data. 
                Clicking the active flag again resets the view to "Global".
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <List size={18} /> Contract Register Columns
                </h4>
                <ul className="list-disc pl-5 text-sm space-y-2 text-slate-600 dark:text-slate-400">
                  <li><strong>Status:</strong> The current workflow stage (e.g., "Pending CEO Approval").</li>
                  <li><strong>Submitter:</strong> The SCM owner responsible for the contract.</li>
                  <li><strong>Role Column:</strong> Look for the <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">Ad-Hoc</span> badge. This indicates you have been manually invited to review this specific contract, even if you are not in the standard approval chain.</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <CheckSquare size={18} /> Interactive KPIs
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  The KPI cards at the top are also filters.
                </p>
                <ul className="list-disc pl-5 text-sm space-y-2 text-slate-600 dark:text-slate-400">
                  <li>Click <strong>Contracts Under Review</strong> to see only Pending/Submitted items.</li>
                  <li>Click <strong>High Risk Identified</strong> to filter for contracts requiring CEO approval (Orange flag).</li>
                  <li>Clicking a card again resets the filter.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'submission',
      title: '3. Creating a Submission',
      icon: <FilePlus size={18} />,
      content: (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Submission Workflow</h2>
            <p className="text-slate-600 dark:text-slate-300">
              The "New Submission" wizard guides SCM users through 6 steps to ensure data quality before a contract reaches management.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                Step-by-Step Guide
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">General Info</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <strong>Critical:</strong> Enter the Vendor Qualification (DDQ) number. Contracts without a valid DDQ cannot be approved.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Scope & Value (Smart Drafting)</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Select the <strong>Contract Type</strong> (CAPEX, OPEX, or MIXED). This drives the risk logic.
                    </p>
                    <div className="mt-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1 mb-1">
                        <Bot size={14} /> AI Smart Drafter
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Write rough bullet points in the Scope or Background fields (e.g., "Fixing the pipes on the rig"). 
                        Click <strong className="text-purple-600 dark:text-purple-400">Refine with AI</strong>. The system will rewrite it into professional legal language. 
                        You can then <strong>Accept</strong> or <strong>Decline</strong> the suggestion side-by-side.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Evaluation</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Summarize the Tender process. If this is a Sole Source contract, you must justify it here.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Terms & Risk Checklist</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      This is the most critical section.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <li><strong>Liability Cap:</strong> If less than 100%, it triggers a risk flag.</li>
                      <li><strong>Subcontracting:</strong> If &gt;30%, it triggers a risk flag.</li>
                      <li><strong>Manual Checklist:</strong> Select applicable risks (e.g., "Work in Conflict Zone").</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">5</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Documents</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Upload the Final Draft Contract (PDF/Word) and the Pricing Schedule. Max size 10MB per file.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">6</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Pre-Submission Check</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      The system runs a final validation. It will tell you if the contract is <strong>Standard</strong> or <strong>High Risk</strong>.
                      If High Risk, it will explicitly list the reasons (e.g., "CAPEX &gt; USD 5M").
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )
    },
    {
      id: 'risk_logic',
      title: '4. Risk Logic Matrix',
      icon: <ShieldAlert size={18} />,
      content: (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Risk Evaluation Logic</h2>
            <p className="text-slate-600 dark:text-slate-300">
              The system automatically classifies contracts as "High Risk" based on the following triggers. A High Risk classification mandates CEO approval.
            </p>
          </div>

          <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                <tr>
                  <th className="p-4 border-b dark:border-slate-700">Category</th>
                  <th className="p-4 border-b dark:border-slate-700">Trigger Condition</th>
                  <th className="p-4 border-b dark:border-slate-700">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">Financial (OPEX)</td>
                  <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">&gt; $1,000,000 USD</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Material impact on operating budget.</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">Financial (CAPEX)</td>
                  <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">&gt; $5,000,000 USD</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Major capital investment requiring board visibility.</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">Duration</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">&gt; 3 Years</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Long-term lock-in limits strategic flexibility.</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">Liability</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">&lt; 100% of Contract Value</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Exposure exceeds recoverability in case of failure.</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">Third Party</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">Subcontracting &gt; 30%</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Loss of control over quality and HSE standards.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
             <Bot className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
             <div>
               <h4 className="font-bold text-blue-900 dark:text-blue-300">AI Risk Assistant</h4>
               <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                 Beyond the hard rules above, the <strong>Legal & Risk</strong> tab features an AI Assistant. 
                 Clicking "Refresh" sends the contract summary to the Gemini model, which provides a qualitative analysis 
                 of "soft risks" (e.g., ambiguity in scope, conflict of interest potential) that rule-based logic might miss.
               </p>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'reviews',
      title: '5. Approvals & Workflows',
      icon: <CheckCircle size={18} />,
      content: (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Approval Process</h2>
            <p className="text-slate-600 dark:text-slate-300">
              The workflow adapts automatically based on the risk profile of the contract.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-10">
              <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-slate-800 shadow-sm"></span>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Stage 1: Corporate Review</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Upon submission, the contract is locked. Notifications are sent to the Contracts Lead.
                  They can <strong>Request Changes</strong> (sends back to SCM) or <strong>Approve</strong>.
                </p>
              </div>

              <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1 w-4 h-4 bg-orange-500 rounded-full border-4 border-white dark:border-slate-800 shadow-sm"></span>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Stage 2: CEO Approval (High Risk Only)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  If the contract has any High Risk triggers (e.g., CAPEX &gt; $5M), it moves to the "Pending CEO" state after Corporate Review. 
                  The CEO is the final gatekeeper.
                </p>
              </div>
               
              <div className="relative pl-8">
                <span className="absolute -left-[9px] top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 shadow-sm"></span>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Stage 3: Approved</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Once approved, the system logs the final state in the Audit Trail. No further edits are possible.
                </p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-lg border border-purple-200 dark:border-purple-800 mt-6">
              <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                <Users size={18} /> Ad-Hoc Reviewers (Consultation)
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Sometimes you need an expert opinion (e.g., Engineering for technical specs) who is not in the automatic approval chain.
              </p>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-purple-100 dark:border-purple-800/50">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">How to Add:</p>
                <ol className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>Open the Contract.</li>
                  <li>Go to the <strong>Approvals</strong> tab.</li>
                  <li>Select a user from the dropdown and click <strong>Add</strong>.</li>
                </ol>
              </div>
              <p className="text-xs text-purple-800 dark:text-purple-400 mt-2 italic">
                Note: Ad-Hoc reviewers provide comments and a decision (Approve/Reject), but their approval is consultative. 
                It does not mechanically advance the contract status like the CEO's approval does.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <BookOpen size={20} className="text-blue-600 dark:text-blue-400"/> User Guide
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deployment Training v1.0</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`${activeSection === section.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {section.icon}
              </div>
              <span className="flex-1 text-left">{section.title}</span>
              {activeSection === section.id && <ArrowRight size={14} className="opacity-80" />}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-[10px] text-slate-400">
            Need help? Contact <a href="#" className="text-blue-500 hover:underline">IT Support</a>
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto p-8 lg:p-12">
          {activeContent?.content}
        </div>
      </div>
    </div>
  );
};
