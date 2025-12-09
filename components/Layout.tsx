import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, FilePlus, Settings, Moon, Sun, BookOpen, ChevronDown, User as UserIcon, Shield } from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: string;
  onChangeView: (view: string) => void;
  onChangeUser: (userId: string) => void;
  onChangeRole: (role: UserRole) => void;
  children: React.ReactNode;
  allUsers: User[];
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  currentView, 
  onChangeView, 
  onChangeUser, 
  onChangeRole,
  children, 
  allUsers,
  darkMode,
  toggleDarkMode
}) => {
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col`}>
      {/* 1. Primary Header - Custom Brand Color #283C50 */}
      <header className="bg-[#283C50] text-white px-6 py-3 flex items-center justify-between border-b border-[#1f3041] shrink-0 z-50 shadow-sm gap-4">
        
        {/* Logo / Header Image */}
        <div className="flex items-center gap-4 cursor-pointer shrink-0" onClick={() => onChangeView('dashboard')}>
          <img 
            src="https://www.trident-energy.com/app/themes/trident-energy/dist/images/favicon.png?id=2e0b14e50770eab630923c46b052a708" 
            alt="Trident Energy Contract Guard" 
            className="h-10 w-auto object-contain" 
          />
          <div className="hidden md:block h-6 w-px bg-white/20"></div>
          <h1 className="hidden md:block text-lg font-semibold tracking-tight text-white/90">High Risk Contracts Review</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
           
           {/* TEST CONTROLS: Explicitly separated User Identity and Role Override */}
           <div className="hidden lg:flex items-center bg-black/20 rounded-lg border border-white/10 p-1 mr-2">
              
              {/* Identity Selector */}
              <div className="relative group px-3 py-0.5 border-r border-white/10">
                 <label className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    <UserIcon size={10} /> Identity
                 </label>
                 <div className="flex items-center">
                    <select 
                        className="bg-transparent border-none p-0 pr-6 text-sm font-semibold text-white focus:ring-0 cursor-pointer w-32 appearance-none outline-none truncate hover:text-blue-200 transition-colors"
                        value={user.id}
                        onChange={(e) => onChangeUser(e.target.value)}
                        title="Switch User Identity"
                    >
                        {allUsers.map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-800 text-white">
                            {u.name}
                        </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 bottom-1.5 text-slate-400 pointer-events-none" />
                 </div>
              </div>

              {/* Role Selector */}
              <div className="relative group px-3 py-0.5">
                 <label className="flex items-center gap-1.5 text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-0.5">
                    <Shield size={10} /> Role Override
                 </label>
                 <div className="flex items-center">
                    <select 
                        className="bg-transparent border-none p-0 pr-6 text-sm font-semibold text-blue-100 focus:ring-0 cursor-pointer w-36 appearance-none outline-none truncate hover:text-white transition-colors"
                        value={user.role}
                        onChange={(e) => onChangeRole(e.target.value as UserRole)}
                        title="Override Permissions for Testing"
                    >
                        {Object.values(UserRole).map(r => (
                        <option key={r} value={r} className="bg-slate-800 text-white">
                            {r}
                        </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 bottom-1.5 text-blue-300 pointer-events-none" />
                 </div>
              </div>
           </div>

           <div className="hidden lg:block h-8 w-px bg-white/20"></div>

           {/* Dark Mode Toggle */}
           <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

           {/* User Profile Avatar */}
           <div className="relative group cursor-pointer" title={`Logged in as ${user.name}`}>
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/10">
                {user.name.charAt(0)}
             </div>
             <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#283C50] ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
           </div>
        </div>
      </header>

      {/* 2. Secondary Navigation - Same Brand Color #283C50 */}
      <nav className="bg-[#283C50] border-b border-[#1f3041] px-6 py-0 shrink-0 shadow-md z-40">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => onChangeView('dashboard')} 
          />
          {(user.role === UserRole.SCM || user.role === UserRole.CORPORATE_LEGAL) && (
             <NavItem 
               icon={<FilePlus size={18} />} 
               label="New Submission" 
               active={currentView === 'new'} 
               onClick={() => onChangeView('new')} 
             />
          )}
          {user.role === UserRole.ADMIN && (
             <NavItem 
               icon={<Settings size={18} />} 
               label="Admin Settings" 
               active={currentView === 'admin'} 
               onClick={() => onChangeView('admin')} 
             />
          )}
          <NavItem 
            icon={<BookOpen size={18} />} 
            label="User Guide" 
            active={currentView === 'guide'} 
            onClick={() => onChangeView('guide')} 
          />
        </div>
      </nav>

      {/* 3. Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-[1920px] mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

// NavItem updated for dark background context
const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-4 border-b-4 transition-all duration-200 text-sm font-semibold whitespace-nowrap ${
      active 
        ? 'border-[#4ade80] text-white bg-white/10' 
        : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);