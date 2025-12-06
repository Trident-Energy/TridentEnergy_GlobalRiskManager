

import React, { useState, useEffect, useRef } from 'react';
import { Risk, ActionPlan, Comment, RiskStatus, ControlRating, RiskCategory, Country, User, AuditLogEntry, Attachment, EscalationLevel, EscalationEntry, UserRole } from '../types';
import { calculateRiskScore, getRiskLevel, COUNTRIES, IMPACT_OPTIONS, LIKELIHOOD_OPTIONS, PRINCIPAL_RISKS, RISK_REGISTER_DATA, ESCALATION_LEVELS } from '../constants';
import { generateMitigationAdvice, improveRiskDescription } from '../services/geminiService';
import { X, Save, MessageSquare, Plus, Sparkles, Calendar, ChevronDown, Trash2, Users, Search, AlertTriangle, Send, CornerDownRight, Edit2, History, Clock, User as UserIcon, Paperclip, FileText, Download, ShieldAlert, Shield, Check, Info, Lightbulb, AlertCircle, ArrowDown, Activity, CheckCircle, Target, UserCheck, Briefcase, ThumbsUp } from 'lucide-react';

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
  onLikeComment: (commentId: string) => void;
}

// Definitions for inline help
const IMPACT_DEFINITIONS: Record<number, string> = {
  1: "Minimal financial impact (<$10k) or minor injury.",
  2: "Minor disruption, first aid injury.",
  3: "Moderate financial loss, medical treatment required.",
  4: "Major operational loss, serious injury/disability.",
  5: "Critical failure, fatality, or massive financial loss."
};

const LIKELIHOOD_DEFINITIONS: Record<number, string> = {
  1: "Once in 20+ years (<5%).",
  2: "Once in 10 years (5-20%).",
  3: "Once in 1-5 years (20-40%).",
  4: "Occurs annually (40-75%).",
  5: "Occurs monthly/quarterly (>75%)."
};

// Helper: Guidance Tooltip Component
// Updated with custom color #325A78 and scoped group-hover
const GuidanceTooltip = ({ title, content, placement = 'top' }: { title: string, content: React.ReactNode, placement?: 'top' | 'right' | 'left' }) => {
  // Base classes for the tooltip container with custom color
  const baseClasses = "absolute w-64 p-3 bg-[#325A78] text-white text-xs rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-[100] border border-[#26445a]";
  
  // Position specific classes
  let posClasses = "";
  let arrowClasses = "";
  
  switch(placement) {
    case 'right':
      posClasses = "left-full top-1/2 -translate-y-1/2 ml-2.5";
      arrowClasses = "top-1/2 -left-1 -translate-y-1/2 border-l border-b"; // Rotated 45deg to point left
      break;
    case 'left':
      posClasses = "right-full top-1/2 -translate-y-1/2 mr-2.5";
      arrowClasses = "top-1/2 -right-1 -translate-y-1/2 border-r border-t"; // Rotated 45deg to point right
      break;
    case 'top':
    default:
      posClasses = "bottom-full left-1/2 -translate-x-1/2 mb-2.5";
      arrowClasses = "bottom-0 left-1/2 -mb-1 -translate-x-1/2 border-r border-b"; // Rotated to point down
      break;
  }

  return (
    <div className="group/tooltip relative inline-flex items-center ml-1.5 align-middle z-20">
      <Info size={13} className="text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
      <div className={`${baseClasses} ${posClasses}`}>
         <div className="font-bold mb-1 text-white border-b border-[#4a7291] pb-1">{title}</div>
         <div className="leading-relaxed text-slate-100">{content}</div>
         {/* Arrow with matching custom color */}
         <div className={`absolute w-2 h-2 bg-[#325A78] border-[#26445a] rotate-45 ${arrowClasses}`}></div>
      </div>
    </div>
  );
};

// Guidance Content Constants
const GUIDANCE_IMPACT = (
  <ul className="list-none space-y-1">
    <li><strong className="text-white">1 - Negligible:</strong> Minimal financial impact (&lt;$10k) or minor injury.</li>
    <li><strong className="text-white">2 - Marginal:</strong> Minor disruption, first aid injury.</li>
    <li><strong className="text-white">3 - Average:</strong> Moderate financial loss, medical treatment required.</li>
    <li><strong className="text-white">4 - Severe:</strong> Major operational loss, serious injury/disability.</li>
    <li><strong className="text-white">5 - Catastrophic:</strong> Critical failure, fatality, or massive financial loss.</li>
  </ul>
);

const GUIDANCE_LIKELIHOOD = (
  <ul className="list-none space-y-1">
    <li><strong className="text-white">1 - Extremely Remote:</strong> Once in 20+ years (&lt;5%).</li>
    <li><strong className="text-white">2 - Remote:</strong> Once in 10 years (5-20%).</li>
    <li><strong className="text-white">3 - Unlikely:</strong> Once in 1-5 years (20-40%).</li>
    <li><strong className="text-white">4 - Likely:</strong> Occurs annually (40-75%).</li>
    <li><strong className="text-white">5 - Very Likely:</strong> Occurs monthly/quarterly (&gt;75%).</li>
  </ul>
);

const GUIDANCE_CONTROLS = (
  <ul className="list-none space-y-1">
    <li><strong className="text-white">Excellent:</strong> Controls are robust, documented, and tested regularly.</li>
    <li><strong className="text-white">Good:</strong> Controls are effective but may have minor documentation gaps.</li>
    <li><strong className="text-white">Fair:</strong> Controls exist but effectiveness is inconsistent.</li>
    <li><strong className="text-white">Poor:</strong> Controls are weak or largely manual/unreliable.</li>
    <li><strong className="text-white">Unsatisfactory:</strong> No effective controls in place.</li>
  </ul>
);

// Helper to render a single comment thread item
interface CommentItemProps {
  comment: Comment;
  allComments: Comment[];
  currentUser: User;
  users: User[]; // Passed down to lookup roles
  onDelete: (id: string) => void;
  onReply: (text: string, parentId: string) => void;
  onLike: (id: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  allComments, 
  currentUser, 
  users,
  onDelete, 
  onReply,
  onLike
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Find children
  const children = allComments.filter(c => c.parentId === comment.id).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Find the role of the commenter
  const commenter = users.find(u => u.id === comment.userId);
  const commenterRole = commenter ? commenter.role : 'Unknown';

  // Likes logic
  const likes = comment.likes || [];
  const isLiked = likes.includes(currentUser.id);
  const likeCount = likes.length;

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'RMIA') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (role === 'CEO' || role === 'Country Manager') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
  };

  // Get names of likers for tooltip
  const likerNames = likes.map(id => users.find(u => u.id === id)?.name || 'Unknown').join(', ');

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <div className="flex gap-3 group">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm z-10">
            {comment.userName.charAt(0)}
          </div>
          {children.length > 0 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1"></div>}
        </div>
        
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
            {/* Header: Name, Role, Date */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{comment.userName}</span>
                
                {/* ROLE BADGE */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(commenterRole)}`}>
                  {commenterRole === 'RMIA' && <Shield size={10} />}
                  {commenterRole}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">{new Date(comment.date).toLocaleString()}</span>
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

            {/* Content */}
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{comment.text}</p>
            
            {/* Action Bar */}
            <div className="mt-3 flex gap-4 items-center">
               <button 
                 onClick={() => onLike(comment.id)}
                 className={`flex items-center gap-1.5 text-xs font-bold transition-colors group/like relative ${isLiked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
               >
                 <ThumbsUp size={14} className={isLiked ? 'fill-current' : ''} />
                 {likeCount > 0 ? (
                    <span>{likeCount}</span>
                 ) : (
                    <span>Like</span>
                 )}
                 
                 {/* Tooltip for likers */}
                 {likeCount > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/like:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
                       <span className="font-semibold text-slate-300 mr-1">Liked by:</span> {likerNames}
                       <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
                    </div>
                 )}
               </button>

               <button 
                 onClick={() => setShowReplyBox(!showReplyBox)}
                 className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
               >
                 <CornerDownRight size={12} />
                 Reply
               </button>
            </div>
          </div>

          {/* Reply Input Box */}
          {showReplyBox && (
            <div className="mt-3 flex gap-3 animate-fade-in pl-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {currentUser.name.charAt(0)}
               </div>
               <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
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
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={16} />
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Children */}
      {children.length > 0 && (
        <div className="pl-12 flex flex-col gap-3">
           {children.map(child => (
             <CommentItem 
               key={child.id}
               comment={child} 
               allComments={allComments} 
               currentUser={currentUser} 
               users={users}
               onDelete={onDelete} 
               onReply={onReply}
               onLike={onLike}
             />
           ))}
        </div>
      )}
    </div>
  );
};

const RiskDetail: React.FC<Props> = ({ risk, currentUser, users, onClose, onSave, onDelete, actions, onAddAction, onUpdateAction, onDeleteAction, comments, onAddComment, onDeleteComment, onLikeComment }) => {
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
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'actions' | 'comments' | 'escalation' | 'history'>('details');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  
  // Collaborator Autocomplete State
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [showCollaboratorList, setShowCollaboratorList] = useState(false);

  // Risk Owner Autocomplete State
  const [showOwnerList, setShowOwnerList] = useState(false);
  
  // Action Owner Autocomplete State
  const [showActionOwnerList, setShowActionOwnerList] = useState(false);
  const [showEditActionOwnerList, setShowEditActionOwnerList] = useState(false);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Escalation Tab State (Admin Feature)
  const [escalationSearch, setEscalationSearch] = useState('');
  const [activeEscalationLevel, setActiveEscalationLevel] = useState<EscalationLevel | null>(null);

  // Permission Logic
  const isNewRisk = !risk;
  const isOwner = risk ? risk.owner === currentUser.name : true; // Creator is owner
  const isAdmin = currentUser.role === 'RMIA';
  
  const canEdit = isNewRisk || isAdmin || isOwner;
  const canDelete = isAdmin; // STRICT: Only Admins (RMIA) can delete risks

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
    // Clear validation error if any
    if (validationError) setValidationError(null);
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
    if (validationError) setValidationError(null);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    if (validationError) setValidationError(null);
  };

  const handleCountrySelect = (c: Country) => {
    setFormData(prev => ({ ...prev, country: c }));
    setCountryOpen(false);
    if (validationError) setValidationError(null);
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

  // --- Escalation Logic with Checkbox & Admin Overrides ---

  // Helper: Find the "default" user for a given escalation level
  const getDefaultUserForLevel = (level: EscalationLevel): User | undefined => {
     let targetRole: UserRole | string = '';
     
     if (level === EscalationLevel.FUNCTIONAL_MANAGER) targetRole = 'Functional Manager';
     if (level === EscalationLevel.TEML_FUNCTIONAL_REVIEW) targetRole = 'TEML Functional';
     if (level === EscalationLevel.TEML_LEADERSHIP) targetRole = 'TEML Leadership Team';
     if (level === EscalationLevel.COUNTRY_MANAGER) targetRole = 'Country Manager';
     if (level === EscalationLevel.CORPORATE_RISK) targetRole = 'CEO'; // Or RMIA

     // Simple search - find first user with that role
     // In a real app, might filter by country too
     return users.find(u => u.role === targetRole || u.groups.includes(level));
  };

  const handleToggleEscalation = (level: EscalationLevel, isChecked: boolean) => {
    if (isChecked) {
      // Add Escalation (Default User)
      const defaultUser = getDefaultUserForLevel(level);
      
      if (defaultUser) {
        const newEntry: EscalationEntry = {
           level,
           userId: defaultUser.id,
           userName: defaultUser.name,
           date: new Date().toISOString()
        };
        setFormData(prev => ({
           ...prev,
           escalations: [...(prev.escalations || []), newEntry]
        }));
      } else {
        alert("No user found with the appropriate role to auto-populate this escalation.");
      }

    } else {
      // Remove ALL Escalations for this level (Simple toggle behavior)
      setFormData(prev => ({
         ...prev,
         escalations: (prev.escalations || []).filter(e => e.level !== level)
      }));
    }
  };

  const handleAddEscalationUser = (user: User, level: EscalationLevel) => {
     const newEntry: EscalationEntry = {
        level,
        userId: user.id,
        userName: user.name,
        date: new Date().toISOString()
     };
     setFormData(prev => ({
        ...prev,
        escalations: [...(prev.escalations || []), newEntry]
     }));
     setActiveEscalationLevel(null);
     setEscalationSearch('');
  };

  const handleRemoveEscalationUser = (userId: string, level: EscalationLevel) => {
     setFormData(prev => ({
        ...prev,
        escalations: (prev.escalations || []).filter(e => !(e.userId === userId && e.level === level))
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
    // SCORING VALIDATION
    const inherentScore = calculateRiskScore(formData.inherentImpact, formData.inherentLikelihood);
    const residualScore = calculateRiskScore(formData.residualImpact, formData.residualLikelihood);

    if (residualScore > inherentScore) {
      setValidationError("Please correct risk scoring");
      return;
    }

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
             {validationError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 animate-pulse">
                  <AlertCircle size={18} />
                  <span className="text-sm font-bold">{validationError}</span>
                </div>
             )}

             {/* STRICT CHECK: ONLY RMIA CAN DELETE RISKS */}
             {canDelete && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mr-2 border border-red-200 dark:border-red-800"
                  title="Delete Risk (Admin Only)"
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

        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-6 md:p-8">
          
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
               {/* SECTION 1: IDENTIFICATION */}
               <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 rounded-t-xl">
                     <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                     <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">1. Risk Identification</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                         Risk Title <span className="text-red-500">*</span>
                         <GuidanceTooltip title="Risk Title Guidelines" content="Clear, concise name for the risk event. Avoid generic terms like 'IT Risk'. Example: 'Data breach via phishing attack'." placement="right" />
                      </label>
                      <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
                        placeholder="E.g. Supply Chain Failure"
                      />
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {/* Country */}
                       <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Country</label>
                          <div className="relative" ref={countryRef}>
                             <button 
                                type="button"
                                disabled={!canEdit}
                                onClick={() => setCountryOpen(!countryOpen)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white flex items-center justify-between"
                             >
                                <span className="flex items-center gap-2">
                                   {selectedCountry && <img src={selectedCountry.flagUrl} alt="" className="w-5 h-5 rounded-full object-cover" />}
                                   {selectedCountry?.label || formData.country}
                                </span>
                                <ChevronDown size={16} />
                             </button>
                             {countryOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                   {COUNTRIES.map(c => (
                                      <button 
                                        key={c.code}
                                        onClick={() => handleCountrySelect(c.code as Country)}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-sm text-slate-700 dark:text-slate-200"
                                      >
                                         <img src={c.flagUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                                         {c.label}
                                      </button>
                                   ))}
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Risk Owner */}
                       <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Risk Owner</label>
                          <div className="relative">
                             <input 
                               type="text" 
                               name="owner"
                               value={formData.owner}
                               onChange={(e) => {
                                 handleInputChange(e);
                                 setShowOwnerList(true);
                               }}
                               onFocus={() => setShowOwnerList(true)}
                               onBlur={() => setTimeout(() => setShowOwnerList(false), 200)}
                               disabled={!canEdit}
                               className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                             />
                             {showOwnerList && canEdit && (
                               <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                  {users.filter(u => u.name.toLowerCase().includes(formData.owner.toLowerCase())).map(u => (
                                     <button 
                                       key={u.id}
                                       onClick={() => setFormData(prev => ({...prev, owner: u.name}))}
                                       className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
                                     >
                                       {u.name}
                                     </button>
                                  ))}
                               </div>
                             )}
                          </div>
                       </div>

                       {/* Risk Register */}
                       <div>
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Risk Register</label>
                         <select 
                           name="register"
                           value={formData.register}
                           onChange={handleRegisterChange}
                           disabled={!canEdit}
                           className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                         >
                            {RISK_REGISTER_DATA.map(r => (
                              <option key={r.register} value={r.register}>{r.register}</option>
                            ))}
                         </select>
                       </div>

                       {/* Function/Area */}
                       <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Function/Area</label>
                          <select 
                            name="functionArea"
                            value={formData.functionArea}
                            onChange={handleInputChange}
                            disabled={!canEdit}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                          >
                             {availableFunctions.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                       </div>

                       {/* Category */}
                       <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                          <select 
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            disabled={!canEdit}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                          >
                             {Object.values(RiskCategory).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                           Description <span className="text-red-500">*</span>
                           <GuidanceTooltip title="Description Formula" content="Use the formula: 'There is a risk that [Event], caused by [Cause], which may result in [Impact]'." />
                        </label>
                        {canEdit && (
                          <button 
                            onClick={handleAIDescriptionImprovement}
                            disabled={aiDescriptionLoading}
                            className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/30 px-2 py-1 rounded transition-colors"
                          >
                            <Sparkles size={14} /> 
                            {aiDescriptionLoading ? 'Analyzing...' : 'Improve with AI'}
                          </button>
                        )}
                      </div>
                      
                      {/* AI Suggestion Box */}
                      {aiDescriptionSuggestion && (
                         <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl animate-fade-in">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-purple-800 dark:text-purple-300 mb-2">
                              <Sparkles size={16} /> AI Suggestion
                            </h4>
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-purple-100 dark:border-purple-900/50 mb-3 text-sm text-slate-700 dark:text-slate-300">
                               <p className="font-mono text-xs text-slate-500 mb-1">Standardized Format:</p>
                               {aiDescriptionSuggestion.text}
                            </div>
                            <div className="text-xs text-purple-700 dark:text-purple-400 mb-3 italic">
                               Feedback: {aiDescriptionSuggestion.feedback}
                            </div>
                            <div className="flex gap-2">
                               <button onClick={handleAcceptAiDescription} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">Accept Improved Version</button>
                               <button onClick={handleDeclineAiDescription} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Discard</button>
                            </div>
                         </div>
                      )}

                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                        rows={5}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
                        placeholder="Detailed description of the risk..."
                      />
                    </div>
                  </div>
               </div>

               {/* SCORING FLOW SECTION */}
               <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-wider px-2">
                     <Shield size={14} /> Risk Assessment & Mitigation
                  </div>

                  {/* Step 1: Inherent Risk */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative">
                     <div className="absolute top-0 left-0 w-1 h-full bg-slate-400 rounded-l-xl"></div>
                     <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-xl">
                        <div className="flex items-center gap-2">
                           <AlertTriangle size={18} className="text-slate-500 dark:text-slate-400" />
                           <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase flex items-center">
                              2. Inherent Risk
                              <GuidanceTooltip title="Inherent Risk" content="The level of risk before any controls or mitigations are applied. Represents the worst-case scenario." />
                           </h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${inherentLevel.color}`}>{inherentLevel.label} ({inherentScore})</span>
                     </div>
                     <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center">
                                 Impact
                                 <GuidanceTooltip title="Impact Scale (Severity)" content={GUIDANCE_IMPACT} placement="right" />
                              </label>
                              <select 
                                name="inherentImpact"
                                value={formData.inherentImpact}
                                onChange={handleNumberChange}
                                disabled={!canEdit}
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white shadow-sm"
                              >
                                {IMPACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
                                {IMPACT_DEFINITIONS[formData.inherentImpact]}
                              </p>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center">
                                 Likelihood
                                 <GuidanceTooltip title="Likelihood Scale (Probability)" content={GUIDANCE_LIKELIHOOD} placement="left" />
                              </label>
                              <select 
                                name="inherentLikelihood"
                                value={formData.inherentLikelihood}
                                onChange={handleNumberChange}
                                disabled={!canEdit}
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white shadow-sm"
                              >
                                {LIKELIHOOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
                                {LIKELIHOOD_DEFINITIONS[formData.inherentLikelihood]}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center -my-3 z-10 relative">
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm text-slate-400">
                        <ArrowDown size={16} />
                     </div>
                  </div>

                  {/* Step 2: Controls & Mitigation */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
                      <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30 flex justify-between items-center rounded-t-xl">
                         <div className="flex items-center gap-2">
                           <Shield size={18} className="text-blue-600 dark:text-blue-400" />
                           <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">3. Controls & Mitigation</h4>
                         </div>
                         {canEdit && (
                           <button 
                             onClick={handleAISuggestion}
                             disabled={aiLoading}
                             className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-full transition-colors bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800"
                           >
                             <Lightbulb size={14} /> 
                             {aiLoading ? 'Thinking...' : 'Suggest'}
                           </button>
                         )}
                      </div>

                      <div className="p-6">
                         {/* AI Controls Suggestion */}
                         {aiControlsSuggestion && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl animate-fade-in">
                               <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                                 <Sparkles size={16} /> AI Mitigation Strategy
                               </h4>
                               <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
                                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                    {aiControlsSuggestion.text}
                                  </pre>
                               </div>
                               <div className="text-xs text-blue-700 dark:text-blue-400 mb-3 italic">
                                  Rationale: {aiControlsSuggestion.feedback}
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={handleAcceptAiControls} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Add to Controls</button>
                                  <button onClick={handleDeclineAiControls} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Discard</button>
                               </div>
                            </div>
                         )}

                         <div className="mb-4">
                           <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Controls Description</label>
                           <textarea 
                             name="controlsText"
                             value={formData.controlsText}
                             onChange={handleInputChange}
                             disabled={!canEdit}
                             rows={4}
                             className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                             placeholder="List existing controls and mitigation strategies..."
                           />
                         </div>

                         <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                               Controls Rating
                               <GuidanceTooltip title="Controls Effectiveness" content={GUIDANCE_CONTROLS} />
                            </label>
                            <select 
                              name="controlsRating"
                              value={formData.controlsRating}
                              onChange={handleInputChange}
                              disabled={!canEdit}
                              className="w-full md:w-1/2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                            >
                               {Object.values(ControlRating).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                         </div>
                      </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center -my-3 z-10 relative">
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm text-slate-400">
                        <ArrowDown size={16} />
                     </div>
                  </div>

                  {/* Step 3: Residual Risk */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                     <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-xl"></div>
                     <div className="px-6 py-3 bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-900/30 flex justify-between items-center rounded-t-xl">
                        <div className="flex items-center gap-2">
                          <Activity size={18} className="text-purple-600 dark:text-purple-400" />
                          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase flex items-center">
                             4. Residual Risk
                             <GuidanceTooltip title="Residual Risk" content="The remaining risk level after applying the current controls. This is the 'Actual' risk exposure." />
                          </h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${residualLevel.color}`}>{residualLevel.label} ({residualScore})</span>
                     </div>
                     <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center">
                                 Impact
                                 <GuidanceTooltip title="Impact Scale (Severity)" content={GUIDANCE_IMPACT} placement="right" />
                              </label>
                              <select 
                                name="residualImpact"
                                value={formData.residualImpact}
                                onChange={handleNumberChange}
                                disabled={!canEdit}
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:text-white font-bold"
                              >
                                {IMPACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
                                {IMPACT_DEFINITIONS[formData.residualImpact]}
                              </p>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center">
                                 Likelihood
                                 <GuidanceTooltip title="Likelihood Scale (Probability)" content={GUIDANCE_LIKELIHOOD} placement="left" />
                              </label>
                              <select 
                                name="residualLikelihood"
                                value={formData.residualLikelihood}
                                onChange={handleNumberChange}
                                disabled={!canEdit}
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:text-white font-bold"
                              >
                                {LIKELIHOOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
                                {LIKELIHOOD_DEFINITIONS[formData.residualLikelihood]}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* SECTION 3: STATUS (Footer) */}
               <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mt-8">
                  <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                           <Target size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-emerald-900 dark:text-emerald-300 uppercase text-sm">5. Current Status</h4>
                           <p className="text-xs text-emerald-700 dark:text-emerald-400">Final determination of risk state</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 max-w-xs">
                        <select 
                           name="status"
                           value={formData.status}
                           onChange={handleInputChange}
                           disabled={!canEdit}
                           className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 font-bold text-sm outline-none transition-colors ${
                             formData.status === 'Open' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-slate-800 dark:border-blue-900 dark:text-blue-400' : 
                             formData.status === 'Reviewed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:border-emerald-900 dark:text-emerald-400' : 
                             formData.status === 'Closed' ? 'border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400' : 
                             'border-amber-200 bg-amber-50 text-amber-700 dark:bg-slate-800 dark:border-amber-900 dark:text-amber-400'
                           }`}
                        >
                           {Object.values(RiskStatus).map(s => (
                             <option 
                               key={s} 
                               value={s}
                               disabled={!isAdmin && s !== RiskStatus.OPEN && s !== RiskStatus.UPDATED && s !== formData.status}
                             >
                               {s}
                             </option>
                           ))}
                        </select>
                     </div>
                  </div>
               </div>

               {/* Collaborators */}
               <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Collaborators</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                     {formData.collaborators.map(c => (
                        <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700">
                           <UserIcon size={12} /> {c}
                           {canEdit && <button onClick={() => handleRemoveCollaborator(c)} className="hover:text-red-500"><X size={14} /></button>}
                        </span>
                     ))}
                     {canEdit && (
                       <button 
                         onClick={() => setShowCollaboratorList(true)}
                         className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500 text-sm"
                       >
                          <Plus size={14} /> Add
                       </button>
                     )}
                  </div>
                  
                  {/* Collaborator Search Dropdown */}
                  {showCollaboratorList && (
                     <div className="max-w-xs relative animate-fade-in">
                        <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
                           <Search size={16} className="text-slate-400" />
                           <input 
                             autoFocus
                             type="text" 
                             placeholder="Search users..." 
                             value={collaboratorSearch}
                             onChange={(e) => setCollaboratorSearch(e.target.value)}
                             className="flex-1 bg-transparent outline-none text-sm dark:text-white"
                           />
                           <button onClick={() => setShowCollaboratorList(false)}><X size={16} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                           {filteredCollaboratorOptions.length === 0 ? (
                             <div className="p-3 text-sm text-slate-500">No users found</div>
                           ) : (
                             filteredCollaboratorOptions.map(u => (
                               <button 
                                 key={u.id}
                                 onClick={() => handleAddCollaborator(u.name)}
                                 className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
                               >
                                 {u.name} <span className="text-slate-400 text-xs ml-1">({u.role})</span>
                               </button>
                             ))
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>
          )}
          
          {/* Actions Tab */}
          {activeTab === 'actions' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Mitigation Action Plan</h3>
                   {canEdit && (
                     <button 
                       onClick={() => setShowActionForm(!showActionForm)}
                       className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
                     >
                        <Plus size={18} /> Add Action
                     </button>
                   )}
                </div>

                {/* Add Action Form */}
                {showActionForm && (
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">New Action Item</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <input 
                           type="text" 
                           placeholder="Action Title"
                           value={newAction.title}
                           onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                           className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                         />
                         
                         {/* Action Owner Selection (New) */}
                         <div className="relative">
                           <input 
                             type="text" 
                             placeholder="Owner (Search...)"
                             value={newAction.owner}
                             onChange={(e) => setNewAction({...newAction, owner: e.target.value})}
                             onFocus={() => setShowActionOwnerList(true)}
                             onBlur={() => setTimeout(() => setShowActionOwnerList(false), 200)}
                             className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                           />
                           {showActionOwnerList && (
                             <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                {users.filter(u => u.name.toLowerCase().includes((newAction.owner || '').toLowerCase())).map(u => (
                                   <button 
                                     key={u.id}
                                     onMouseDown={() => setNewAction({...newAction, owner: u.name})}
                                     className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
                                   >
                                     {u.name}
                                   </button>
                                ))}
                             </div>
                           )}
                         </div>

                         <input 
                           type="date" 
                           value={newAction.dueDate}
                           onChange={(e) => setNewAction({...newAction, dueDate: e.target.value})}
                           className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                         />
                         <select 
                           value={newAction.status}
                           onChange={(e) => setNewAction({...newAction, status: e.target.value as any})}
                           className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                         >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="Approved">Approved</option>
                         </select>
                      </div>
                      <textarea 
                        placeholder="Detailed description..."
                        value={newAction.description}
                        onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white mb-4"
                        rows={3}
                      />
                      
                      {/* Attachments for New Action */}
                      <div className="mb-4">
                         <div className="flex items-center gap-2 mb-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-600 dark:text-slate-300">
                               <Paperclip size={14} /> Attach Files
                               <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                            </label>
                            <span className="text-xs text-slate-400">PDF, Excel, Images allowed</span>
                         </div>
                         {newAction.attachments && newAction.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                               {newAction.attachments.map(att => (
                                  <div key={att.id} className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                                     <FileText size={12} className="text-blue-500" />
                                     <span className="truncate max-w-[150px]">{att.name}</span>
                                     <button onClick={() => handleRemoveAttachment(att.id, false)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>

                      <div className="flex justify-end gap-3">
                         <button onClick={() => setShowActionForm(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                         <button onClick={handleSaveAction} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Action</button>
                      </div>
                   </div>
                )}

                {/* Actions List */}
                {actions.length === 0 ? (
                   <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <p>No action plans defined.</p>
                   </div>
                ) : (
                   <div className="space-y-4">
                      {actions.map(action => (
                         <div key={action.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            {editingActionId === action.id && editingActionData ? (
                               // Edit Mode
                               <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <input 
                                       value={editingActionData.title}
                                       onChange={(e) => setEditingActionData({...editingActionData, title: e.target.value})}
                                       className="px-3 py-2 border rounded-lg text-sm dark:bg-slate-900 dark:border-slate-600"
                                     />
                                     <select 
                                       value={editingActionData.status}
                                       onChange={(e) => setEditingActionData({...editingActionData, status: e.target.value as any})}
                                       className="px-3 py-2 border rounded-lg text-sm dark:bg-slate-900 dark:border-slate-600"
                                     >
                                        <option value="Open">Open</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Approved">Approved</option>
                                     </select>
                                  </div>

                                  {/* Edit Mode Owner (Dropdown) */}
                                  <div className="relative">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Owner</label>
                                    <input 
                                       type="text"
                                       value={editingActionData.owner}
                                       onChange={(e) => setEditingActionData({...editingActionData, owner: e.target.value})}
                                       onFocus={() => setShowEditActionOwnerList(true)}
                                       onBlur={() => setTimeout(() => setShowEditActionOwnerList(false), 200)}
                                       className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-900 dark:border-slate-600"
                                    />
                                    {showEditActionOwnerList && (
                                       <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                          {users.filter(u => u.name.toLowerCase().includes((editingActionData.owner || '').toLowerCase())).map(u => (
                                             <button 
                                                key={u.id}
                                                onMouseDown={() => setEditingActionData({...editingActionData, owner: u.name})}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
                                             >
                                                {u.name}
                                             </button>
                                          ))}
                                       </div>
                                    )}
                                  </div>

                                  <textarea 
                                    value={editingActionData.description}
                                    onChange={(e) => setEditingActionData({...editingActionData, description: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-900 dark:border-slate-600"
                                    rows={2}
                                  />
                                  <div className="flex justify-end gap-2">
                                     <button onClick={handleCancelEditAction} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                                     <button onClick={handleSaveEditAction} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded">Save</button>
                                  </div>
                               </div>
                            ) : (
                               // View Mode
                               <div>
                                  <div className="flex justify-between items-start mb-2">
                                     <h4 className={`font-bold text-base ${action.status === 'Closed' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{action.title}</h4>
                                     <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${action.status === 'Open' ? 'bg-blue-100 text-blue-700' : action.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                           {action.status}
                                        </span>
                                        {canEdit && (
                                           <div className="flex gap-1 ml-2">
                                              <button onClick={() => handleStartEditAction(action)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500"><Edit2 size={14} /></button>
                                              <button onClick={() => handleDeleteActionClick(action.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                           </div>
                                        )}
                                     </div>
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{action.description}</p>
                                  
                                  {/* Attachments List */}
                                  {action.attachments && action.attachments.length > 0 && (
                                     <div className="flex flex-wrap gap-2 mb-3">
                                        {action.attachments.map(att => (
                                           <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors">
                                              <FileText size={12} className="text-blue-500" />
                                              {att.name}
                                              <Download size={12} className="text-slate-400" />
                                           </a>
                                        ))}
                                     </div>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2">
                                     <span className="flex items-center gap-1"><UserIcon size={12} /> {action.owner}</span>
                                     <span className="flex items-center gap-1"><Calendar size={12} /> Due: {action.dueDate}</span>
                                  </div>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                )}
             </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
             <div className="flex flex-col h-full relative">
                <div className="flex-1 overflow-y-auto pr-2 pb-24 space-y-6">
                   {comments.filter(c => !c.parentId).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                         <MessageSquare size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
                         <p>No discussion yet.</p>
                         <p className="text-sm">Start the conversation by adding a comment below.</p>
                      </div>
                   ) : (
                      comments.filter(c => !c.parentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(comment => (
                        <CommentItem 
                          key={comment.id} 
                          comment={comment} 
                          allComments={comments} 
                          currentUser={currentUser} 
                          users={users}
                          onDelete={onDeleteComment}
                          onReply={(txt, pid) => onAddComment(txt, pid)}
                          onLike={onLikeComment}
                        />
                      ))
                   )}
                </div>
                
                {/* New Sticky Footer Input Layout */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-4 pb-2">
                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all shadow-sm">
                      <div className="flex justify-between items-center mb-2 px-1">
                         <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">New Comment / Feedback</span>
                         <span className="text-xs text-slate-500 flex items-center gap-1">
                            Posting as: <span className="font-bold text-blue-600 dark:text-blue-400">{currentUser.name}</span>
                            <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-bold">{currentUser.role}</span>
                         </span>
                      </div>
                      <div className="flex gap-3">
                         <div className="flex-1">
                            <textarea 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 resize-none min-h-[40px]"
                              placeholder="Add a formal comment or update..."
                              rows={2}
                              onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if(newComment.trim()) {
                                    onAddComment(newComment, undefined);
                                    setNewComment('');
                                  }
                                }
                              }}
                            />
                         </div>
                         <button 
                           onClick={() => {
                             if(newComment.trim()) {
                               onAddComment(newComment, undefined);
                               setNewComment('');
                             }
                           }}
                           disabled={!newComment.trim()}
                           className={`p-2.5 rounded-lg transition-colors flex-shrink-0 self-end ${
                             newComment.trim() 
                               ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                               : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                           }`}
                         >
                            <Send size={18} />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Escalation Tab - REDESIGNED */}
          {activeTab === 'escalation' && (
             <div className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 flex gap-3 items-start">
                   <ShieldAlert className="text-orange-600 flex-shrink-0" size={24} />
                   <div>
                      <h4 className="font-bold text-orange-800 dark:text-orange-300">Risk Escalation Protocol</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">Escalating a risk notifies higher management and adds the risk to their oversight dashboard. Check the box to activate escalation.</p>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                   <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">Escalation Levels</h4>
                   </div>
                   
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ESCALATION_LEVELS.map(level => {
                         // Check if this level is currently active (in formData)
                         const activeEntries = formData.escalations?.filter(e => e.level === level) || [];
                         const isChecked = activeEntries.length > 0;
                         
                         // Determine default user for display if no active entries (so managers see who it WOULD go to)
                         const defaultUser = getDefaultUserForLevel(level);

                         return (
                            <div key={level} className={`p-4 transition-colors flex items-start md:items-center gap-4 ${isChecked ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                               {/* Checkbox (Always visible, handles toggle) */}
                               <div className="flex items-center h-full pt-1 md:pt-0">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                     <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={isChecked}
                                        onChange={(e) => canEdit && handleToggleEscalation(level, e.target.checked)}
                                        disabled={!canEdit}
                                     />
                                     <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-600"></div>
                                  </label>
                               </div>

                               {/* Level Info */}
                               <div className="flex-1">
                                  <h5 className={`font-bold text-sm ${isChecked ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{level}</h5>
                                  <p className="text-xs text-slate-400">Authority Role: {level.replace('Escalation', '').replace('Profile', '').trim()}</p>
                               </div>

                               {/* User Display Area */}
                               <div className="flex flex-col gap-2 min-w-[200px] items-end">
                                  {/* List of Escalated Users */}
                                  {activeEntries.length > 0 ? (
                                     activeEntries.map(entry => (
                                        <div key={entry.userId} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isChecked ? 'bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-800' : 'bg-slate-100 dark:bg-slate-800 border-transparent opacity-60'}`}>
                                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isChecked ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                                              {entry.userName.charAt(0)}
                                           </div>
                                           <div className="flex flex-col">
                                              <span className={`text-sm font-medium leading-none ${isChecked ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500'}`}>{entry.userName}</span>
                                           </div>
                                           {isAdmin && canEdit && (
                                              <button 
                                                onClick={() => handleRemoveEscalationUser(entry.userId, level)}
                                                className="ml-1 text-slate-400 hover:text-red-500 p-0.5 rounded"
                                                title="Remove User"
                                              >
                                                 <X size={12} />
                                              </button>
                                           )}
                                        </div>
                                     ))
                                  ) : (
                                     // Show Default Ghost User if unchecked
                                     defaultUser && (
                                       <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-700 opacity-60">
                                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-200 text-slate-500">
                                             {defaultUser.name.charAt(0)}
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-sm font-medium leading-none text-slate-500 italic">{defaultUser.name}</span>
                                          </div>
                                       </div>
                                     )
                                  )}

                                  {/* Admin: Add User Button */}
                                  {isAdmin && canEdit && isChecked && (
                                     <div className="relative">
                                        {activeEscalationLevel === level ? (
                                           <div className="flex items-center gap-2 animate-fade-in">
                                              <div className="relative">
                                                 <input 
                                                    autoFocus
                                                    className="w-48 px-2 py-1 text-xs border border-blue-300 rounded shadow-sm outline-none"
                                                    placeholder="Search user..."
                                                    value={escalationSearch}
                                                    onChange={(e) => setEscalationSearch(e.target.value)}
                                                 />
                                                 {/* Dropdown Results */}
                                                 {escalationSearch && (
                                                    <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                                       {users.filter(u => u.name.toLowerCase().includes(escalationSearch.toLowerCase())).map(u => (
                                                          <button 
                                                             key={u.id}
                                                             onClick={() => handleAddEscalationUser(u, level)}
                                                             className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between"
                                                          >
                                                             <span>{u.name}</span>
                                                             <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-1 rounded">{u.role}</span>
                                                          </button>
                                                       ))}
                                                    </div>
                                                 )}
                                              </div>
                                              <button onClick={() => setActiveEscalationLevel(null)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                           </div>
                                        ) : (
                                           <button 
                                              onClick={() => setActiveEscalationLevel(level)}
                                              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                           >
                                              <Plus size={12} /> Add Person
                                           </button>
                                        )}
                                     </div>
                                  )}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="font-bold text-slate-800 dark:text-white">Audit Trail</h3>
                   <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {formData.history?.length || 0} Records
                   </span>
                </div>
                
                <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                   {(!formData.history || formData.history.length === 0) && (
                      <div className="pl-6 text-slate-400 italic">No history recorded.</div>
                   )}
                   {formData.history?.map((log) => (
                      <div key={log.id} className="relative pl-6">
                         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500"></div>
                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                            <span className="font-bold text-slate-800 dark:text-white text-sm">{log.action}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                               <Clock size={12} /> {new Date(log.date).toLocaleString()}
                            </span>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            {log.details}
                         </p>
                         <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <UserIcon size={12} />
                            <span>by {log.user}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

        </div>

        {/* Footer Actions if needed (like persistent save button on mobile) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 md:hidden bg-white dark:bg-slate-900">
           <button 
             onClick={handleSaveWithAudit}
             className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2"
           >
              <Save size={18} /> Save Changes
           </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border-t-4 border-red-500 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Trash2 size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Delete Risk?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <span className="font-bold">{formData.id}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => risk && onDelete(risk.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDetail;
