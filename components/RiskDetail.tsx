
import React, { useState, useEffect, useRef } from 'react';
import { Risk, ActionPlan, Comment, RiskStatus, ControlRating, RiskCategory, Country, User, AuditLogEntry, Attachment, EscalationLevel, EscalationEntry } from '../types';
import { calculateRiskScore, getRiskLevel, COUNTRIES, IMPACT_OPTIONS, LIKELIHOOD_OPTIONS, PRINCIPAL_RISKS, RISK_REGISTER_DATA, ESCALATION_LEVELS } from '../constants';
import { generateMitigationAdvice, improveRiskDescription } from '../services/geminiService';
import { X, Save, MessageSquare, Plus, Sparkles, Calendar, ChevronDown, Trash2, Users, Search, AlertTriangle, Send, CornerDownRight, Edit2, History, Clock, User as UserIcon, Paperclip, FileText, Download, ShieldAlert, Shield, Check, Info, Lightbulb } from 'lucide-react';

interface Props {
  risk: Risk | null; // null means 'New Risk'
  currentUser: User;
  users: User[];
  onClose: () => void;
  onSave: (risk: Risk) => void;
  onDelete: (riskId: string) => void;
  actions: ActionPlan[];
  onAddAction: (action: ActionPlan) => void;
  onUpdateAction: (action: ActionPlan) => void;
  onDeleteAction: (actionId: string) => void;
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
}

// Helper to render a single comment thread item
interface CommentItemProps {
  comment: Comment;
  allComments: Comment[];
  currentUser: User;
  onDelete: (id: string) => void;
  onReply: (text: string, parentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  allComments, 
  currentUser, 
  onDelete, 
  onReply 
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Find children
  const children = allComments.filter(c => c.parentId === comment.id).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 group">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-sm text-blue-700 dark:text-blue-300 border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0">
          {comment.userName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{comment.userName}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">{new Date(comment.date).toLocaleDateString()}</span>
                {(comment.userId === currentUser.id || currentUser.role === 'RMIA') && (
                  <button 
                    onClick={() => onDelete(comment.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{comment.text}</p>
            
            {/* Action Bar */}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex gap-4">
               <button 
                 onClick={() => setShowReplyBox(!showReplyBox)}
                 className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
               >
                 <CornerDownRight size={12} />
                 Reply
               </button>
            </div>
          </div>

          {/* Reply Input Box */}
          {showReplyBox && (
            <div className="mt-2 ml-2 flex gap-3 animate-fade-in">
               <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {currentUser.name.charAt(0)}
               </div>
               <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      if(replyText.trim()){
                        onReply(replyText, comment.id);
                        setReplyText('');
                        setShowReplyBox(false);
                      }
                    }}
                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={14} />
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Children */}
      {children.length > 0 && (
        <div className="pl-12 flex flex-col gap-3 relative">
           {/* Visual Thread Line */}
           <div className="absolute left-5 top-0 bottom-4 w-px bg-slate-200 dark:bg-slate-700"></div>
           
           {children.map(child => (
             <div key={child.id} className="relative">
                {/* Visual Curve */}
                <div className="absolute -left-7 top-5 w-7 h-px bg-slate-200 dark:bg-slate-700"></div>
                
                <CommentItem 
                  comment={child} 
                  allComments={allComments} 
                  currentUser={currentUser} 
                  onDelete={onDelete} 
                  onReply={onReply}
                />
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

const RiskDetail: React.FC<Props> = ({ risk, currentUser, users, onClose, onSave, onDelete, actions, onAddAction, onUpdateAction, onDeleteAction, comments, onAddComment, onDeleteComment }) => {
  // Local state for the form
  const [formData, setFormData] = useState<Risk>({
    id: `R-NEW-${Math.floor(Math.random()*1000)}`,
    creationDate: new Date().toISOString().split('T')[0], // Default to today
    register: 'BR Asset',
    country: Country.UK,
    title: '',
    description: '',
    owner: currentUser.name,
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS[4],
    inherentImpact: 3,
    inherentLikelihood: 3,
    controlsText: '',
    controlsRating: ControlRating.FAIR,
    residualImpact: 3,
    residualLikelihood: 3,
    status: RiskStatus.OPEN,
    lastReviewDate: new Date().toISOString().split('T')[0],
    lastReviewer: currentUser.name,
    collaborators: [],
    history: [],
    escalations: []
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescriptionLoading, setAiDescriptionLoading] = useState(false);
  // Updated state to hold object with feedback
  const [aiDescriptionSuggestion, setAiDescriptionSuggestion] = useState<{text: string, feedback: string} | null>(null);
  const [aiControlsSuggestion, setAiControlsSuggestion] = useState<{text: string, feedback: string} | null>(null);
  
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'actions' | 'comments' | 'escalation' | 'history'>('details');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  
  // Collaborator Autocomplete State
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [showCollaboratorList, setShowCollaboratorList] = useState(false);

  // Escalation Autocomplete State
  const [escalationSearch, setEscalationSearch] = useState('');
  const [showEscalationList, setShowEscalationList] = useState<{level: string, show: boolean} | null>(null);

  // Risk Owner Autocomplete State
  const [showOwnerList, setShowOwnerList] = useState(false);
  
  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Permission Logic
  // RMIA (Admin) can edit everything.
  // Owner can edit their own risk.
  // Others (Collaborators, Escalated) are Read-Only (but can comment).
  const isNewRisk = !risk;
  const isOwner = risk ? risk.owner === currentUser.name : true; // Creator is owner
  const isAdmin = currentUser.role === 'RMIA';
  
  const canEdit = isNewRisk || isAdmin || isOwner;
  const canDelete = isAdmin; // Only Admins can delete risks

  // Action Plan Form State (Create)
  const [showActionForm, setShowActionForm] = useState(false);
  const [newAction, setNewAction] = useState<Partial<ActionPlan>>({
    title: '',
    owner: currentUser.name,
    dueDate: '',
    description: '',
    status: 'Open',
    attachments: []
  });

  // Action Plan Edit State
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionData, setEditingActionData] = useState<ActionPlan | null>(null);

  // Close country dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize form if editing
  // NOTE: This logic was updated to prevent overwriting unsaved form changes when
  // background updates (like audit logs from comments/actions) modify the 'risk' prop.
  useEffect(() => {
    if (risk) {
      setFormData(prev => {
        // If the risk ID changed (different risk selected), strictly replace.
        if (prev.id !== risk.id) return risk;
        
        // Otherwise, we are likely receiving an update to the SAME risk (e.g. history update from side effect).
        // We want to keep current form values for fields the user is editing, but update history.
        return {
          ...prev,
          history: risk.history, // Always take latest history
        };
      });
    }
  }, [risk]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-update review date if status changes
      if (name === 'status') {
         const today = new Date().toISOString().split('T')[0];
         newData.lastReviewDate = today;
         newData.lastReviewer = currentUser.name;
      }
      
      return newData;
    });
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRegister = e.target.value;
    // Find the associated function area
    const mapping = RISK_REGISTER_DATA.find(r => r.register === selectedRegister);
    const associatedFunction = mapping ? mapping.functionArea : '';
    
    setFormData(prev => ({ 
        ...prev, 
        register: selectedRegister,
        functionArea: associatedFunction // Auto-select the function
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleCountrySelect = (c: Country) => {
    setFormData(prev => ({ ...prev, country: c }));
    setCountryOpen(false);
  };

  const handleAddCollaborator = (name: string) => {
    if (!formData.collaborators.includes(name)) {
      setFormData(prev => ({ ...prev, collaborators: [...prev.collaborators, name] }));
    }
    setCollaboratorSearch('');
    setShowCollaboratorList(false);
  };

  const handleRemoveCollaborator = (name: string) => {
    setFormData(prev => ({ ...prev, collaborators: prev.collaborators.filter(c => c !== name) }));
  };

  // Escalation Handlers
  const handleAddEscalation = (level: EscalationLevel, user: User) => {
    const newEntry: EscalationEntry = {
      level,
      userId: user.id,
      userName: user.name,
      date: new Date().toISOString()
    };
    
    // Check duplication
    const exists = formData.escalations?.some(e => e.level === level && e.userId === user.id);
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        escalations: [...(prev.escalations || []), newEntry]
      }));
    }
    setEscalationSearch('');
    setShowEscalationList(null);
  };

  const handleRemoveEscalation = (level: EscalationLevel, userId: string) => {
     setFormData(prev => ({
        ...prev,
        escalations: (prev.escalations || []).filter(e => !(e.level === level && e.userId === userId))
     }));
  };

  const handleAISuggestion = async () => {
    if (!formData.title && !formData.description) return;
    setAiLoading(true);
    const suggestion = await generateMitigationAdvice(formData.title, formData.description);
    setAiControlsSuggestion(suggestion);
    setAiLoading(false);
  };

  const handleAcceptAiControls = () => {
    if (aiControlsSuggestion) {
      setFormData(prev => ({
        ...prev,
        controlsText: (prev.controlsText ? prev.controlsText + '\n\n' : '') + aiControlsSuggestion.text
      }));
      setAiControlsSuggestion(null);
    }
  };

  const handleDeclineAiControls = () => {
    setAiControlsSuggestion(null);
  };

  const handleAIDescriptionImprovement = async () => {
    if (!formData.title && !formData.description) return;
    setAiDescriptionLoading(true);
    const result = await improveRiskDescription(formData.description, formData.title);
    setAiDescriptionSuggestion(result);
    setAiDescriptionLoading(false);
  };

  const handleAcceptAiDescription = () => {
    if (aiDescriptionSuggestion) {
      setFormData(prev => ({ ...prev, description: aiDescriptionSuggestion.text }));
      setAiDescriptionSuggestion(null);
    }
  };

  const handleDeclineAiDescription = () => {
    setAiDescriptionSuggestion(null);
  };

  const handleSaveAction = () => {
    if (newAction.title && newAction.owner && newAction.dueDate && formData.id) {
      const action: ActionPlan = {
        id: `A-${Date.now()}`,
        riskId: formData.id,
        title: newAction.title || '',
        owner: newAction.owner || '',
        dueDate: newAction.dueDate || '',
        description: newAction.description || '',
        status: newAction.status as 'Open' | 'Closed' | 'Approved' || 'Open',
        attachments: newAction.attachments || []
      };
      onAddAction(action);
      setNewAction({ title: '', owner: currentUser.name, dueDate: '', description: '', status: 'Open', attachments: [] });
      setShowActionForm(false);
    }
  };

  const handleStartEditAction = (action: ActionPlan) => {
    setEditingActionId(action.id);
    setEditingActionData({...action});
  };

  const handleSaveEditAction = () => {
    if (editingActionData) {
      onUpdateAction(editingActionData);
      setEditingActionId(null);
      setEditingActionData(null);
    }
  };

  const handleCancelEditAction = () => {
    setEditingActionId(null);
    setEditingActionData(null);
  };

  const handleDeleteActionClick = (actionId: string) => {
    if (confirm("Are you sure you want to delete this action plan?")) {
       onDeleteAction(actionId);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newAttachments: Attachment[] = files.map(file => ({
        id: `att-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file), // Mock URL for local preview
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString()
      }));

      if (isEdit && editingActionData) {
        setEditingActionData(prev => prev ? ({
          ...prev,
          attachments: [...(prev.attachments || []), ...newAttachments]
        }) : null);
      } else {
        setNewAction(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), ...newAttachments]
        }));
      }
    }
  };

  const handleRemoveAttachment = (attachmentId: string, isEdit: boolean) => {
    if (isEdit && editingActionData) {
      setEditingActionData(prev => prev ? ({
        ...prev,
        attachments: (prev.attachments || []).filter(a => a.id !== attachmentId)
      }) : null);
    } else {
      setNewAction(prev => ({
        ...prev,
        attachments: (prev.attachments || []).filter(a => a.id !== attachmentId)
      }));
    }
  };

  // --- Audit Trail Logic (For Form Fields) ---
  const handleSaveWithAudit = () => {
    const newHistory: AuditLogEntry[] = [...(formData.history || [])];
    const timestamp = new Date().toISOString();
    
    if (!risk) {
       // New Risk Created
       newHistory.unshift({
          id: `H-${Date.now()}`,
          date: timestamp,
          user: currentUser.name,
          action: 'Risk Created',
          details: 'Initial record created'
       });
    } else {
       // Detect Changes to Form Fields
       const changes: { field: string, old: any, new: any }[] = [];
       
       // Compare all fields to capture granular details
       if (risk.title !== formData.title) changes.push({ field: 'Title', old: risk.title, new: formData.title });
       if (risk.register !== formData.register) changes.push({ field: 'Risk Register', old: risk.register, new: formData.register });
       if (risk.country !== formData.country) changes.push({ field: 'Country', old: risk.country, new: formData.country });
       if (risk.owner !== formData.owner) changes.push({ field: 'Risk Owner', old: risk.owner, new: formData.owner });
       if (risk.functionArea !== formData.functionArea) changes.push({ field: 'Function/Area', old: risk.functionArea, new: formData.functionArea });
       if (risk.category !== formData.category) changes.push({ field: 'Risk Category', old: risk.category, new: formData.category });
       if (risk.groupPrincipalRisk !== formData.groupPrincipalRisk) changes.push({ field: 'Principal Risk', old: risk.groupPrincipalRisk, new: formData.groupPrincipalRisk });
       
       if (risk.description !== formData.description) changes.push({ field: 'Description', old: 'Updated', new: 'Updated' });
       if (risk.controlsText !== formData.controlsText) changes.push({ field: 'Controls/Mitigation', old: 'Updated', new: 'Updated' });
       
       if (risk.controlsRating !== formData.controlsRating) changes.push({ field: 'Control Rating', old: risk.controlsRating, new: formData.controlsRating });
       if (risk.inherentImpact !== formData.inherentImpact) changes.push({ field: 'Inherent Impact', old: risk.inherentImpact, new: formData.inherentImpact });
       if (risk.inherentLikelihood !== formData.inherentLikelihood) changes.push({ field: 'Inherent Likelihood', old: risk.inherentLikelihood, new: formData.inherentLikelihood });
       if (risk.residualImpact !== formData.residualImpact) changes.push({ field: 'Residual Impact', old: risk.residualImpact, new: formData.residualImpact });
       if (risk.residualLikelihood !== formData.residualLikelihood) changes.push({ field: 'Residual Likelihood', old: risk.residualLikelihood, new: formData.residualLikelihood });

       if (risk.status !== formData.status) changes.push({ field: 'Status', old: risk.status, new: formData.status });

       // Compare Collaborators (Sort to ignore order)
       const oldCollabs = [...(risk.collaborators || [])].sort().join(', ');
       const newCollabs = [...(formData.collaborators || [])].sort().join(', ');
       if (oldCollabs !== newCollabs) {
           changes.push({ field: 'Collaborators', old: oldCollabs || 'None', new: newCollabs || 'None' });
       }
       
       // Detect Escalation Changes
       const oldEsc = JSON.stringify(risk.escalations || []);
       const newEsc = JSON.stringify(formData.escalations || []);
       if (oldEsc !== newEsc) {
         changes.push({ field: 'Escalation', old: 'Updated', new: 'Updated' });
       }

       changes.forEach(change => {
          let details = `From '${change.old}' to '${change.new}'`;
          
          // Custom detail messages for text blocks or lists
          if (change.field === 'Escalation') details = 'Escalation list updated';
          if (change.field === 'Description') details = 'Risk Description updated';
          if (change.field === 'Controls/Mitigation') details = 'Controls text updated';

          newHistory.unshift({
             id: `H-${Date.now()}-${Math.random()}`,
             date: timestamp,
             user: currentUser.name,
             action: `${change.field} Changed`,
             details: details
          });
       });
    }
    
    onSave({ ...formData, history: newHistory });
  };

  const inherentScore = calculateRiskScore(formData.inherentImpact, formData.inherentLikelihood);
  const inherentLevel = getRiskLevel(inherentScore, formData.inherentImpact);
  
  const residualScore = calculateRiskScore(formData.residualImpact, formData.residualLikelihood);
  const residualLevel = getRiskLevel(residualScore, formData.residualImpact);

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  // Filter Function/Area options based on selected Register
  const currentMapping = RISK_REGISTER_DATA.find(r => r.register === formData.register);
  const availableFunctions = currentMapping ? [currentMapping.functionArea] : [];
  if (formData.functionArea && !availableFunctions.includes(formData.functionArea)) {
      availableFunctions.push(formData.functionArea);
  }

  // Available users to add as collaborators
  const availableCollaborators = users.filter(u => u.name !== formData.owner && !formData.collaborators.includes(u.name));
  const filteredCollaboratorOptions = availableCollaborators.filter(u => 
    u.name.toLowerCase().includes(collaboratorSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(collaboratorSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-2 md:p-4">
      <div className="w-full h-full max-w-[98vw] md:h-[96vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative transition-colors">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{formData.id}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${residualLevel.color}`}>
                Current Risk: {residualLevel.label} ({residualScore})
              </span>
              {!canEdit && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Read Only (Escalated/Collaborator)
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{risk ? 'Edit Risk' : 'Create New Risk'}</h2>
          </div>
          <div className="flex items-center gap-3">
             {canDelete && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mr-2 border border-red-200 dark:border-red-800"
                  title="Delete Risk"
                >
                  <Trash2 size={20} />
                </button>
             )}
             {canEdit && (
                <button 
                  onClick={handleSaveWithAudit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm"
                >
                  <Save size={18} /> Save Risk
                </button>
             )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-8 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 overflow-x-auto">
          {[
            { id: 'details', label: 'Risk Details' },
            { id: 'actions', label: 'Action Plan' },
            { id: 'comments', label: 'Comment' },
            { id: 'escalation', label: 'Escalation' },
            { id: 'history', label: 'Audit Trail' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-950/30">
          
          {/* RISK DETAILS TAB (Merged) */}
          {activeTab === 'details' && (
            <div className="space-y-8 max-w-[95%] lg:max-w-7xl mx-auto">
              
              {/* Section 1: Context */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b dark:border-slate-800 pb-2">Context & Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Business Risk Title <span className="text-red-500">*</span></label>
                    <input 
                      disabled={!canEdit}
                      type="text" name="title" value={formData.title} onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white dark:bg-slate-800 dark:text-white disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                      placeholder="e.g., Export Oil Line Failure"
                    />
                  </div>

                  {/* Creation Date (Read Only) */}
                  <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Creation Date</label>
                     <div className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                        {formData.creationDate}
                     </div>
                  </div>

                  {/* Country (Custom Dropdown) */}
                  <div className="space-y-1.5" ref={countryRef}>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Country <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <button 
                        type="button"
                        disabled={!canEdit}
                        onClick={() => canEdit && setCountryOpen(!countryOpen)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-left flex items-center justify-between hover:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-2">
                           {selectedCountry ? (
                             <>
                               <img src={selectedCountry.flagUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                               <span className="text-slate-700 dark:text-slate-200 font-medium">{selectedCountry.label}</span>
                             </>
                           ) : <span className="text-slate-400">Select Country</span>}
                        </div>
                        <ChevronDown size={16} className="text-slate-400" />
                      </button>
                      
                      {countryOpen && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                          {COUNTRIES.map(c => (
                            <button
                              key={c.code}
                              onClick={() => handleCountrySelect(c.code)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                            >
                               <img src={c.flagUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                               <span className="text-slate-700 dark:text-slate-200">{c.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Register Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Register <span className="text-red-500">*</span></label>
                    <select 
                      disabled={!canEdit}
                      name="register" 
                      value={formData.register} 
                      onChange={handleRegisterChange}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                    >
                      <option value="">Select Register</option>
                      {RISK_REGISTER_DATA.map(r => (
                        <option key={r.register} value={r.register}>{r.register}</option>
                      ))}
                    </select>
                  </div>

                  {/* Risk Owner (Autocomplete) */}
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Owner</label>
                    <div className="relative">
                       <input 
                         disabled={!canEdit}
                         type="text" 
                         name="owner" 
                         value={formData.owner} 
                         onChange={(e) => {
                           handleInputChange(e);
                           setShowOwnerList(true);
                         }}
                         onFocus={() => setShowOwnerList(true)}
                         onBlur={() => setTimeout(() => setShowOwnerList(false), 200)}
                         className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white dark:bg-slate-800 dark:text-white"
                         autoComplete="off"
                       />
                       {showOwnerList && canEdit && (
                         <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                           {users.filter(u => u.name.toLowerCase().includes(formData.owner.toLowerCase())).length > 0 ? (
                             users.filter(u => u.name.toLowerCase().includes(formData.owner.toLowerCase())).map(u => (
                               <button 
                                 key={u.id}
                                 onClick={() => {
                                   setFormData(prev => ({ ...prev, owner: u.name }));
                                   setShowOwnerList(false);
                                 }}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                               >
                                 <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200 shrink-0">{u.name.charAt(0)}</div>
                                 <span className="truncate">{u.name}</span>
                               </button>
                             ))
                           ) : (
                             <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No matching users found</div>
                           )}
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Function/Area Dropdown (Cascaded) */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Function/Area</label>
                    <select 
                      disabled={!canEdit || availableFunctions.length <= 1}
                      name="functionArea" 
                      value={formData.functionArea} 
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-slate-300 disabled:bg-slate-100 disabled:dark:bg-slate-900 disabled:text-slate-500"
                    >
                      {availableFunctions.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Category <span className="text-red-500">*</span></label>
                    <select 
                      disabled={!canEdit}
                      name="category" value={formData.category} onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                    >
                      {Object.values(RiskCategory).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Principal Risk */}
                  <div className="space-y-1.5 col-span-1 md:col-span-1">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Principal Risk <span className="text-red-500">*</span></label>
                     <select 
                        disabled={!canEdit}
                        name="groupPrincipalRisk" value={formData.groupPrincipalRisk} onChange={handleInputChange}
                        className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                      >
                        {PRINCIPAL_RISKS.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Description</label>
                      {canEdit && !aiDescriptionSuggestion && (
                        <button 
                          onClick={handleAIDescriptionImprovement}
                          disabled={aiDescriptionLoading || (!formData.description && !formData.title)}
                          className="group flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-3 py-1.5 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rewrite using standard formula: There is a risk that [event], caused by [cause], which may result in [impact]."
                        >
                          <Sparkles size={14} className="group-hover:animate-pulse" />
                          {aiDescriptionLoading ? 'Improving...' : 'Standardize with AI'}
                        </button>
                      )}
                    </div>
                    
                    {/* Suggestion Box */}
                    {aiDescriptionSuggestion && (
                        <div className="mb-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg animate-fade-in relative overflow-hidden transition-colors">
                           <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                           <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                 <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">
                                    <Sparkles size={12} /> AI Suggestion
                                 </h4>
                                 <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                    {aiDescriptionSuggestion.text}
                                 </p>
                                 
                                 {/* Feedback Section - Enhanced Visibility */}
                                 <div className="mt-4 p-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg shadow-sm">
                                   <div className="flex items-center gap-2 mb-1.5">
                                      <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                                         <Lightbulb size={12} />
                                      </div>
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                         Analysis & Feedback
                                      </p>
                                   </div>
                                   <p className="text-xs text-slate-600 dark:text-slate-400 italic pl-1 border-l-2 border-indigo-200 dark:border-indigo-800">
                                      "{aiDescriptionSuggestion.feedback}"
                                   </p>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                 <button 
                                    onClick={handleAcceptAiDescription}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                    title="Accept and Replace"
                                 >
                                    <Check size={14} /> Accept
                                 </button>
                                 <button 
                                    onClick={handleDeclineAiDescription}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded shadow-sm transition-colors"
                                    title="Decline"
                                 >
                                    <X size={14} /> Decline
                                 </button>
                              </div>
                           </div>
                        </div>
                    )}

                    <textarea 
                      disabled={!canEdit}
                      name="description" value={formData.description} onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                    />
                  </div>
                </div>
              </div>

               {/* Collaborators Section */}
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                 <div className="flex items-center gap-2 mb-4">
                    <Users size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Collaborators</h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                    {formData.collaborators.map(collab => (
                      <div key={collab} className="flex items-center gap-1 pl-3 pr-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {collab}
                        {canEdit && (
                          <button onClick={() => handleRemoveCollaborator(collab)} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500">
                             <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {/* Autocomplete Input */}
                    {canEdit && (
                       <div className="relative">
                          <div className="flex items-center gap-2">
                              <div className="relative">
                                  <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                                  <input 
                                      type="text"
                                      placeholder="Type to add..."
                                      value={collaboratorSearch}
                                      onChange={(e) => {
                                          setCollaboratorSearch(e.target.value);
                                          setShowCollaboratorList(true);
                                      }}
                                      onFocus={() => setShowCollaboratorList(true)}
                                      onBlur={() => setTimeout(() => setShowCollaboratorList(false), 200)}
                                      className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-40 hover:w-56 transition-all bg-white dark:bg-slate-800 dark:text-white"
                                  />
                              </div>
                          </div>
                          
                          {/* Dropdown for adding users */}
                          {showCollaboratorList && collaboratorSearch && (
                              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                 {filteredCollaboratorOptions.length > 0 ? (
                                    filteredCollaboratorOptions.map(u => (
                                     <button 
                                      key={u.id}
                                      onClick={() => handleAddCollaborator(u.name)}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                                     >
                                       <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200 shrink-0">{u.name.charAt(0)}</div>
                                       <span className="truncate">{u.name}</span>
                                     </button>
                                   ))
                                 ) : (
                                   <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No matching users found</div>
                                 )}
                              </div>
                          )}
                       </div>
                    )}
                 </div>
                 <p className="text-xs text-slate-400 mt-2">Collaborators can view this risk and add comments, but cannot edit risk details.</p>
               </div>

              {/* Section 2: Analysis Flow */}
              <div className="space-y-6">
                
                {/* 2.1 Inherent Risk */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                   <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                     <span className="w-1.5 h-4 bg-slate-400 rounded-full"></span>
                     Inherent Risk
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inherent Risk Impact</label>
                        <select disabled={!canEdit} name="inherentImpact" value={formData.inherentImpact} onChange={handleNumberChange} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500">
                          {IMPACT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inherent Risk Likelihood</label>
                        <select disabled={!canEdit} name="inherentLikelihood" value={formData.inherentLikelihood} onChange={handleNumberChange} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500">
                          {LIKELIHOOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className={`py-2.5 px-4 rounded-lg text-sm font-bold border text-center ${inherentLevel.color} h-[42px] flex items-center justify-center`}>
                           Score: {inherentScore} ({inherentLevel.label})
                      </div>
                   </div>
                </div>

                {/* 2.2 Controls & Mitigation */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                       <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                       Controls & Mitigation
                     </h3>
                     {canEdit && !aiControlsSuggestion && (
                       <button 
                          onClick={handleAISuggestion}
                          disabled={aiLoading}
                          className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
                        >
                          <Sparkles size={14} />
                          {aiLoading ? 'Thinking...' : 'AI Suggest Controls'}
                        </button>
                     )}
                  </div>

                  {/* AI Suggestion Box for Controls */}
                  {aiControlsSuggestion && (
                    <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg animate-fade-in relative overflow-hidden transition-colors">
                       <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                       <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                             <h4 className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2">
                                <Sparkles size={12} /> AI Suggested Controls
                             </h4>
                             <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                                {aiControlsSuggestion.text}
                             </p>

                             {/* Feedback Section - Enhanced Visibility */}
                             <div className="mt-4 p-3 bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                   <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-400">
                                      <Lightbulb size={12} />
                                   </div>
                                   <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                      Rationale
                                   </p>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 italic pl-1 border-l-2 border-purple-200 dark:border-purple-800">
                                    "{aiControlsSuggestion.feedback}"
                                </p>
                              </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                             <button 
                                onClick={handleAcceptAiControls}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                title="Append to Controls"
                             >
                                <Check size={14} /> Accept
                             </button>
                             <button 
                                onClick={handleDeclineAiControls}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded shadow-sm transition-colors"
                                title="Decline"
                             >
                                <X size={14} /> Decline
                             </button>
                          </div>
                       </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Controls In Place</label>
                        <textarea 
                          disabled={!canEdit}
                          name="controlsText" value={formData.controlsText} onChange={handleInputChange}
                          rows={6} 
                          className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm shadow-sm bg-white dark:bg-slate-800 dark:text-white disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                          placeholder="List existing controls and mitigation strategies..."
                        />
                     </div>
                     <div className="w-full md:w-1/3 space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Controls Rating</label>
                        <select 
                          disabled={!canEdit}
                          name="controlsRating" value={formData.controlsRating} onChange={handleInputChange}
                          className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                        >
                          {Object.values(ControlRating).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                     </div>
                  </div>
                </div>

                {/* 2.3 Residual Risk */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500 transition-colors">
                   <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                     <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                     Residual Risk
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Residual Risk Impact</label>
                        <select disabled={!canEdit} name="residualImpact" value={formData.residualImpact} onChange={handleNumberChange} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500">
                          {IMPACT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Residual Risk Likelihood</label>
                        <select disabled={!canEdit} name="residualLikelihood" value={formData.residualLikelihood} onChange={handleNumberChange} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500">
                          {LIKELIHOOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className={`py-2.5 px-4 rounded-lg text-sm font-bold border text-center ${residualLevel.color} h-[42px] flex items-center justify-center`}>
                           Score: {residualScore} ({residualLevel.label})
                      </div>
                   </div>
                </div>

                {/* 2.4 Risk Status (Segregated) */}
                <div className={`p-6 rounded-xl border shadow-sm transition-colors ${formData.status === RiskStatus.CLOSED ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                         <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">Risk Status</h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Current lifecycle state of this risk record.</p>
                      </div>
                      <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center gap-4">
                         
                         {/* Admin-Only Close Checkbox */}
                         <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${formData.status === RiskStatus.CLOSED ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <input 
                              type="checkbox"
                              id="closeRiskCheckbox"
                              checked={formData.status === RiskStatus.CLOSED}
                              disabled={currentUser.role !== 'RMIA'} 
                              onChange={(e) => {
                                const newStatus = e.target.checked ? RiskStatus.CLOSED : RiskStatus.OPEN;
                                setFormData(prev => ({ 
                                  ...prev, 
                                  status: newStatus,
                                  // Auto-update review date when closing/re-opening
                                  lastReviewDate: new Date().toISOString().split('T')[0],
                                  lastReviewer: currentUser.name
                                }));
                              }}
                              className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <label htmlFor="closeRiskCheckbox" className={`text-sm font-bold select-none ${currentUser.role === 'RMIA' ? 'cursor-pointer' : 'cursor-not-allowed'} ${formData.status === RiskStatus.CLOSED ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                               Risk Closed
                            </label>
                            {currentUser.role !== 'RMIA' && (
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider ml-1">(Admins Only)</span>
                            )}
                         </div>

                         {/* Status Dropdown (Hidden or Disabled if Closed) */}
                         <div className="w-full md:w-48">
                           <select 
                            disabled={!canEdit || formData.status === RiskStatus.CLOSED}
                            name="status" value={formData.status === RiskStatus.CLOSED ? '' : formData.status} 
                            onChange={handleInputChange}
                            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 disabled:bg-slate-50 disabled:dark:bg-slate-900 disabled:text-slate-500"
                          >
                            {formData.status === RiskStatus.CLOSED && <option value="">(Closed)</option>}
                            {Object.values(RiskStatus)
                              .filter(s => s !== RiskStatus.CLOSED)
                              .map(v => <option key={v} value={v}>{v}</option>)
                            }
                          </select>
                        </div>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          )}

          {/* ACTIONS TAB */}
          {activeTab === 'actions' && (
            <div className="space-y-6 max-w-[95%] lg:max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">Action Plan</h3>
                 {!showActionForm && canEdit && (
                   <button 
                    onClick={() => setShowActionForm(true)}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                   >
                    <Plus size={16} /> Add Action Plan
                   </button>
                 )}
              </div>

              {/* Add Action Form */}
              {showActionForm && (
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm mb-6 animate-fade-in transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase">New Action Plan</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="space-y-1">
                       <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Action</label>
                       <input 
                          type="text" 
                          placeholder="Action Title"
                          value={newAction.title}
                          onChange={e => setNewAction({...newAction, title: e.target.value})}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Action Owner</label>
                       <input 
                          type="text" 
                          placeholder="Owner Name"
                          value={newAction.owner}
                          onChange={e => setNewAction({...newAction, owner: e.target.value})}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Due Date</label>
                       <input 
                          type="date" 
                          value={newAction.dueDate}
                          onChange={e => setNewAction({...newAction, dueDate: e.target.value})}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
                       <select
                          value={newAction.status}
                          onChange={e => setNewAction({...newAction, status: e.target.value as any})}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                       >
                         <option value="Open">Open</option>
                         <option value="Closed">Closed</option>
                         <option value="Approved">Approved</option>
                       </select>
                     </div>
                     <div className="col-span-2 space-y-1">
                       <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Detailed mitigation action plan</label>
                       <textarea 
                          rows={2}
                          value={newAction.description}
                          onChange={e => setNewAction({...newAction, description: e.target.value})}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                          placeholder="Describe the action details..."
                       />
                     </div>

                     {/* File Attachment Input (New) */}
                     <div className="col-span-2 space-y-1 mt-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <Paperclip size={12} /> Attach Documents
                        </label>
                        <input 
                          type="file" 
                          multiple
                          onChange={(e) => handleFileUpload(e, false)}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                        />
                        {/* List New Attachments */}
                        {newAction.attachments && newAction.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                             {newAction.attachments.map(att => (
                               <div key={att.id} className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs">
                                  <FileText size={12} className="text-blue-500" />
                                  <span className="truncate max-w-[150px] text-slate-700 dark:text-slate-200">{att.name}</span>
                                  <button onClick={() => handleRemoveAttachment(att.id, false)} className="text-slate-400 hover:text-red-500">
                                    <X size={12} />
                                  </button>
                               </div>
                             ))}
                          </div>
                        )}
                     </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowActionForm(false)}
                      className="px-3 py-1.5 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveAction}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                    >
                      Save Action
                    </button>
                  </div>
                </div>
              )}
              
              {actions.length === 0 ? (
                !showActionForm && (
                  <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-4xl mb-4">📋</div>
                    <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">No action plans defined</h4>
                    <p className="text-slate-500 dark:text-slate-400">Create an action plan to mitigate this risk.</p>
                  </div>
                )
              ) : (
                <div className="grid gap-4">
                  {actions.map(action => {
                    if (editingActionId === action.id && editingActionData) {
                       // Edit Form Mode for this action
                       return (
                        <div key={action.id} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-blue-400 dark:border-blue-600 shadow-md animate-fade-in transition-colors">
                           <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase flex items-center gap-2">
                             <Edit2 size={14} className="text-blue-500" /> Editing Action
                           </h4>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Action</label>
                                <input 
                                   type="text" 
                                   value={editingActionData.title}
                                   onChange={e => setEditingActionData({...editingActionData, title: e.target.value})}
                                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Action Owner</label>
                                <input 
                                   type="text" 
                                   value={editingActionData.owner}
                                   onChange={e => setEditingActionData({...editingActionData, owner: e.target.value})}
                                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Due Date</label>
                                <input 
                                   type="date" 
                                   value={editingActionData.dueDate}
                                   onChange={e => setEditingActionData({...editingActionData, dueDate: e.target.value})}
                                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
                                <select
                                   value={editingActionData.status}
                                   onChange={e => setEditingActionData({...editingActionData, status: e.target.value as any})}
                                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                                >
                                  <option value="Open">Open</option>
                                  <option value="Closed">Closed</option>
                                  <option value="Approved">Approved</option>
                                </select>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Detailed mitigation action plan</label>
                                <textarea 
                                   rows={2}
                                   value={editingActionData.description}
                                   onChange={e => setEditingActionData({...editingActionData, description: e.target.value})}
                                   className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                                />
                              </div>

                              {/* File Attachment Input (Edit) */}
                              <div className="col-span-2 space-y-1 mt-2">
                                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <Paperclip size={12} /> Attach Documents
                                  </label>
                                  <input 
                                    type="file" 
                                    multiple
                                    onChange={(e) => handleFileUpload(e, true)}
                                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                                  />
                                  {/* List Attachments in Edit Mode */}
                                  {editingActionData.attachments && editingActionData.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {editingActionData.attachments.map(att => (
                                        <div key={att.id} className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs">
                                            <FileText size={12} className="text-blue-500" />
                                            <span className="truncate max-w-[150px] text-slate-700 dark:text-slate-200">{att.name}</span>
                                            <button onClick={() => handleRemoveAttachment(att.id, true)} className="text-slate-400 hover:text-red-500">
                                              <X size={12} />
                                            </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>

                           </div>
                           <div className="flex justify-between items-center">
                             {canDelete ? (
                               <button 
                                 onClick={() => handleDeleteActionClick(action.id)}
                                 className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 font-medium"
                               >
                                 <Trash2 size={14} /> Delete
                               </button>
                             ) : <div></div>}
                             <div className="flex gap-2">
                               <button 
                                 onClick={handleCancelEditAction}
                                 className="px-3 py-1.5 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                               >
                                 Cancel
                               </button>
                               <button 
                                 onClick={handleSaveEditAction}
                                 className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                               >
                                 Update Action
                               </button>
                             </div>
                           </div>
                        </div>
                       );
                    }
                    
                    // Display Card Mode
                    return (
                      <div key={action.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold uppercase tracking-wide ${
                               action.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                               action.status === 'Open' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                               'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                             }`}>
                               {action.status}
                             </span>
                             <span className="text-xs text-slate-400 font-mono">#{action.id}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{action.title}</h4>
                          <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-sm">{action.description}</p>
                          
                          {/* Display Attachments (Read Only) */}
                          {action.attachments && action.attachments.length > 0 && (
                             <div className="mt-3 flex flex-wrap gap-2">
                               {action.attachments.map(att => (
                                 <a 
                                    key={att.id} 
                                    href={att.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 hover:text-blue-600 transition-colors"
                                 >
                                    <Paperclip size={12} />
                                    <span className="truncate max-w-[150px]">{att.name}</span>
                                    <Download size={10} className="ml-1 opacity-50" />
                                 </a>
                               ))}
                             </div>
                          )}

                        </div>
                        <div className="md:text-right text-sm text-slate-500 dark:text-slate-400 flex flex-col justify-center min-w-[150px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                          <div className="flex items-center gap-2 md:justify-end font-medium text-slate-700 dark:text-slate-300">
                            <Calendar size={16} className="text-blue-500" /> {action.dueDate}
                          </div>
                          <div className="mt-1">Owner: <span className="text-slate-700 dark:text-slate-300 font-medium">{action.owner}</span></div>
                          
                          {/* Edit Button */}
                          {canEdit && (
                            <div className="mt-3 flex md:justify-end">
                               <button 
                                 onClick={() => handleStartEditAction(action)}
                                 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                               >
                                 <Edit2 size={12} /> Edit
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* COMMENTS TAB */}
          {activeTab === 'comments' && (
             <div className="flex flex-col h-full max-w-[95%] lg:max-w-5xl mx-auto">
                <div className="flex-1 space-y-6 mb-8 overflow-y-auto">
                   {comments.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-400 italic">No comments yet.</p>
                      </div>
                   ) : (
                     // Render Top-Level Comments (no parentId)
                     comments
                       .filter(c => !c.parentId)
                       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                       .map(c => (
                         <CommentItem 
                           key={c.id}
                           comment={c} 
                           allComments={comments} 
                           currentUser={currentUser} 
                           onDelete={onDeleteComment}
                           onReply={onAddComment}
                         />
                       ))
                   )}
                </div>
                
                {/* Main "Add Comment" box (Always creates top-level comment) */}
                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm sticky bottom-0">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Add New Thread</h4>
                  <div className="flex flex-col gap-3">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Start a new conversation..."
                      rows={3}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white resize-none"
                    />
                    <div className="flex justify-end">
                        <button 
                          onClick={() => {
                            if(newComment.trim()) {
                              onAddComment(newComment); // Top-level
                              setNewComment('');
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Send size={16} /> Post Comment
                        </button>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {/* ESCALATION TAB */}
          {activeTab === 'escalation' && (
            <div className="max-w-[95%] lg:max-w-4xl mx-auto space-y-8">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                     <ShieldAlert size={20} className="text-orange-500" />
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white">Risk Escalation</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                     Escalate this risk to specific oversight groups or individuals. Escalated users will gain visibility and commenting rights to this risk without duplicating the record.
                  </p>
               </div>

               <div className="grid gap-6">
                 {ESCALATION_LEVELS.map(level => {
                    const activeEscalations = formData.escalations?.filter(e => e.level === level) || [];
                    
                    return (
                      <div key={level} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors">
                         <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">{level}</h4>
                            <span className="text-xs font-mono text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                               {activeEscalations.length} Users
                            </span>
                         </div>
                         
                         <div className="p-6">
                            {/* List Escalated Users */}
                            {activeEscalations.length > 0 ? (
                               <div className="flex flex-wrap gap-3 mb-4">
                                  {activeEscalations.map(esc => (
                                     <div key={esc.userId} className="flex items-center gap-2 pl-2 pr-2 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg">
                                        <div className="w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center text-xs font-bold text-orange-800 dark:text-orange-200">
                                           {esc.userName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                           <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{esc.userName}</span>
                                           <span className="text-[10px] text-slate-400 leading-none mt-0.5">Added {new Date(esc.date).toLocaleDateString()}</span>
                                        </div>
                                        {canEdit && (
                                           <button 
                                             onClick={() => handleRemoveEscalation(level, esc.userId)}
                                             className="ml-1 p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded text-slate-400 hover:text-red-500 transition-colors"
                                           >
                                              <X size={14} />
                                           </button>
                                        )}
                                     </div>
                                  ))}
                               </div>
                            ) : (
                               <p className="text-sm text-slate-400 italic mb-4">No users escalated to this level.</p>
                            )}

                            {/* Add User Input */}
                            {canEdit && (
                               <div className="relative max-w-sm">
                                  <div className="flex items-center gap-2">
                                     <input 
                                        type="text"
                                        placeholder={`Add user to ${level}...`}
                                        value={showEscalationList?.level === level ? escalationSearch : ''}
                                        onChange={(e) => {
                                           setEscalationSearch(e.target.value);
                                           setShowEscalationList({ level, show: true });
                                        }}
                                        onFocus={() => {
                                           setEscalationSearch('');
                                           setShowEscalationList({ level, show: true });
                                        }}
                                        onBlur={() => setTimeout(() => setShowEscalationList(null), 200)}
                                        className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white dark:bg-slate-800 dark:text-white"
                                     />
                                     <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                                        <Plus size={18} />
                                     </button>
                                  </div>

                                  {/* User Dropdown */}
                                  {showEscalationList?.level === level && showEscalationList.show && (
                                     <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                        {users.filter(u => 
                                           !activeEscalations.some(e => e.userId === u.id) && // Filter out already added
                                           (u.name.toLowerCase().includes(escalationSearch.toLowerCase()) || u.email.toLowerCase().includes(escalationSearch.toLowerCase()))
                                        ).length > 0 ? (
                                           users.filter(u => 
                                              !activeEscalations.some(e => e.userId === u.id) && 
                                              (u.name.toLowerCase().includes(escalationSearch.toLowerCase()) || u.email.toLowerCase().includes(escalationSearch.toLowerCase()))
                                           ).map(u => (
                                              <button 
                                                 key={u.id}
                                                 onMouseDown={() => handleAddEscalation(level, u)} // Use onMouseDown to prevent blur before click
                                                 className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                                              >
                                                 <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200 shrink-0">{u.name.charAt(0)}</div>
                                                 <div className="flex flex-col">
                                                    <span className="font-medium leading-none">{u.name}</span>
                                                    <span className="text-[10px] text-slate-400 leading-none mt-0.5">{u.role}</span>
                                                 </div>
                                              </button>
                                           ))
                                        ) : (
                                           <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No matching users found</div>
                                        )}
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeTab === 'history' && (
            <div className="max-w-[95%] lg:max-w-4xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">Audit Trail & History</h3>
              </div>
              
              {!formData.history || formData.history.length === 0 ? (
                 <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-4xl mb-4 text-slate-300">🕰️</div>
                    <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">No history available</h4>
                    <p className="text-slate-500 dark:text-slate-400">Changes to this risk will be logged here.</p>
                 </div>
              ) : (
                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-8">
                  {formData.history.map((log) => (
                    <div key={log.id} className="relative group">
                       {/* Timeline Dot */}
                       <div className="absolute -left-[29px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900 group-hover:bg-blue-500 transition-colors"></div>
                       
                       <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800 dark:text-white">{log.action}</span>
                             </div>
                             <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(log.date).toLocaleString()}
                             </span>
                          </div>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                             {log.details}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded w-fit">
                             <UserIcon size={12} />
                             <span>Changed by <span className="font-medium text-slate-700 dark:text-slate-200">{log.user}</span></span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-red-200 dark:border-red-800 relative">
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                      <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Risk?</h3>
                   <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Are you sure you want to delete this risk record? This action cannot be undone.
                   </p>
                   
                   <div className="flex gap-3 w-full mt-2">
                      <button 
                         onClick={() => setShowDeleteConfirm(false)}
                         className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                         onClick={() => {
                            if (risk) onDelete(risk.id);
                         }}
                         className="flex-1 px-3 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                         Yes, Delete
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskDetail;
