
import React, { useState } from 'react';
import { User, UserRole, Entity } from '../types';
import { MOCK_USERS } from '../constants';
import { Edit2, Trash2, Plus, Shield, CheckCircle, Power } from 'lucide-react';

interface AdminSettingsProps {
  currentUser: User;
}

export const AdminSettings: React.FC<AdminSettingsProps> = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const handleEntityChange = (id: string, newEntity: Entity) => {
    setUsers(users.map(u => u.id === id ? { ...u, entity: newEntity } : u));
  };

  const toggleActiveStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Settings</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage user access, roles, and system configurations.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm font-medium transition-colors">
          <Plus size={18} className="mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
          <Shield className="text-slate-400 dark:text-slate-500" size={20} />
          <h3 className="font-bold text-slate-800 dark:text-white">User Management</h3>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleActiveStatus(user.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      user.isActive 
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600'
                    }`}
                    title="Toggle Status"
                  >
                    {user.isActive ? <CheckCircle size={12} /> : <Power size={12} />}
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className={`font-medium ${user.isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {user.name}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                   {editingId === user.id ? (
                     <select 
                       className="border rounded p-1.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                       value={user.entity}
                       onChange={(e) => handleEntityChange(user.id, e.target.value as Entity)}
                     >
                       {Object.values(Entity).map(e => <option key={e} value={e}>{e}</option>)}
                     </select>
                   ) : (
                     <span className="text-sm text-slate-600 dark:text-slate-300">{user.entity}</span>
                   )}
                </td>

                <td className="px-6 py-4">
                   {editingId === user.id ? (
                     <select 
                       className="border rounded p-1.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                       value={user.role}
                       onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                     >
                       {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                   ) : (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                       {user.role}
                     </span>
                   )}
                </td>

                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  {editingId === user.id ? (
                    <button onClick={() => setEditingId(null)} className="text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400 bg-green-50 dark:bg-green-900/20 p-1 rounded">
                      <CheckCircle size={18} />
                    </button>
                  ) : (
                    <button onClick={() => setEditingId(user.id)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
