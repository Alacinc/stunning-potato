
import React, { useState } from 'react';
import { Member } from '../types';

interface LoginProps {
  onLogin: (user: Member) => void;
  members: Member[];
}

const Login: React.FC<LoginProps> = ({ onLogin, members }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = members.find(m => m.email === email && m.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Se ha enviado un enlace de recuperación a: ${email || 'tu correo'}`);
    setIsResetting(false);
  };

  const fillCredentials = (type: 'admin' | 'socio') => {
    if (type === 'admin') {
      setEmail('admin@library.com');
      setPassword('password123');
    } else {
      setEmail('john@example.com');
      setPassword('password123');
    }
    setError('');
  };

  return (
    <div className="max-w-md mx-auto mt-16 mb-24 px-4 animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl shadow-violet-100/80 border border-slate-50">
        <div className="text-center mb-12">
          <div className="inline-flex w-24 h-24 bg-violet-600 text-white rounded-[32px] items-center justify-center mb-8 shadow-2xl shadow-violet-200">
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {isResetting ? 'Recuperar' : 'Mi Portal'}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            {isResetting ? 'Ingresa tu email para resetear' : 'Bienvenido a la Biblioteca Comunitaria'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-5 rounded-3xl text-xs font-bold mb-8 text-center border border-rose-100 animate-pulse">
            {error}
          </div>
        )}

        {isResetting ? (
          <form onSubmit={handleResetPassword} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-[0.2em]">Tu Email de Socio</label>
              <input 
                type="email" 
                required 
                value={email}
                placeholder="email@ejemplo.com"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:border-violet-500 font-bold transition-all text-slate-700"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <button className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[24px] font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs">Enviar Enlace</button>
              <button 
                type="button"
                onClick={() => setIsResetting(false)}
                className="w-full text-slate-400 py-2 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
              >
                Volver al Ingreso
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-[0.2em]">Email de Usuario</label>
              <input 
                type="email" 
                required 
                value={email}
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:border-violet-500 font-bold transition-all text-slate-700"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-6">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contraseña</label>
                 <button 
                  type="button"
                  onClick={() => setIsResetting(true)}
                  className="text-[10px] font-black text-violet-500 uppercase tracking-widest hover:text-violet-700"
                 >
                   ¿Olvidaste?
                 </button>
              </div>
              <input 
                type="password" 
                required 
                value={password}
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:border-violet-500 font-bold transition-all text-slate-700"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 rounded-[24px] font-black shadow-xl shadow-violet-200 transition-all active:scale-95 uppercase tracking-widest text-xs">Entrar Ahora</button>
          </form>
        )}

        <div className="mt-12 pt-10 border-t border-slate-50 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 italic">Acceso Rápido Demo</p>
          <div className="flex gap-3">
            <button onClick={() => fillCredentials('admin')} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black hover:bg-black transition-all uppercase tracking-widest">Super Admin</button>
            <button onClick={() => fillCredentials('socio')} className="flex-1 bg-violet-100 text-violet-600 py-4 rounded-2xl text-[10px] font-black hover:bg-violet-200 transition-all uppercase tracking-widest">Socio</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
