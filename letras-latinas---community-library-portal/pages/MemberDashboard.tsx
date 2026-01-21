
import React from 'react';
import { Member, Loan, Reservation, Book, BookStatus } from '../types';

interface MemberDashboardProps {
  user: Member;
  loans: Loan[];
  reservations: Reservation[];
  books: Book[];
  onCancelReservation: (id: string) => void;
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ user, loans, reservations, books, onCancelReservation }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const activeLoans = loans.filter(l => l.status === 'active');

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in slide-in-from-bottom-10 duration-700">
      {/* Header Profile Section */}
      <header className="bg-white p-10 md:p-14 rounded-[48px] shadow-2xl shadow-slate-100 border border-slate-50 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        <div className="w-28 h-28 bg-purple-600 text-white rounded-[36px] flex items-center justify-center text-5xl font-black shadow-2xl shadow-purple-200 rotate-3">
          {user.name.charAt(0)}
        </div>
        <div className="flex-grow">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">{user.name}</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">{user.email} • ID: {user.memberId}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{user.role}</span>
            <span className="bg-purple-50 text-purple-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">{user.city}</span>
          </div>
        </div>
        <div className="hidden lg:block bg-slate-50 p-6 rounded-[32px] border border-slate-100">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Actividad</p>
           <div className="flex gap-6">
              <div className="text-center">
                 <p className="text-2xl font-black text-slate-900">{activeLoans.length}</p>
                 <p className="text-[8px] font-black text-slate-400 uppercase">Préstamos</p>
              </div>
              <div className="w-[1px] h-10 bg-slate-200"></div>
              <div className="text-center">
                 <p className="text-2xl font-black text-slate-900">{reservations.length}</p>
                 <p className="text-[8px] font-black text-slate-400 uppercase">Reservas</p>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Préstamos Activos Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Préstamos Activos</h2>
          </div>
          
          {activeLoans.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
              <div className="text-slate-200 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No tienes libros prestados actualmente</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeLoans.map(loan => {
                const book = books.find(b => b.id === loan.bookId);
                return (
                  <div key={loan.id} className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-100 border border-slate-50 flex gap-6 group hover:-translate-y-1 transition-all duration-500">
                    <div className="w-20 h-28 bg-slate-50 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                       <img src={book?.imageUrl || `https://images.unsplash.com/photo-1543005120-a1bb3ea79ff1?q=80&w=200&sig=${book?.id}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-grow py-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{book?.book || 'Libro Desconocido'}</h3>
                          <p className="text-xs font-bold text-slate-400 italic">por {book?.author}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-500 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">En Curso</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Pedido el</p>
                          <p className="text-[10px] font-black text-slate-600">{formatDate(loan.loanDate)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-rose-300 uppercase tracking-widest mb-1 text-right">Entrega</p>
                          <p className="text-[10px] font-black text-rose-600 text-right">{formatDate(loan.dueDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reservas Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
             <div className="w-10 h-10 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Mis Reservas</h2>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
              <div className="text-slate-200 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No tienes reservas vigentes</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map(res => {
                const book = books.find(b => b.id === res.bookId);
                return (
                  <div key={res.id} className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-100 border border-slate-50 group hover:-translate-y-1 transition-all duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                           <img src={book?.imageUrl || `https://images.unsplash.com/photo-1543005120-a1bb3ea79ff1?q=80&w=200&sig=${book?.id}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{book?.book}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reservado el {formatDate(res.reservationDate)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onCancelReservation(res.id)}
                        className="bg-rose-50 text-rose-500 p-3 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Cancelar Reserva"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-[24px] flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-200"></div>
                      <p className="text-[10px] text-amber-800 font-black uppercase tracking-widest leading-relaxed">
                        Apartado. Pasa por biblioteca para retirarlo.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
