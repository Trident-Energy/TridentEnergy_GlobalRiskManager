
import React, { useState, useEffect } from 'react';
import { User, ContractData, ContractStatus, ContractDocument } from '../types';
import { evaluateRisk } from '../utils/riskLogic';
import { formatEmailBody, triggerEmailNotification } from '../utils/notificationUtils';
import { refineContractText } from '../services/geminiService';
import { EXCHANGE_RATES } from '../constants';
import { Save, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, Upload, File as FileIcon, X, Lock, FileEdit, Sparkles, Loader2 } from 'lucide-react';

interface NewSubmissionProps {
  user: User;
  initialData?: ContractData | null;
  onSubmit: (contract: ContractData) => void;
  onCancel: () => void;
}

const TABS = [
  'General Info',
  'Scope & Summary',
  'Evaluation',
  'T&Cs & Risks',
  'Documents',
  'Review'
];

export const NewSubmission: React.FC<NewSubmissionProps> = ({ user, initialData, onSubmit, onCancel }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ContractData>>({
    entity: user.entity,
    submitterId: user.id,
    status: ContractStatus.SUBMITTED,
    contractType: 'OPEX',
    amount: 0,
    currency: 'USD',
    originalAmount: 0,
    originalCurrency: 'USD',
    exchangeRate: 1.0,
    liabilityCapPercent: 100,
    subcontractingPercent: 0,
    hasExtensionOptions: false,
    isStandardTerms: true,
    isSubcontracting: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    documents: [],
    comments: [],
    reviews: [],
    aiRiskAnalysis: undefined,
    ddqNumber: '',
    ddqDate: '',
    ddqValidityDate: '',
    otherChecksDetails: '',
    title: '',
    project: ''
  });

  const [manualTriggerIds, setManualTriggerIds] = useState<Set<string>>(new Set());
  const [amountDisplay, setAmountDisplay] = useState('');
  
  // AI Refining States
  const [isRefiningScope, setIsRefiningScope] = useState(false);
  const [isRefiningBackground, setIsRefiningBackground] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ field: 'scopeOfWork' | 'backgroundNeed', text: string } | null>(null);
  
  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData,
        originalAmount: initialData.originalAmount || initialData.amount,
        originalCurrency: initialData.originalCurrency || 'USD',
        exchangeRate: initialData.exchangeRate || 1.0
      }); 
      
      // Re-hydrate manual triggers
      const triggers = initialData.detectedTriggers || [];
      const manualIds = new Set<string>();
      triggers.forEach(t => {
        if (t.triggered) manualIds.add(t.id);
      });
      setManualTriggerIds(manualIds);

      // Initialize amount display
      const amt = initialData.originalAmount || initialData.amount || 0;
      setAmountDisplay(amt.toLocaleString('en-US'));
    }
  }, [initialData]);

  const [riskAssessment, setRiskAssessment] = useState(evaluateRisk(formData));

  // Update risk assessment whenever form data or manual triggers change
  useEffect(() => {
    const autoAssessment = evaluateRisk(formData);
    
    // Merge auto triggers with manual selections
    const finalTriggers = autoAssessment.triggers.map(t => {
      // If it's manual and checked by user, set to true. 
      // If it's auto (logic-based), keep the logic result.
      if (manualTriggerIds.has(t.id)) {
        return { ...t, triggered: true };
      }
      return t;
    });

    const isHighRisk = finalTriggers.some(t => t.triggered);
    setRiskAssessment({ isHighRisk, triggers: finalTriggers });
  }, [formData, manualTriggerIds]);

  const handleChange = (field: keyof ContractData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, TABS.length - 1));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  // Currency & Amount Logic
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    const newRate = EXCHANGE_RATES[newCurrency] || 1.0;
    const originalAmt = formData.originalAmount || 0;
    
    // Auto calculate USD amount
    const usdAmount = originalAmt * newRate;

    setFormData(prev => ({ 
      ...prev, 
      originalCurrency: newCurrency, 
      exchangeRate: newRate,
      amount: usdAmount
    }));
  };

  const handleOriginalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove non-numeric except dot
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    setAmountDisplay(cleanValue);
    
    const numberValue = parseFloat(cleanValue);
    const validNumber = isNaN(numberValue) ? 0 : numberValue;
    const rate = formData.exchangeRate || 1.0;

    setFormData(prev => ({ 
      ...prev, 
      originalAmount: validNumber,
      amount: validNumber * rate 
    }));
  };

  const handleAmountBlur = () => {
    const val = formData.originalAmount || 0;
    setAmountDisplay(val.toLocaleString('en-US', { maximumFractionDigits: 2 }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newDoc: ContractDocument = {
          id: Math.random().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: Date.now(),
          base64: base64
        };
        
        setFormData(prev => ({
          ...prev,
          documents: [...(prev.documents || []), newDoc]
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== id)
    }));
  };

  const toggleManualTrigger = (id: string) => {
    setManualTriggerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // AI Refine Handlers
  const handleRefineScope = async () => {
    if (!formData.scopeOfWork || formData.scopeOfWork.length < 5) return;
    setIsRefiningScope(true);
    const polished = await refineContractText(formData.scopeOfWork, 'scope');
    setIsRefiningScope(false);
    setAiSuggestion({ field: 'scopeOfWork', text: polished });
  };

  const handleRefineBackground = async () => {
    if (!formData.backgroundNeed || formData.backgroundNeed.length < 5) return;
    setIsRefiningBackground(true);
    const polished = await refineContractText(formData.backgroundNeed, 'background');
    setIsRefiningBackground(false);
    setAiSuggestion({ field: 'backgroundNeed', text: polished });
  };

  const handleSubmit = (status: ContractStatus) => {
    const isEdit = !!initialData;
    
    // If editing, preserve ID and Audit Trail. If new, generate.
    let newAuditEntry = {
      id: Math.random().toString(),
      timestamp: Date.now(),
      userId: user.id,
      userName: user.name,
      action: status === ContractStatus.DRAFT ? 'Saved as Draft' : (isEdit ? 'Resubmitted Contract' : 'Submitted Contract')
    };

    const finalData = {
      ...formData,
      id: formData.id || `CNT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      submissionDate: formData.submissionDate || Date.now(),
      status: status,
      detectedTriggers: riskAssessment.triggers,
      isHighRisk: riskAssessment.isHighRisk,
      auditTrail: isEdit ? [...(formData.auditTrail || []), newAuditEntry] : [newAuditEntry],
      comments: formData.comments || [],
      reviews: formData.reviews || [],
      corporateApprovals: formData.corporateApprovals || {}
    } as ContractData;
    
    // NOTIFY: If submitted (not draft), trigger email
    if (status === ContractStatus.SUBMITTED) {
      const emailBody = formatEmailBody(finalData);
      const recipient = "Corporate Review Team";
      const subject = `NEW SUBMISSION: Review Required - ${finalData.contractorName}`;
      
      triggerEmailNotification(recipient, subject, emailBody);
      
      finalData.auditTrail.push({
        id: Math.random().toString(),
        timestamp: Date.now() + 1,
        userId: 'system',
        userName: 'System',
        action: 'Email Notification Sent',
        details: `Sent to ${recipient}: ${subject}`
      });
    }

    onSubmit(finalData);
  };

  const inputClass = "mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 p-2 border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  // Group triggers for display
  const groupedTriggers = riskAssessment.triggers.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof riskAssessment.triggers>);

  // Define IDs that are system controlled (auto-detected) so we can disable them or style them differently
  const SYSTEM_TRIGGER_IDS = ['t1', 't2', 't3', 't4', 't5'];

  return (
    <div className="max-w-[96%] mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header / Stepper */}
      <div 
        className="text-white p-6"
        style={{ backgroundColor: 'rgb(50, 90, 120)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Contract' : 'New High-Risk Contract Submission'}</h2>
          {initialData && (
             <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
               Editing: {initialData.id}
             </span>
          )}
        </div>
        <div className="flex space-x-2">
          {TABS.map((tab, idx) => (
            <button 
              key={idx} 
              onClick={() => setStep(idx)}
              className={`flex-1 h-2 rounded-full transition-all cursor-pointer hover:brightness-110 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 ${idx <= step ? 'bg-blue-500' : 'bg-slate-700'}`} 
              aria-label={`Go to ${tab}`}
              title={tab}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-200 font-medium tracking-wide uppercase">
          {TABS.map((tab, idx) => (
            <button 
              key={idx} 
              onClick={() => setStep(idx)}
              className={`hover:text-blue-100 transition-colors focus:outline-none ${idx === step ? 'text-white font-bold' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
        {step === 0 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">Company & Contractor Details</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Entity</label>
                <input type="text" value={formData.entity} disabled className={`${inputClass} bg-slate-100 dark:bg-slate-700 opacity-70`} />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input type="text" className={inputClass} 
                  value={formData.department || ''} onChange={e => handleChange('department', e.target.value)} />
              </div>
              
              <div className="col-span-2">
                <label className={labelClass}>Contract Title</label>
                <input type="text" placeholder="e.g. Drilling Support Services Campaign 2024" className={inputClass} 
                  value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} />
              </div>

              {/* New Project Field */}
              <div className="col-span-2">
                 <label className={labelClass}>Project (Optional)</label>
                 <input type="text" placeholder="e.g. Block G Infill Drilling" className={inputClass}
                   value={formData.project || ''} onChange={e => handleChange('project', e.target.value)} />
              </div>

              <div className="col-span-2">
                <label className={labelClass}>Contractor Name</label>
                <input type="text" className={inputClass} 
                  value={formData.contractorName || ''} onChange={e => handleChange('contractorName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>SAP Number (Optional)</label>
                <input type="text" className={inputClass} 
                  value={formData.sapNumber || ''} onChange={e => handleChange('sapNumber', e.target.value)} />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4 pt-4">Vendor Qualification</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                 <label className={labelClass}>DDQ Number</label>
                 <input type="text" placeholder="e.g. REEU3P-xxxxx" className={inputClass}
                   value={formData.ddqNumber || ''} onChange={e => handleChange('ddqNumber', e.target.value)} />
              </div>
              <div>
                 <label className={labelClass}>DDQ Approved Date</label>
                 <input type="date" className={inputClass}
                   value={formData.ddqDate || ''} onChange={e => handleChange('ddqDate', e.target.value)} />
              </div>
               <div>
                 <label className={labelClass}>DDQ Validity Date</label>
                 <input type="date" className={inputClass}
                   value={formData.ddqValidityDate || ''} onChange={e => handleChange('ddqValidityDate', e.target.value)} />
              </div>
              <div className="col-span-2">
                 <label className={labelClass}>Other Checks Performed (Financial, Technical, QHSE)</label>
                 <textarea rows={3} placeholder="Provide details of other checks performed..." className={inputClass}
                   value={formData.otherChecksDetails || ''} onChange={e => handleChange('otherChecksDetails', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">Scope, Timing & Value</h3>
            <div className="grid grid-cols-2 gap-8">
              
              {/* Contract Type Selection */}
              <div>
                 <label className={labelClass}>Contract Classification (Type)</label>
                 <select 
                   className={inputClass}
                   value={formData.contractType || 'OPEX'}
                   onChange={(e) => handleChange('contractType', e.target.value)}
                 >
                   <option value="OPEX">OPEX (Operational Expenditure)</option>
                   <option value="CAPEX">CAPEX (Capital Expenditure)</option>
                   <option value="MIXED">MIXED (CAPEX & OPEX)</option>
                 </select>
                 <p className="text-xs text-slate-500 mt-1">Classification affects risk thresholds (OPEX &gt; 1M, CAPEX &gt; 5M).</p>
              </div>

               {/* Dates - Moved Up */}
               <div>
                <label className={labelClass}>Duration</label>
                <div className="flex gap-2">
                   <div className="flex-1">
                      <input type="date" title="Start Date" className={inputClass} 
                        value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
                   </div>
                   <div className="flex-1">
                      <input type="date" title="End Date" className={inputClass} 
                        value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} />
                   </div>
                </div>
              </div>

               {/* Dual Currency Input Section */}
               <div className="col-span-2 grid grid-cols-2 gap-8 bg-slate-100 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div>
                    <label className={labelClass}>Contract Amount (Original Currency)</label>
                    <div className="flex gap-2">
                       <select 
                          className={`${inputClass} w-24`}
                          value={formData.originalCurrency || 'USD'}
                          onChange={handleCurrencyChange}
                       >
                         {Object.keys(EXCHANGE_RATES).map(curr => (
                           <option key={curr} value={curr}>{curr}</option>
                         ))}
                       </select>
                       <div className="relative flex-1">
                          <input 
                            type="text" 
                            className={inputClass} 
                            value={amountDisplay} 
                            onChange={handleOriginalAmountChange}
                            onBlur={handleAmountBlur}
                            placeholder="0.00"
                          />
                       </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>USD Equivalent (Auto-Calculated)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-500 pointer-events-none">$</span>
                      <input 
                        type="text" 
                        disabled
                        className={`${inputClass} pl-7 pr-12 bg-slate-200 dark:bg-slate-800 cursor-not-allowed font-mono font-bold`} 
                        value={formData.amount?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '0.00'} 
                      />
                      <span className="absolute right-3 top-3 text-slate-500 font-bold pointer-events-none text-xs">USD</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Exchange Rate: 1 {formData.originalCurrency} = {formData.exchangeRate} USD
                    </p>
                  </div>
               </div>
              
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass}>Scope of Work</label>
                  {!aiSuggestion || aiSuggestion.field !== 'scopeOfWork' ? (
                    <button 
                      onClick={handleRefineScope}
                      disabled={isRefiningScope || !formData.scopeOfWork}
                      className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-800 disabled:opacity-50 transition-colors"
                    >
                      {isRefiningScope ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {isRefiningScope ? 'Polishing...' : 'Refine with AI'}
                    </button>
                  ) : null}
                </div>
                
                {aiSuggestion?.field === 'scopeOfWork' ? (
                  <SuggestionReview 
                    originalText={formData.scopeOfWork || ''}
                    suggestedText={aiSuggestion.text}
                    onAccept={() => {
                        handleChange('scopeOfWork', aiSuggestion.text);
                        setAiSuggestion(null);
                    }}
                    onDecline={() => setAiSuggestion(null)}
                  />
                ) : (
                  <div className="relative group">
                    <textarea rows={6} className={inputClass} 
                      value={formData.scopeOfWork || ''} onChange={e => handleChange('scopeOfWork', e.target.value)} />
                  </div>
                )}
                {!aiSuggestion && <p className="text-xs text-slate-500 mt-1">Write the scope in rough bullet points and click 'Refine with AI' to professionalize it.</p>}
              </div>

               <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass}>Executive Summary (Background & Need)</label>
                  {!aiSuggestion || aiSuggestion.field !== 'backgroundNeed' ? (
                    <button 
                      onClick={handleRefineBackground}
                      disabled={isRefiningBackground || !formData.backgroundNeed}
                      className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-800 disabled:opacity-50 transition-colors"
                    >
                      {isRefiningBackground ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {isRefiningBackground ? 'Polishing...' : 'Refine with AI'}
                    </button>
                  ) : null}
                </div>
                
                {aiSuggestion?.field === 'backgroundNeed' ? (
                  <SuggestionReview 
                    originalText={formData.backgroundNeed || ''}
                    suggestedText={aiSuggestion.text}
                    onAccept={() => {
                        handleChange('backgroundNeed', aiSuggestion.text);
                        setAiSuggestion(null);
                    }}
                    onDecline={() => setAiSuggestion(null)}
                  />
                ) : (
                  <textarea rows={4} className={inputClass} 
                    value={formData.backgroundNeed || ''} onChange={e => handleChange('backgroundNeed', e.target.value)} />
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">Evaluation & Tender</h3>
             <div className="space-y-6">
              <div>
                <label className={labelClass}>Tender Process Summary</label>
                <textarea rows={4} className={inputClass} 
                  value={formData.tenderProcessSummary || ''} onChange={e => handleChange('tenderProcessSummary', e.target.value)} />
              </div>
               <div>
                <label className={labelClass}>Technical Evaluation Summary</label>
                <textarea rows={4} className={inputClass} 
                  value={formData.technicalEvalSummary || ''} onChange={e => handleChange('technicalEvalSummary', e.target.value)} />
              </div>
               <div>
                <label className={labelClass}>Commercial Evaluation Summary</label>
                <textarea rows={4} className={inputClass} 
                  value={formData.commercialEvalSummary || ''} onChange={e => handleChange('commercialEvalSummary', e.target.value)} />
              </div>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">Terms & Risk Checklist</h3>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
               <div className="flex items-center space-x-3 bg-white dark:bg-slate-700 p-4 rounded border border-slate-200 dark:border-slate-600">
                 <input type="checkbox" id="stdTerms" checked={formData.isStandardTerms} 
                   onChange={e => handleChange('isStandardTerms', e.target.checked)} className="h-5 w-5 text-blue-600" />
                 <label htmlFor="stdTerms" className={labelClass}>Using Standard T&Cs?</label>
               </div>
               
               <div>
                <label className={labelClass}>Liability Cap (%)</label>
                <input type="number" className={inputClass} 
                  value={formData.liabilityCapPercent} onChange={e => handleChange('liabilityCapPercent', parseFloat(e.target.value))} />
              </div>

               <div className="col-span-2">
                <label className={labelClass}>Deviations / Special Considerations</label>
                <textarea rows={2} className={inputClass} 
                  value={formData.deviationsDescription || ''} onChange={e => handleChange('deviationsDescription', e.target.value)} />
              </div>

               <div>
                <label className={labelClass}>Subcontracting Allowed?</label>
                <select className={inputClass}
                  value={formData.isSubcontracting ? 'Yes' : 'No'} onChange={e => handleChange('isSubcontracting', e.target.value === 'Yes')}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
              </div>

              {formData.isSubcontracting && (
                <div>
                  <label className={labelClass}>Subcontracting %</label>
                  <input type="number" className={inputClass} 
                    value={formData.subcontractingPercent} onChange={e => handleChange('subcontractingPercent', parseFloat(e.target.value))} />
                </div>
              )}
            </div>

            {/* Risk Checklist Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-slate-500" size={20} />
                Risk Factors Checklist
              </h4>
              <p className="text-sm text-slate-500 mb-6">
                System automatically detects financial and duration risks. Please manually select other applicable risks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(groupedTriggers).map(category => (
                  <div key={category} className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h5 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 mb-3 border-b border-slate-200 dark:border-slate-600 pb-2">{category}</h5>
                    <div className="space-y-3">
                      {groupedTriggers[category].map(t => {
                         const isSystem = SYSTEM_TRIGGER_IDS.includes(t.id);
                         return (
                           <label key={t.id} className={`flex items-start gap-3 p-2 rounded transition-colors ${t.triggered ? 'bg-orange-50 dark:bg-orange-900/10' : ''} ${isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                              <div className="relative flex items-center h-5 mt-0.5">
                                <input 
                                  type="checkbox" 
                                  checked={t.triggered} 
                                  disabled={isSystem}
                                  onChange={() => toggleManualTrigger(t.id)}
                                  className={`h-4 w-4 rounded border-slate-300 ${isSystem ? 'text-slate-400 focus:ring-slate-400' : 'text-orange-600 focus:ring-orange-500'}`} 
                                />
                                {isSystem && <Lock size={10} className="absolute -right-3 -top-1 text-slate-400" />}
                              </div>
                              <span className={`text-sm ${t.triggered ? 'font-medium text-orange-800 dark:text-orange-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                {t.description}
                                {isSystem && <span className="block text-[10px] text-slate-400 italic">Auto-detected</span>}
                              </span>
                           </label>
                         );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6">
              <div>
                <label className={labelClass}>Identified Risks & Mitigations (Detailed)</label>
                <textarea rows={4} className={inputClass} 
                  placeholder="Elaborate on the risks checked above and other specific operational concerns..."
                  value={formData.riskDescription || ''} onChange={e => handleChange('riskDescription', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Mitigation Measures</label>
                <textarea rows={3} className={inputClass} 
                  placeholder="How will these risks be managed?"
                  value={formData.mitigationMeasures || ''} onChange={e => handleChange('mitigationMeasures', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">Document Uploads</h3>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <Upload size={48} className="text-slate-400 mb-4" />
              <p className="text-slate-900 dark:text-white font-medium">Click to upload or drag and drop</p>
              <p className="text-slate-500 text-sm mt-1">PDF, Word, Excel (Max 10MB)</p>
              <input 
                type="file" 
                className="absolute opacity-0 w-full h-full cursor-pointer inset-0"
                onChange={handleFileUpload}
              />
            </div>

            <div className="space-y-2">
               {formData.documents?.map(doc => (
                 <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                   <div className="flex items-center gap-3">
                     <FileIcon size={20} className="text-blue-500" />
                     <div>
                       <p className="text-sm font-medium text-slate-800 dark:text-white">{doc.name}</p>
                       <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <button onClick={() => removeDocument(doc.id)} className="text-slate-400 hover:text-red-500">
                     <X size={18} />
                   </button>
                 </div>
               ))}
               {(!formData.documents || formData.documents.length === 0) && (
                 <p className="text-center text-sm text-slate-500 italic">No documents uploaded yet.</p>
               )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">Pre-Submission Check</h3>
            
            {riskAssessment.isHighRisk ? (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-lg flex items-start gap-4">
                <AlertTriangle className="text-orange-600 dark:text-orange-500 shrink-0 mt-1" size={28} />
                <div>
                  <h4 className="font-bold text-orange-800 dark:text-orange-400 text-lg">High Risk Triggers Detected</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">This contract will require CEO approval.</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-orange-700 dark:text-orange-300">
                    {riskAssessment.triggers.filter(t => t.triggered).map(t => (
                      <li key={t.id}>{t.description}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg flex items-start gap-4">
                <CheckCircle className="text-green-600 dark:text-green-500 shrink-0 mt-1" size={28} />
                <div>
                  <h4 className="font-bold text-green-800 dark:text-green-400 text-lg">Standard Risk Profile</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">No mandatory high-risk triggers detected.</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg border border-slate-200 dark:border-slate-600">
              <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-400">Contract Title</span> 
                    <span className="font-medium text-slate-900 dark:text-white text-lg">{formData.title}</span>
                </div>
                {formData.project && (
                   <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400">Project</span> 
                      <span className="font-medium text-slate-900 dark:text-white text-lg">{formData.project}</span>
                   </div>
                )}
                <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-400">Contractor</span> 
                    <span className="font-medium text-slate-900 dark:text-white text-lg">{formData.contractorName}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-400">Value (Original)</span> 
                    <span className="font-medium text-slate-900 dark:text-white text-lg">{formData.originalAmount?.toLocaleString()} {formData.originalCurrency}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-400">Value (USD Eqv)</span> 
                    <span className="font-medium text-slate-900 dark:text-white text-lg">${formData.amount?.toLocaleString()} ({formData.contractType})</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-400">Duration</span> 
                    <span className="font-medium text-slate-900 dark:text-white">{formData.startDate} to {formData.endDate}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-400">Documents</span> 
                    <span className="font-medium text-slate-900 dark:text-white">{formData.documents?.length || 0} Files</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        {step > 0 ? (
          <button onClick={handleBack} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back
          </button>
        ) : (
          <button onClick={onCancel} className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors">
            Cancel
          </button>
        )}

        <div className="flex gap-4">
           {/* Draft Button */}
           <button 
             onClick={() => handleSubmit(ContractStatus.DRAFT)} 
             className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors flex items-center"
           >
             <FileEdit size={16} className="mr-2" /> Save as Draft
           </button>

           {step < TABS.length - 1 ? (
            <button onClick={handleNext} className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 flex items-center shadow-lg transform transition active:scale-95 font-medium">
              Next Step <ArrowRight size={16} className="ml-2" />
            </button>
          ) : (
            <button onClick={() => handleSubmit(ContractStatus.SUBMITTED)} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center shadow-lg transform transition active:scale-95 font-bold">
              <Save size={18} className="mr-2" /> {initialData ? 'Submit Changes' : 'Submit Contract'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SuggestionReview = ({ 
  originalText, 
  suggestedText, 
  onAccept, 
  onDecline 
}: { 
  originalText: string, 
  suggestedText: string, 
  onAccept: () => void, 
  onDecline: () => void 
}) => (
  <div className="mt-2 bg-purple-50 dark:bg-purple-900/10 rounded-md border border-purple-200 dark:border-purple-800 p-4 flex flex-col md:flex-row gap-4 items-start animate-fade-in relative">
    {/* Purple Left Accent Line */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-md"></div>
    
    <div className="flex-1 pl-2">
      <div className="flex items-center gap-2 mb-2">
         <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
         <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">AI Suggested Improvement</span>
      </div>
      <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
         {suggestedText}
      </div>
      <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800/50">
         <p className="text-xs text-slate-500 dark:text-slate-400">
           <span className="font-semibold">Original:</span> <span className="italic opacity-80 line-clamp-1 hover:line-clamp-none cursor-pointer" title={originalText}>{originalText}</span>
         </p>
      </div>
    </div>

    <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
       <button 
         onClick={onAccept} 
         className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded shadow-sm transition-colors min-w-[110px]"
       >
          <CheckCircle size={16} /> Accept
       </button>
       <button 
         onClick={onDecline} 
         className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded shadow-sm transition-colors min-w-[110px]"
       >
          <X size={16} /> Decline
       </button>
    </div>
  </div>
);
