
import React, { useState, useEffect } from 'react';
import { User, UserRole, EscalationLevel, Country } from '../types';
import { GROUPS, ESCALATION_LEVELS, COUNTRIES } from '../constants';
import { Plus, X, Save, Edit2, Trash2, User as UserIcon, Shield, Globe, Check, Mail, ChevronDown } from 'lucide-react';

interface Props {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserManagement: React.FC<Props> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Manager', // Default role is now Manager
    groups: [],
    country: undefined
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Manager', // Default role
      groups: [],
      country: undefined
    });
    setEditingId(null);
    setIsAdmin(false);
    setIsFormOpen(false);
  };

  const handleEditClick = (user: User) => {
    setFormData({ ...user });
    setEditingId(user.id);
    setIsAdmin(user.role === 'RMIA');
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role) return;

    if (editingId) {
      // Update
      onUpdateUser({ ...formData, id: editingId } as User);
    } else {
      // Create
      onAddUser({
        ...formData,
        id: `U-${Date.now()}`,
        groups: formData.groups || []
      } as User);
    }
    resetForm();
  };

  const toggleGroup = (groupId: string) => {
    setFormData(prev => {
      const currentGroups = prev.groups || [];
      if (currentGroups.includes(groupId)) {
        return { ...prev, groups: currentGroups.filter(g => g !== groupId) };
      } else {
        return { ...prev, groups: [...currentGroups, groupId] };
      }
    });
  };

  // Effect to automatically set Role based on selected Escalation Authorities (Groups)
  useEffect(() => {
    if (isAdmin) {
      setFormData(prev => ({ ...prev, role: 'RMIA' }));
      return;
    }

    const groups = formData.groups || [];
    let newRole: UserRole = 'Manager'; // Default is Manager

    // Priority Logic for Auto-Role Assignment based on Escalation Authority
    if (groups.includes(EscalationLevel.CORPORATE_RISK)) {
      newRole = 'CEO';
    } else if (groups.includes(EscalationLevel.TEML_LEADERSHIP)) {
      newRole = 'TEML Leadership Team';
    } else if (groups.includes(EscalationLevel.COUNTRY_MANAGER)) {
      newRole = 'Country Manager';
    } else if (groups.includes(EscalationLevel.TEML_FUNCTIONAL_REVIEW)) {
      newRole = 'TEML Functional';
    } else if (groups.includes(EscalationLevel.FUNCTIONAL_MANAGER)) {
      newRole = 'Functional Manager';
    }

    setFormData(prev => ({ ...prev, role: newRole }));
  }, [formData.groups, isAdmin]);

  // Helper to get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Manager': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'RMIA': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'CEO': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Country Manager': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'TEML Leadership Team': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'TEML Functional': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Functional Manager': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">User Administration</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage system users, assign roles, and configure regional & escalation access.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
          >
            <Plus size={18} /> Add User
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-wider">
              {editingId ? 'Edit User' : 'Create New User'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Row 1: Basic Info & Role Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    placeholder="john@company.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Country Select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <select 
                    value={formData.country || ''}
                    onChange={(e) => setFormData({...formData, country: e.target.value as Country})}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white appearance-none"
                  >
                    <option value="">Global / No Specific Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Admin Checkbox */}
              <div className="flex items-end">
                 <label className="flex items-center gap-3 p-2 border border-slate-200 dark:border-slate-700 rounded-lg w-full cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white/50 dark:bg-slate-800/50">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isAdmin ? 'bg-purple-600 border-purple-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                        {isAdmin && <Check size={12} className="text-white" />}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden"
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)} 
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Admin Privileges</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">User will be identified as RMIA (Risk Manager & Internal Audit)</span>
                    </div>
                 </label>
              </div>
            </div>

            {/* Row 2: Permissions / Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Regional Access */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 text-sm mb-3">
                  <Globe size={16} className="text-blue-500" /> Regional Registers
                </h4>
                <div className="space-y-2">
                  {GROUPS.map((group) => (
                    <label key={group.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.groups?.includes(group.id) ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                        {formData.groups?.includes(group.id) && <Check size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.groups?.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{group.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Escalation Authority */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 text-sm mb-3">
                  <Shield size={16} className="text-orange-500" /> Escalation Authority
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {ESCALATION_LEVELS.map((level) => (
                    <label key={level} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.groups?.includes(level) ? 'bg-orange-500 border-orange-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                        {formData.groups?.includes(level) && <Check size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.groups?.includes(level)}
                        onChange={() => toggleGroup(level)}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{level}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                   <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      Note: Selecting an escalation authority will automatically update the user's Role.
                   </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={resetForm}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
              >
                <Save size={18} /> {editingId ? 'Update User' : 'Save User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Assigned Groups & Escalations</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => {
               // Separate groups into Registers and Escalations for visual clarity
               const registerGroups = user.groups.filter(g => GROUPS.some(gr => gr.id === g));
               const escalationGroups = user.groups.filter(g => ESCALATION_LEVELS.includes(g as any));

               return (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                          {user.name.charAt(0)}
                        </div>
                        {user.country && (
                          <img 
                            src={COUNTRIES.find(c => c.code === user.country)?.flagUrl} 
                            alt={user.country}
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm"
                            title={`User location: ${user.country}`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                       {/* Register Badges */}
                       {registerGroups.map(gid => {
                          const label = GROUPS.find(g => g.id === gid)?.label.replace('Country Risk Register ', '');
                          return (
                             <span key={gid} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded border border-blue-100 dark:border-blue-800">
                                <Globe size={10} /> {label}
                             </span>
                          );
                       })}
                       
                       {/* Escalation Badges */}
                       {escalationGroups.map(level => (
                          <span key={level} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold rounded border border-orange-100 dark:border-orange-800">
                             <Shield size={10} /> {level}
                          </span>
                       ))}

                       {user.groups.length === 0 && <span className="text-slate-400 text-xs italic">No assignments</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
