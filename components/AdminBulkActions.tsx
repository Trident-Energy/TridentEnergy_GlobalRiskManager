
import React, { useState } from 'react';
import { User, Country, EscalationLevel, Risk } from '../types';
import { COUNTRIES, ESCALATION_LEVELS, RISK_REGISTER_DATA } from '../constants';
import { Shield, Briefcase, Users, ArrowDown } from 'lucide-react';

interface Props {
  users: User[];
  risks: Risk[];
  onBulkEscalate: (country: Country, register: string, level: EscalationLevel, userId: string) => void;
  onBulkTransferOwnership: (fromUserId: string, toUserId: string) => void;
  onBulkAddCollaborator: (country: Country, register: string, userId: string) => void;
}

const AdminBulkActions: React.FC<Props> = ({ users, risks, onBulkEscalate, onBulkTransferOwnership, onBulkAddCollaborator }) => {
  
  // --- State for Bulk Escalation ---
  const [escCountry, setEscCountry] = useState<Country>(Country.BR);
  const [escRegister, setEscRegister] = useState<string>('ALL');
  const [escLevel, setEscLevel] = useState<EscalationLevel>(EscalationLevel.COUNTRY_MANAGER);
  const [escUser, setEscUser] = useState<string>('');
  const [showEscConfirm, setShowEscConfirm] = useState(false);

  // --- State for Ownership Transfer ---
  const [transferFrom, setTransferFrom] = useState<string>('');
  const [transferTo, setTransferTo] = useState<string>('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  // --- State for Bulk Collaborator ---
  const [collabCountry, setCollabCountry] = useState<Country>(Country.BR);
  const [collabRegister, setCollabRegister] = useState<string>('ALL');
  const [collabUser, setCollabUser] = useState<string>('');
  const [showCollabConfirm, setShowCollabConfirm] = useState(false);

  // Helper to count impacted risks
  const getImpactedEscalationCount = () => risks.filter(r => {
    const matchCountry = r.country === escCountry;
    const matchRegister = escRegister === 'ALL' || r.register === escRegister;
    return matchCountry && matchRegister;
  }).length;

  const getImpactedTransferCount = () => risks.filter(r => r.owner === users.find(u => u.id === transferFrom)?.name).length;
  
  const getImpactedCollabCount = () => risks.filter(r => {
    const matchCountry = r.country === collabCountry;
    const matchRegister = collabRegister === 'ALL' || r.register === collabRegister;
    return matchCountry && matchRegister;
  }).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
      
      {/* 1. BULK ESCALATION ASSIGNMENT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Bulk Escalation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Assign an escalation point for a whole region.</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Select Country</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={escCountry}
              onChange={(e) => setEscCountry(e.target.value as Country)}
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Risk Register</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={escRegister}
              onChange={(e) => setEscRegister(e.target.value)}
            >
              <option value="ALL">All Registers</option>
              {RISK_REGISTER_DATA.map(r => <option key={r.register} value={r.register}>{r.register}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Escalation Level</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={escLevel}
              onChange={(e) => setEscLevel(e.target.value as EscalationLevel)}
            >
              {ESCALATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Assign User</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={escUser}
              onChange={(e) => setEscUser(e.target.value)}
            >
              <option value="">Select User...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            disabled={!escUser}
            onClick={() => setShowEscConfirm(true)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Escalation
          </button>
        </div>
      </div>

      {/* 2. BULK OWNERSHIP TRANSFER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
            <Briefcase size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Transfer Ownership</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Move all risks from one user to another.</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1">Transfer From (Current Owner)</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={transferFrom}
              onChange={(e) => setTransferFrom(e.target.value)}
            >
              <option value="">Select User...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowDown size={20} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Transfer To (New Owner)</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
            >
              <option value="">Select User...</option>
              {users.filter(u => u.id !== transferFrom).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            disabled={!transferFrom || !transferTo}
            onClick={() => setShowTransferConfirm(true)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Transfer Risks
          </button>
        </div>
      </div>

      {/* 3. BULK COLLABORATOR ASSIGNMENT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Add Collaborator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add a user to risks in a specific country or register.</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
           <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Select Country</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={collabCountry}
              onChange={(e) => setCollabCountry(e.target.value as Country)}
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Risk Register</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={collabRegister}
              onChange={(e) => setCollabRegister(e.target.value)}
            >
              <option value="ALL">All Registers</option>
              {RISK_REGISTER_DATA.map(r => <option key={r.register} value={r.register}>{r.register}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">User to Add</label>
            <select 
              className="w-full p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={collabUser}
              onChange={(e) => setCollabUser(e.target.value)}
            >
              <option value="">Select User...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/50">
             <p className="text-xs text-purple-700 dark:text-purple-300 italic">
               Useful for adding new Country Managers, HSE Leads, or Compliance Officers to a specific region's visibility.
             </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
             disabled={!collabUser}
             onClick={() => setShowCollabConfirm(true)}
             className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Collaborator
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL - ESCALATION */}
      {showEscConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border-t-4 border-orange-500">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Confirm Bulk Escalation</h3>
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
               You are about to assign <strong>{users.find(u => u.id === escUser)?.name}</strong> as 
               <strong> {escLevel}</strong> for <span className="font-bold">{getImpactedEscalationCount()}</span> risks in {escCountry}
               {escRegister !== 'ALL' && <span> (Register: {escRegister})</span>}.
             </p>
             <div className="flex gap-3">
                <button onClick={() => setShowEscConfirm(false)} className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg">Cancel</button>
                <button 
                  onClick={() => {
                    onBulkEscalate(escCountry, escRegister, escLevel, escUser);
                    setShowEscConfirm(false);
                  }} 
                  className="flex-1 px-3 py-2 bg-orange-600 text-white font-bold rounded-lg"
                >
                  Confirm
                </button>
             </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - TRANSFER */}
      {showTransferConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border-t-4 border-blue-500">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Confirm Ownership Transfer</h3>
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
               You are about to transfer <span className="font-bold">{getImpactedTransferCount()}</span> risks from 
               <strong> {users.find(u => u.id === transferFrom)?.name}</strong> to 
               <strong> {users.find(u => u.id === transferTo)?.name}</strong>.
             </p>
             <div className="flex gap-3">
                <button onClick={() => setShowTransferConfirm(false)} className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg">Cancel</button>
                <button 
                  onClick={() => {
                    onBulkTransferOwnership(transferFrom, transferTo);
                    setShowTransferConfirm(false);
                  }} 
                  className="flex-1 px-3 py-2 bg-blue-600 text-white font-bold rounded-lg"
                >
                  Confirm
                </button>
             </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - COLLABORATOR */}
      {showCollabConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border-t-4 border-purple-500">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Confirm Bulk Add</h3>
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
               You are about to add <strong>{users.find(u => u.id === collabUser)?.name}</strong> as a collaborator to 
               <span className="font-bold"> {getImpactedCollabCount()}</span> risks in {collabCountry}
               {collabRegister !== 'ALL' && <span> (Register: {collabRegister})</span>}.
             </p>
             <div className="flex gap-3">
                <button onClick={() => setShowCollabConfirm(false)} className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg">Cancel</button>
                <button 
                  onClick={() => {
                    onBulkAddCollaborator(collabCountry, collabRegister, collabUser);
                    setShowCollabConfirm(false);
                  }} 
                  className="flex-1 px-3 py-2 bg-purple-600 text-white font-bold rounded-lg"
                >
                  Confirm
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBulkActions;
