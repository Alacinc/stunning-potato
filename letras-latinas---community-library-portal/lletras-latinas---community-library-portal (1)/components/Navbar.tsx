
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Member, UserRole } from '../types';

interface NavbarProps {
  user: Member | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const isAdmin = user && user.role !== UserRole.SOCIO;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:rotate-3 transition-transform shadow-lg shadow-violet-200">
              B
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">BiblioComunidad</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/" className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${isActive('/') ? 'text-violet-600 bg-violet-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Catálogo</Link>
            
            {user && (
              <Link to="/profile" className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${isActive('/profile') ? 'text-violet-600 bg-violet-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Mi Portal</Link>
            )}

            {isAdmin && (
              <Link to="/admin" className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${isActive('/admin') ? 'text-violet-600 bg-violet-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Administración</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-black text-slate-900 leading-none">{user.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-violet-100 transition-all active:scale-95">Ingresar</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
