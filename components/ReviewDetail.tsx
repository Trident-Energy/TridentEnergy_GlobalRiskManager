
import React, { useState, useEffect, useRef } from 'react';
import { ContractData, User, UserRole, ContractStatus, ContractDocument, Comment } from '../types';
import { analyzeContractRisks, sendContractQuery, ChatMessage } from '../services/geminiService';
import { MOCK_USERS } from '../constants';
import { formatEmailBody, triggerEmailNotification } from '../utils/notificationUtils';
import { CheckCircle, XCircle, FileText, Download, MessageSquare, Bot, AlertTriangle, Upload, Send, Clock, AlertCircle, Save, RotateCcw, X, ShieldCheck, Edit3, ArrowUpCircle, UserPlus, Users, Briefcase, Calendar, DollarSign, Building, ThumbsUp, Sparkles } from 'lucide-react';

interface ReviewDetailProps {
  contract: ContractData;
  currentUser: User;
  onUpdate: (updatedContract: ContractData) => void;
  onClose: () => void;
  onEdit: () => void;
}

const TABS = ['Overview', 'Scope & Eval', 'Legal & Risk', 'AI Chat', 'Documents', 'Comments', 'Approvals', 'Audit Trail'];

export const ReviewDetail: React.FC<ReviewDetailProps> = ({ contract, currentUser, onUpdate, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [reviewComment, setReviewComment] = useState(''); // Justification for approval/rejection
  const [newComment, setNewComment] = useState(''); // Chat comment
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAdHocUserId, setSelectedAdHocUserId] = useState('');
  
  // Local state for AI Analysis draft
  const [aiOutput, setAiOutput] = useState(contract.aiRiskAnalysis || '');
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Define permissions - Updated to remove CFO and Function Head
  const isReviewer = [UserRole.CORPORATE_LEGAL].includes(currentUser.role);
  const isCEO = currentUser.role === UserRole.CEO;
  const isSubmitter = contract.submitterId === currentUser.id;
  const isAdHocReviewer = contract.adHocReviewers?.some(r => r.userId === currentUser.id);
  const hasReviewedAlready = contract.reviews?.some(r => r.reviewerId === currentUser.id);

  // Can Add Reviewers: Submitter or Leads (Legal, CEO)
  const canAddReviewers = isSubmitter || isReviewer || isCEO;

  // Can Approve:
  // 1. Normal workflow (Submitted status + Reviewer role) OR (Pending CEO + CEO)
  // 2. Ad Hoc reviewer who hasn't reviewed yet, regardless of status (as long as not Draft/Rejected/Approved final)
  const isContractActive = contract.status === ContractStatus.SUBMITTED || contract.status === ContractStatus.PENDING_CEO || contract.status === ContractStatus.CHANGES_REQUESTED;
  
  const canApprove = (isContractActive && ((isReviewer && contract.status === ContractStatus.SUBMITTED) || (isCEO && contract.status === ContractStatus.PENDING_CEO))) ||
                     (isContractActive && isAdHocReviewer && !hasReviewedAlready);

  // Sync local AI state if contract changes externally
  useEffect(() => {
    if (contract.aiRiskAnalysis && contract.aiRiskAnalysis !== aiOutput) {
       if (!aiOutput) setAiOutput(contract.aiRiskAnalysis);
    }
  }, [contract.aiRiskAnalysis]);

  // Auto-scroll to bottom of comments
  useEffect(() => {
    if (activeTab === 'Comments' && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, contract.comments]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'AI Chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const getStatusStyles = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.APPROVED:
        return {
          badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
          barColor: 'bg-green-500'
        };
      case ContractStatus.REJECTED:
        return {
          badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          barColor: 'bg-red-500'
        };
      case ContractStatus.PENDING_CEO:
        return {
          badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          iconColor: 'text-orange-600 dark:text-orange-400',
          barColor: 'bg-orange-500'
        };
      case ContractStatus.SUBMITTED:
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          barColor: 'bg-blue-500'
        };
      case ContractStatus.CHANGES_REQUESTED:
        return {
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          barColor: 'bg-yellow-500'
        };
      case ContractStatus.DRAFT:
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
          iconBg: 'bg-slate-100 dark:bg-slate-700',
          iconColor: 'text-slate-600 dark:text-slate-400',
          barColor: 'bg-slate-400'
        };
    }
  };

  const statusStyle = getStatusStyles(contract.status);

  const handleDecision = (decision: 'Approved' | 'Rejected' | 'Changes Requested') => {
    const updated = { ...contract };
    const timestamp = Date.now();

    // 1. Add to Audit Trail
    updated.auditTrail.push({
      id: Math.random().toString(),
      timestamp,
      userId: currentUser.id,
      userName: currentUser.name,
      action: decision,
      details: reviewComment
    });

    // 2. Add to Reviews History
    if (!updated.reviews) updated.reviews = [];
    updated.reviews.push({
      id: Math.random().toString(),
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      role: currentUser.role,
      decision,
      comment: reviewComment,
      timestamp,
      isAdHoc: isAdHocReviewer
    });

    // 3. Update Status
    let newStatus = updated.status;

    if (decision === 'Rejected') {
      newStatus = ContractStatus.REJECTED;
    } else if (decision === 'Changes Requested') {
      newStatus = ContractStatus.CHANGES_REQUESTED;
    } else {
      // It's an approval
      if (isAdHocReviewer) {
        // Just record, no status change
      } else if (isReviewer) {
          // Corporate Legal is the only main reviewer now
          if (currentUser.role === UserRole.CORPORATE_LEGAL) updated.corporateApprovals.legal = true;
          newStatus = ContractStatus.PENDING_CEO; 
      } else if (isCEO) {
          newStatus = ContractStatus.APPROVED;
      }
    }
    
    updated.status = newStatus;

    // 4. Handle Email Notifications based on Status Change
    let recipientName = '';
    let emailSubject = '';
    let emailSent = false;

    // Find submitter name
    const submitter = MOCK_USERS.find(u => u.id === updated.submitterId);
    const submitterName = submitter ? submitter.name : 'Contract Owner';

    if (newStatus === ContractStatus.REJECTED) {
      recipientName = submitterName;
      emailSubject = `ACTION REQUIRED: Contract Rejected - ${updated.contractorName}`;
      emailSent = true;
    } else if (newStatus === ContractStatus.CHANGES_REQUESTED) {
      recipientName = submitterName;
      emailSubject = `ACTION REQUIRED: Changes Requested - ${updated.contractorName}`;
      emailSent = true;
    } else if (newStatus === ContractStatus.APPROVED) {
       recipientName = submitterName;
       emailSubject = `COMPLETED: Contract Approved - ${updated.contractorName}`;
       emailSent = true;
    } else if (newStatus === ContractStatus.PENDING_CEO && contract.status !== ContractStatus.PENDING_CEO) {
       // Just moved to CEO stage
       recipientName = 'Chief CEO';
       emailSubject = `APPROVAL REQUIRED: High Value Contract - ${updated.contractorName}`;
       emailSent = true;
    }

    if (emailSent) {
      const emailBody = formatEmailBody(updated);
      triggerEmailNotification(recipientName, emailSubject, emailBody);
      
      // Add email record to audit trail
      updated.auditTrail.push({
        id: Math.random().toString(),
        timestamp: Date.now() + 1, // Slight offset
        userId: 'system',
        userName: 'System',
        action: 'Email Notification Sent',
        details: `Sent to ${recipientName}: ${emailSubject}`
      });
    }

    onUpdate(updated);
    setReviewComment('');
    setActiveTab('Overview'); 
  };

  const handleAddReviewer = () => {
    if (!selectedAdHocUserId) return;
    const userToAdd = MOCK_USERS.find(u => u.id === selectedAdHocUserId);
    if (!userToAdd) return;

    const updated = { ...contract };
    if (!updated.adHocReviewers) updated.adHocReviewers = [];
    
    // Avoid duplicates
    if (updated.adHocReviewers.some(r => r.userId === userToAdd.id)) return;

    updated.adHocReviewers.push({
      userId: userToAdd.id,
      userName: userToAdd.name,
      role: userToAdd.role,
      addedBy: currentUser.name,
      addedAt: Date.now()
    });

    updated.auditTrail.push({
      id: Math.random().toString(),
      timestamp: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Added Reviewer',
      details: `Added ${userToAdd.name} as ad hoc reviewer.`
    });

    // Notify the added reviewer
    const emailBody = formatEmailBody(updated);
    triggerEmailNotification(userToAdd.name, `ASSIGNMENT: You have been added as a Reviewer - ${updated.contractorName}`, emailBody);
     updated.auditTrail.push({
        id: Math.random().toString(),
        timestamp: Date.now() + 1, 
        userId: 'system',
        userName: 'System',
        action: 'Email Notification Sent',
        details: `Sent to ${userToAdd.name}`
      });

    onUpdate(updated);
    setSelectedAdHocUserId('');
  };

  const handleSubmitDraft = () => {
    const updated = { ...contract, status: ContractStatus.SUBMITTED };
    updated.auditTrail.push({
      id: Math.random().toString(),
      timestamp: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Submitted Contract',
    });
    
    // Notify Approvers
    const emailBody = formatEmailBody(updated);
    triggerEmailNotification('Corporate Review Team', `NEW SUBMISSION: Review Required - ${updated.contractorName}`, emailBody);
    updated.auditTrail.push({
        id: Math.random().toString(),
        timestamp: Date.now() + 1, 
        userId: 'system',
        userName: 'System',
        action: 'Email Notification Sent',
        details: `Sent to Corporate Review Team`
    });

    onUpdate(updated);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updated = { ...contract };
    const comment: Comment = {
      id: Math.random().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      text: newComment,
      timestamp: Date.now(),
      likes: []
    };
    
    updated.comments = [...(updated.comments || []), comment];
    updated.hasUnreadComments = true;
    
    updated.auditTrail = [...updated.auditTrail, {
      id: Math.random().toString(),
      timestamp: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Added Comment',
    }];

    onUpdate(updated);
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    const updated = { ...contract };
    const commentIndex = updated.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    const comment = updated.comments[commentIndex];
    const likes = comment.likes || [];
    
    if (likes.includes(currentUser.id)) {
      // Unlike
      comment.likes = likes.filter(id => id !== currentUser.id);
    } else {
      // Like
      comment.likes = [...likes, currentUser.id];
    }
    
    updated.comments[commentIndex] = comment;
    onUpdate(updated);
  };

  const handleRunAI = async () => {
    setIsAnalyzing(true);
    const result = await analyzeContractRisks(contract);
    setAiOutput(result); // Update local draft only
    setIsAnalyzing(false);
  };

  const handleSaveAnalysis = () => {
    const updated = { ...contract, aiRiskAnalysis: aiOutput };
    updated.auditTrail.push({
      id: Math.random().toString(),
      timestamp: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Saved AI Risk Analysis'
    });
    onUpdate(updated);
  };

  const handleSendChatMessage = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', text: textToSend };
    
    // Optimistic update
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsChatLoading(true);

    // Call API
    const responseText = await sendContractQuery(contract, chatMessages, textToSend);
    
    setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsChatLoading(false);
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
        
        const updated = { 
          ...contract, 
          documents: [...(contract.documents || []), newDoc],
          auditTrail: [...contract.auditTrail, {
            id: Math.random().toString(),
            timestamp: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            action: 'Uploaded Document',
            details: file.name
          }]
        };
        onUpdate(updated);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (doc: ContractDocument) => {
    if (!doc.base64) {
      alert("File content not available for download.");
      return;
    }
    const link = document.createElement('a');
    link.href = doc.base64;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasUnsavedChanges = aiOutput !== (contract.aiRiskAnalysis || '');
  const canEdit = contract.status === ContractStatus.DRAFT || contract.status === ContractStatus.CHANGES_REQUESTED;

  // Filter available users for ad-hoc selection (exclude current reviewers/approvers if desired, or just show all except self)
  // For simplicity, showing all except current user and those already added
  const availableUsers = MOCK_USERS.filter(u => 
    u.id !== currentUser.id && 
    !contract.adHocReviewers?.some(r => r.userId === u.id)
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-100px)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
        <div>
           <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{contract.title || contract.contractorName}</h2>
             <span className={`px-2 py-1 text-xs font-bold rounded-full border ${statusStyle.badge}`}>
                {contract.status}
             </span>
           </div>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Contractor: {contract.contractorName} • ID: {contract.id}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {canEdit && (
            <button 
              onClick={onEdit}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all font-medium shadow-sm"
              title="Edit Contract"
            >
              <Edit3 size={18} />
              <span>Edit</span>
            </button>
          )}

          {contract.status === ContractStatus.DRAFT && (
            <button 
              onClick={handleSubmitDraft}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all font-medium shadow-sm"
              title="Submit for Review"
            >
              <ArrowUpCircle size={18} />
              <span>Submit</span>
            </button>
          )}

          <button 
            onClick={onClose} 
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all font-medium shadow-sm"
            title="Close Form"
          >
            <span>Close</span>
            <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 px-6">
            <div className="flex space-x-6 overflow-x-auto no-scrollbar">
              {TABS.map(tab => {
                let count = 0;
                if (tab === 'Comments' && contract.comments) count = contract.comments.length;
                if (tab === 'Documents' && contract.documents) count = contract.documents.length;
                if (tab === 'Audit Trail' && contract.auditTrail) count = contract.auditTrail.length;
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab === 'AI Chat' && <Sparkles size={14} className={activeTab === tab ? "text-blue-600" : "text-slate-400"} />}
                    {tab}
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-800">
            
            {activeTab === 'Overview' && (
              <div className="space-y-6 animate-fade-in">
                 
                 {/* Top Hero Section: Title & Project */}
                 <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-lg border-l-4 border-blue-600 dark:border-blue-500 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Contract Title</h4>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{contract.title}</h1>
                        {contract.project && (
                           <div className="flex items-center gap-2 mt-2 text-slate-600 dark:text-slate-300">
                              <Briefcase size={16} className="text-blue-500" />
                              <span className="font-medium">{contract.project}</span>
                           </div>
                        )}
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 shadow-sm min-w-[150px]">
                         <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Value (USD)</p>
                         <p className="text-xl font-bold text-green-600 dark:text-green-400">${contract.amount.toLocaleString()}</p>
                         <p className="text-[10px] text-slate-400">{contract.contractType}</p>
                      </div>
                    </div>
                 </div>

                 {/* Flattened Grid for Alignment */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                       {/* Financial Details Card */}
                       <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                             <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
                             <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Financial Overview</h3>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4 flex-1">
                             <div>
                               <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Original Amount</p>
                               <p className="font-medium text-slate-900 dark:text-white text-lg">
                                  {contract.originalAmount?.toLocaleString()} <span className="text-sm font-normal text-slate-500">{contract.originalCurrency}</span>
                               </p>
                             </div>
                             <div>
                               <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">USD Equivalent</p>
                               <p className="font-medium text-slate-900 dark:text-white text-lg">
                                  ${contract.amount.toLocaleString()}
                               </p>
                             </div>
                             <div>
                               <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Type</p>
                               <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${contract.contractType === 'CAPEX' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {contract.contractType}
                               </span>
                             </div>
                             <div>
                               <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Pricing Structure</p>
                               <p className="font-medium text-slate-900 dark:text-white text-sm">{contract.priceStructure}</p>
                             </div>
                          </div>
                       </div>

                       {/* Timeline Card */}
                       <div className="bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/30 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                          <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 border-b border-purple-100 dark:border-purple-900/30 flex items-center gap-2">
                             <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
                             <h3 className="font-bold text-purple-800 dark:text-purple-300">Duration & Timeline</h3>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4 flex-1">
                             <div>
                               <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Start Date</p>
                               <p className="font-medium text-slate-900 dark:text-white">{contract.startDate}</p>
                             </div>
                             <div>
                               <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">End Date</p>
                               <p className="font-medium text-slate-900 dark:text-white">{contract.endDate}</p>
                             </div>
                             <div className="col-span-2 flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${contract.hasExtensionOptions ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                   {contract.hasExtensionOptions ? 'Extension Options Available' : 'No Extension Options'}
                                </span>
                             </div>
                          </div>
                       </div>

                       {/* Parties Card */}
                       <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2">
                             <Building size={18} className="text-indigo-600 dark:text-indigo-400" />
                             <h3 className="font-bold text-indigo-800 dark:text-indigo-300">Involved Parties</h3>
                          </div>
                          <div className="p-4 space-y-3 flex-1">
                             <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2">
                               <span className="text-sm text-slate-500 dark:text-slate-400">Contractor</span>
                               <span className="font-medium text-slate-900 dark:text-white text-right">{contract.contractorName}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2">
                               <span className="text-sm text-slate-500 dark:text-slate-400">Entity</span>
                               <span className="font-medium text-slate-900 dark:text-white text-right">{contract.entity}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2">
                               <span className="text-sm text-slate-500 dark:text-slate-400">Department</span>
                               <span className="font-medium text-slate-900 dark:text-white text-right">{contract.department}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-sm text-slate-500 dark:text-slate-400">Submitter</span>
                               <span className="font-medium text-slate-900 dark:text-white text-right">{MOCK_USERS.find(u => u.id === contract.submitterId)?.name || 'Unknown'}</span>
                             </div>
                          </div>
                       </div>

                       {/* Executive Summary Card */}
                       <div className="bg-white dark:bg-slate-800 border border-cyan-100 dark:border-cyan-900/30 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                          <div className="bg-cyan-50 dark:bg-cyan-900/20 px-4 py-3 border-b border-cyan-100 dark:border-cyan-900/30 flex items-center gap-2">
                             <FileText size={18} className="text-cyan-600 dark:text-cyan-400" />
                             <h3 className="font-bold text-cyan-800 dark:text-cyan-300">Executive Summary</h3>
                          </div>
                          <div className="p-4 space-y-4 flex-1">
                             <div>
                               <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Background & Need</h4>
                               <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-100 dark:border-slate-800">
                                 {contract.backgroundNeed}
                               </p>
                             </div>
                             <div>
                               <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Scope of Work</h4>
                               <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-100 dark:border-slate-800 max-h-40 overflow-y-auto custom-scrollbar">
                                 {contract.scopeOfWork}
                               </p>
                             </div>
                          </div>
                       </div>

                       {/* Quick Docs Link */}
                       {contract.documents && contract.documents.length > 0 && (
                          <button 
                            onClick={() => setActiveTab('Documents')}
                            className="lg:col-span-2 w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                             <div className="flex items-center gap-3">
                                <FileText size={20} className="text-blue-500" />
                                <div className="text-left">
                                   <p className="font-bold text-slate-800 dark:text-white text-sm">Contract Documents</p>
                                   <p className="text-xs text-slate-500">{contract.documents.length} files attached</p>
                                </div>
                             </div>
                             <div className="bg-slate-100 dark:bg-slate-700 rounded-full p-1 text-slate-500">
                                <ArrowUpCircle className="rotate-90" size={16} />
                             </div>
                          </button>
                       )}
                 </div>

                 <section>
                   <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2 mt-4">
                     <ShieldCheck size={16}/> Vendor Qualification
                   </h3>
                   <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                       <p className="text-slate-700 dark:text-slate-300">
                         <span className="font-semibold text-slate-900 dark:text-white">DDQ Number:</span> {contract.ddqNumber || 'N/A'}
                       </p>
                        <p className="text-slate-700 dark:text-slate-300">
                         <span className="font-semibold text-slate-900 dark:text-white">Approved Date:</span> {contract.ddqDate || 'N/A'}
                       </p>
                        <p className="text-slate-700 dark:text-slate-300">
                         <span className="font-semibold text-slate-900 dark:text-white">Valid Until:</span> {contract.ddqValidityDate || 'N/A'}
                       </p>
                     </div>
                   </div>
                </section>
              </div>
            )}

            {activeTab === 'Scope & Eval' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="grid grid-cols-1 gap-6">
                    <FieldSection title="Full Scope of Work" content={contract.scopeOfWork} />
                    <FieldSection title="Tender Process" content={contract.tenderProcessSummary} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FieldSection title="Technical Evaluation" content={contract.technicalEvalSummary} />
                      <FieldSection title="Commercial Evaluation" content={contract.commercialEvalSummary} />
                    </div>
                    {contract.specialConsiderations && (
                      <FieldSection title="Special Considerations" content={contract.specialConsiderations} />
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'Legal & Risk' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* AI Section */}
                <div className={`rounded-lg p-5 border transition-colors ${
                  hasUnsavedChanges 
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700/50' 
                    : 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-blue-100 dark:border-blue-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-bold">
                      <Bot size={20} className={hasUnsavedChanges ? "text-amber-600 dark:text-amber-400" : "text-indigo-700 dark:text-indigo-300"} />
                      <h3 className={hasUnsavedChanges ? "text-amber-800 dark:text-amber-300" : "text-indigo-700 dark:text-indigo-300"}>
                        AI Risk Assistant {hasUnsavedChanges && <span className="ml-2 text-[10px] bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-100 px-1.5 py-0.5 rounded uppercase">Unsaved Draft</span>}
                      </h3>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleRunAI} 
                        disabled={isAnalyzing}
                        className="flex items-center gap-1 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors shadow-sm"
                        title="Regenerate Analysis">
                        <RotateCcw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
                        {isAnalyzing ? 'Analyzing...' : 'Refresh'}
                      </button>

                      {hasUnsavedChanges && (
                        <button 
                          onClick={handleSaveAnalysis}
                          className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 shadow-sm transition-colors animate-pulse-slow">
                          <Save size={14} />
                          Save Analysis
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {aiOutput ? (
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {aiOutput}
                    </div>
                  ) : (
                     <div className="text-sm text-slate-500 italic">
                        Click 'Refresh' to have Gemini analyze financial exposure and operational risks.
                     </div>
                  )}
                </div>

                {/* Risk Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
                     <h4 className="font-bold text-slate-800 dark:text-white mb-4 border-b pb-2 dark:border-slate-700">Terms & Conditions</h4>
                     <ul className="space-y-3 text-sm">
                       <li className="flex justify-between">
                         <span className="text-slate-500 dark:text-slate-400">Standard Terms?</span>
                         <span className="font-medium text-slate-900 dark:text-white">{contract.isStandardTerms ? 'Yes' : 'No'}</span>
                       </li>
                       <li className="flex justify-between">
                         <span className="text-slate-500 dark:text-slate-400">Liability Cap</span>
                         <span className={`font-medium ${contract.liabilityCapPercent < 100 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>{contract.liabilityCapPercent}%</span>
                       </li>
                       <li className="flex justify-between">
                         <span className="text-slate-500 dark:text-slate-400">Subcontracting</span>
                         <span className="font-medium text-slate-900 dark:text-white">{contract.isSubcontracting ? `${contract.subcontractingPercent}%` : 'Not Allowed'}</span>
                       </li>
                     </ul>
                     {contract.deviationsDescription && (
                        <div className="mt-4">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Deviations</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{contract.deviationsDescription}</p>
                        </div>
                     )}
                   </div>

                   <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
                     <h4 className="font-bold text-slate-800 dark:text-white mb-4 border-b pb-2 dark:border-slate-700">Risk Assessment</h4>
                      {contract.isHighRisk && (
                        <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 p-3 rounded text-sm text-orange-800 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                          <div className="flex items-center font-bold mb-2"><AlertTriangle size={16} className="mr-2"/> Triggers Detected</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {contract.detectedTriggers.filter(t => t.triggered).map(t => (
                              <li key={t.id}>{t.description}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Identified Risks</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{contract.riskDescription}</p>
                        </div>
                         <div>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mitigation Measures</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{contract.mitigationMeasures}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'AI Chat' && (
               <div className="flex flex-col h-full animate-fade-in relative bg-white dark:bg-slate-800 rounded-lg">
                  {chatMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                           <Sparkles size={32} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ask AI about this contract</h3>
                           <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">
                             I have full context of the Scope, Financials, and Risk profile. How can I help?
                           </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                           {['Summarize key risks', 'Explain payment terms', 'Is indemnity capped?', 'List important dates'].map((prompt, i) => (
                              <button 
                                key={i}
                                onClick={() => handleSendChatMessage(prompt)}
                                className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-3 rounded-lg transition-colors flex items-center justify-between group"
                              >
                                {prompt}
                                <ArrowUpCircle size={14} className="opacity-0 group-hover:opacity-100 transition-opacity rotate-90" />
                              </button>
                           ))}
                        </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                       {chatMessages.map((msg, idx) => (
                         <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                               msg.role === 'user' 
                               ? 'bg-blue-600 text-white rounded-br-none' 
                               : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-600'
                            }`}>
                               {msg.role === 'model' && (
                                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                     <Sparkles size={12} /> AI Assistant
                                  </div>
                               )}
                               <div className="whitespace-pre-wrap">{msg.text}</div>
                            </div>
                         </div>
                       ))}
                       {isChatLoading && (
                          <div className="flex justify-start animate-pulse">
                             <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-none px-6 py-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                             </div>
                          </div>
                       )}
                       <div ref={chatBottomRef} />
                    </div>
                  )}

                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                     <div className="relative flex items-center gap-2">
                        <input 
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendChatMessage();
                             }
                           }}
                           placeholder="Ask a question about this contract..."
                           className="flex-1 border border-slate-300 dark:border-slate-600 rounded-full py-3 px-5 pr-12 text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        />
                        <button 
                           onClick={() => handleSendChatMessage()}
                           disabled={!chatInput.trim() || isChatLoading}
                           className="absolute right-1.5 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                           <Send size={16} />
                        </button>
                     </div>
                     <p className="text-[10px] text-slate-400 text-center mt-2">
                       AI can make mistakes. Verify critical information in the Documents tab.
                     </p>
                  </div>
               </div>
            )}

            {activeTab === 'Documents' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Contract Documents</h3>
                   <div className="relative">
                      <input 
                        type="file" 
                        id="review-upload"
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="review-upload" className="cursor-pointer bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-2 rounded text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center transition-colors">
                        <Upload size={16} className="mr-2" /> Upload New
                      </label>
                   </div>
                 </div>

                 <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Size</th>
                          <th className="px-4 py-3">Uploaded</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {contract.documents && contract.documents.length > 0 ? (
                          contract.documents.map((doc, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="px-4 py-3 flex items-center gap-3 font-medium text-slate-800 dark:text-slate-200">
                                <FileText size={18} className="text-blue-500" />
                                {doc.name}
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{(doc.size / 1024).toFixed(0)} KB</td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => handleDownload(doc)}
                                  className="text-blue-600 dark:text-blue-400 hover:underline mr-3"
                                >
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">No documents attached.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                 </div>
              </div>
            )}

            {activeTab === 'Comments' && (
              <div className="flex flex-col h-full animate-fade-in relative">
                 <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2 p-2">
                    {contract.comments && contract.comments.length > 0 ? (
                      contract.comments.sort((a,b) => a.timestamp - b.timestamp).map((c, i) => {
                        const isMe = c.userId === currentUser.id;
                        const likeCount = c.likes?.length || 0;
                        const isLikedByMe = c.likes?.includes(currentUser.id);
                        
                        return (
                          <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="font-bold text-xs text-slate-600 dark:text-slate-400">{c.userName}</span>
                                <span className="text-[10px] text-slate-400">{new Date(c.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                              <div className={`rounded-xl px-4 py-3 text-sm shadow-sm relative group ${
                                isMe 
                                  ? 'bg-blue-600 text-white rounded-tr-none' 
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-600'
                              }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{c.text}</p>
                                
                                {/* Thumbs Up / Acknowledge */}
                                <div className={`absolute -bottom-3 ${isMe ? 'left-0' : 'right-0'} flex items-center`}>
                                   <button 
                                     onClick={() => handleLikeComment(c.id)}
                                     className={`p-1 rounded-full shadow-sm border text-[10px] flex items-center gap-1 transition-all hover:scale-110 ${
                                       isLikedByMe 
                                        ? 'bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300' 
                                        : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                     }`}
                                     title="Acknowledge"
                                   >
                                     <ThumbsUp size={10} fill={isLikedByMe ? "currentColor" : "none"} />
                                     {likeCount > 0 && <span className="font-bold">{likeCount}</span>}
                                   </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-60">
                        <MessageSquare size={64} className="mb-4" />
                        <p className="font-medium">No comments yet</p>
                        <p className="text-sm">Start the conversation below.</p>
                      </div>
                    )}
                    <div ref={commentsEndRef} />
                 </div>
                 
                 <div className="flex gap-2 items-end pt-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky bottom-0">
                    <textarea 
                       className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow"
                       rows={2}
                       placeholder="Type a comment to the team..."
                       value={newComment}
                       onChange={e => setNewComment(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleAddComment();
                         }
                       }}
                    />
                    <button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <Send size={18} />
                    </button>
                 </div>
              </div>
            )}

            {activeTab === 'Approvals' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* 1. Manage Ad Hoc Reviewers */}
                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <Users size={20} />
                     Ad Hoc Reviewers
                   </h3>
                   
                   {/* Add Reviewer Control */}
                   {canAddReviewers && contract.status !== ContractStatus.APPROVED && contract.status !== ContractStatus.REJECTED && (
                     <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="relative flex-1">
                          <select 
                             className="w-full appearance-none border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                             value={selectedAdHocUserId}
                             onChange={(e) => setSelectedAdHocUserId(e.target.value)}
                          >
                             <option value="">Select a user to add...</option>
                             {availableUsers.map(u => (
                               <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                             ))}
                          </select>
                        </div>
                        <button 
                          onClick={handleAddReviewer}
                          disabled={!selectedAdHocUserId}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                        >
                           <UserPlus size={18} /> Add
                        </button>
                     </div>
                   )}
                   
                   {/* Reviewer List */}
                   <div className="space-y-3">
                     {contract.adHocReviewers && contract.adHocReviewers.length > 0 ? (
                       contract.adHocReviewers.map((rev, i) => {
                          // Check if they have reviewed
                          const review = contract.reviews?.find(r => r.reviewerId === rev.userId);
                          return (
                            <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                                     {rev.userName.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-900 dark:text-white">{rev.userName}</p>
                                     <p className="text-xs text-slate-500 dark:text-slate-400">{rev.role} • Added by {rev.addedBy}</p>
                                  </div>
                               </div>
                               <div>
                                 {review ? (
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${review.decision === 'Approved' ? 'bg-green-100 text-green-700' : review.decision === 'Changes Requested' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {review.decision}
                                    </span>
                                 ) : (
                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                      Pending Review
                                    </span>
                                 )}
                               </div>
                            </div>
                          );
                       })
                     ) : (
                       <div className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm italic border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                         No additional reviewers assigned.
                       </div>
                     )}
                   </div>
                </div>

                {/* 2. Approval History */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 mt-8">Review History</h3>
                  <div className="space-y-4">
                     {contract.reviews && contract.reviews.length > 0 ? (
                       contract.reviews.map((rev, i) => (
                         <div key={i} className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm relative overflow-hidden">
                           {rev.isAdHoc && (
                             <div className="absolute top-0 right-0">
                                <span className="bg-indigo-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg">
                                  Ad Hoc
                                </span>
                             </div>
                           )}
                           <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-200">
                                 {rev.reviewerName.charAt(0)}
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                   {rev.reviewerName}
                                 </p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{rev.role}</p>
                               </div>
                             </div>
                             <div className="text-right mt-2 sm:mt-0">
                               <span className={`px-2 py-1 text-xs font-bold rounded-full ${rev.decision === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : rev.decision === 'Changes Requested' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                 {rev.decision}
                               </span>
                               <p className="text-xs text-slate-400 mt-1">{new Date(rev.timestamp).toLocaleDateString()}</p>
                             </div>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded text-sm text-slate-700 dark:text-slate-300 italic">
                             "{rev.comment}"
                           </div>
                         </div>
                       ))
                     ) : (
                       <p className="text-slate-500 dark:text-slate-400 italic">No reviews recorded yet.</p>
                     )}
                  </div>
                </div>

                {/* Approval Action Form */}
                {canApprove && (
                   <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Your Review Decision</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Please provide a justification for your decision. This will be recorded in the audit trail.</p>
                     
                     <textarea
                       className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-4 text-sm mb-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                       rows={6}
                       placeholder="Enter detailed justification, requirements, or comments..."
                       value={reviewComment}
                       onChange={e => setReviewComment(e.target.value)}
                     />
                     
                     <div className="flex gap-4">
                       <button 
                         onClick={() => handleDecision('Rejected')}
                         disabled={!reviewComment.trim()}
                         className="flex-1 flex items-center justify-center bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 py-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <XCircle size={20} className="mr-2" /> Reject
                       </button>

                       <button 
                         onClick={() => handleDecision('Changes Requested')}
                         disabled={!reviewComment.trim()}
                         className="flex-1 flex items-center justify-center bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 py-3 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <RotateCcw size={20} className="mr-2" /> Request Changes
                       </button>

                       <button 
                         onClick={() => handleDecision('Approved')}
                         disabled={!reviewComment.trim()}
                         className="flex-1 flex items-center justify-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 shadow-md transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <CheckCircle size={20} className="mr-2" /> Approve
                       </button>
                     </div>
                   </div>
                )}

                {!canApprove && (
                   <div className="border-t border-slate-200 dark:border-slate-700 pt-8 text-center text-slate-500 dark:text-slate-400 italic">
                     {contract.status === ContractStatus.APPROVED ? 'This contract has been fully approved.' : 
                      contract.status === ContractStatus.REJECTED ? 'This contract was rejected.' : 
                      'You do not have pending review actions for this contract.'}
                   </div>
                )}
              </div>
            )}

            {activeTab === 'Audit Trail' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Audit Trail</h3>
                <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                  {contract.auditTrail?.sort((a,b) => b.timestamp - a.timestamp).map((log, i) => (
                    <div key={i} className="relative pl-8">
                       <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 ${log.action === 'Email Notification Sent' ? 'bg-blue-400' : 'bg-blue-500'}`}></span>
                       <div className="flex flex-col">
                         <span className="text-xs text-slate-400 font-mono mb-1">{new Date(log.timestamp).toLocaleString()}</span>
                         <span className="font-bold text-slate-800 dark:text-white text-sm">
                           {log.action} <span className="font-normal text-slate-500 dark:text-slate-400">by {log.userName}</span>
                         </span>
                         {log.details && (
                           <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700 inline-block whitespace-pre-wrap">
                             {log.details}
                           </p>
                         )}
                       </div>
                    </div>
                  ))}
                  {(!contract.auditTrail || contract.auditTrail.length === 0) && (
                    <p className="pl-8 text-slate-500 italic">No history available.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Sidebar: Actions */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-900/30 flex flex-col shrink-0">
           
           <div className="mb-6">
             <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm uppercase tracking-wide">Contract Status</h4>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                   <div className={`p-2 rounded-full ${statusStyle.iconBg} ${statusStyle.iconColor}`}>
                      {contract.status === ContractStatus.APPROVED ? <CheckCircle size={20} /> :
                       contract.status === ContractStatus.REJECTED ? <XCircle size={20} /> :
                       contract.status === ContractStatus.PENDING_CEO ? <AlertCircle size={20} /> :
                       <Clock size={20} />}
                   </div>
                   <div>
                      <p className={`font-bold text-sm ${statusStyle.iconColor}`}>{contract.status}</p>
                      <p className="text-xs text-slate-500">Current Stage</p>
                   </div>
                </div>
                {/* Progress Bar (Mock) */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                   <div className={`h-1.5 rounded-full w-full ${statusStyle.barColor}`}></div>
                </div>

                {/* Detected Triggers Status Box */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {contract.isHighRisk ? (
                     <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800/50">
                        <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-orange-800 dark:text-orange-300 mb-1">High Risk Triggers</p>
                           <ul className="list-disc pl-3 space-y-1">
                              {contract.detectedTriggers && contract.detectedTriggers.filter(t => t.triggered).length > 0 ? (
                                contract.detectedTriggers.filter(t => t.triggered).map(t => (
                                   <li key={t.id} className="text-[10px] text-orange-700 dark:text-orange-300 leading-tight">
                                     {t.description}
                                   </li>
                                ))
                              ) : (
                                <li className="text-[10px] text-orange-700 dark:text-orange-300 leading-tight">
                                  Manual High Risk Flag
                                </li>
                              )}
                           </ul>
                        </div>
                     </div>
                  ) : (
                     <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800/50">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-green-800 dark:text-green-300 mb-1">Standard Risk Profile</p>
                           <p className="text-xs text-green-700 dark:text-green-300 leading-tight">
                             No mandatory high-risk triggers detected.
                           </p>
                        </div>
                     </div>
                  )}
                </div>
             </div>
           </div>

           <div className="mt-auto">
             <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-3">Quick Actions</h4>
             <button className="w-full flex items-center justify-center text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded p-2 hover:bg-white dark:hover:bg-slate-800 transition-colors mb-2">
               <Download size={14} className="mr-2" /> Download PDF
             </button>
             <button className="w-full flex items-center justify-center text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded p-2 hover:bg-white dark:hover:bg-slate-800 transition-colors">
               <FileText size={14} className="mr-2" /> Export Summary
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const FieldSection = ({ title, content }: { title: string, content?: string }) => (
  <div>
    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
    <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded border border-slate-100 dark:border-slate-800">
       <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{content || 'N/A'}</p>
    </div>
  </div>
);
