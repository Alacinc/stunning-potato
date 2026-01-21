
import React, { useState, useRef } from 'react';
import { Book, Member, UserRole, BookStatus, Loan, Reservation } from '../types';
import { GENRES } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface AdminDashboardProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  reservations: Reservation[];
  currentUser: Member;
  onToggleTop: (id: string) => void;
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onImportBooks: (books: Book[]) => void;
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onImportMembers: (members: Member[]) => void;
  onFinishLoan: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  books, members, loans, reservations, currentUser,
  onToggleTop, onAddBook, onUpdateBook, onImportBooks, onAddMember, onUpdateMember, onDeleteMember, onImportMembers, onFinishLoan 
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'members' | 'loans' | 'database'>('inventory');
  const [showModal, setShowModal] = useState<'book' | 'member' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSearchingIA, setIsSearchingIA] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleSheetsLink, setGoogleSheetsLink] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [importTarget, setImportTarget] = useState<'books' | 'members'>('books');
  
  const [manualBook, setManualBook] = useState<Partial<Book>>({ language: 'Spanish', genre: 'Classic', status: BookStatus.AVAILABLE });
  const [manualMember, setManualMember] = useState<Partial<Member>>({ role: UserRole.SOCIO, approvedBy: currentUser.name });

  const handleAISearchCover = async () => {
    if (!manualBook.book) {
      alert('Por favor, ingresa el título del libro primero.');
      return;
    }
    setIsSearchingIA(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Busca la URL de la portada oficial del libro "${manualBook.book}" de "${manualBook.author}". Responde SOLO en formato JSON: {"url": "..."}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
      });
      const result = JSON.parse(response.text || '{}');
      if (result.url) setManualBook(prev => ({ ...prev, imageUrl: result.url }));
    } catch (error) {
      console.error("Error buscando portada:", error);
      alert("No se pudo encontrar la portada mediante IA. Intenta subirla manualmente.");
    } finally {
      setIsSearchingIA(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualBook(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveManualBook = (e: React.FormEvent) => {
    e.preventDefault();
    const bookData = {
      ...manualBook,
      id: isEditing ? (manualBook.id || Math.random().toString(36).substr(2, 9)) : Math.random().toString(36).substr(2, 9),
      volume: manualBook.volume || '1',
      language: manualBook.language || 'Spanish',
      genre: manualBook.genre || 'Classic',
      status: manualBook.status || BookStatus.AVAILABLE,
      isTop: manualBook.isTop || false
    } as Book;
    if (isEditing) onUpdateBook(bookData); else onAddBook(bookData);
    setShowModal(null);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    const memberData = {
      ...manualMember,
      password: manualMember.password || 'password123',
    } as Member;
    if (isEditing) onUpdateMember(memberData); else onAddMember(memberData);
    setShowModal(null);
  };

  const processImportText = (text: string, type: 'books' | 'members') => {
    try {
      const lines = text.trim().split('\n');
      const dataLines = (lines[0].toLowerCase().includes('id') || lines[0].toLowerCase().includes('name')) ? lines.slice(1) : lines;
      
      if (type === 'books') {
        const newBooks: Book[] = dataLines.map(line => {
          const delimiter = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
          const parts = line.split(delimiter);
          if (parts.length < 5) return null;
          const [id, code, letter, author, book, language, genre, volume] = parts.map(p => p.trim());
          return { 
            id: id || Math.random().toString(36).substr(2, 9), 
            code: code || 'N/A', 
            letter: letter || 'X', 
            author: author || 'Desconocido', 
            book: book || 'Sin Título', 
            language: language || 'Spanish', 
            genre: genre || 'Classic', 
            volume: volume || '1', 
            status: BookStatus.AVAILABLE, 
            isTop: false 
          };
        }).filter(b => b !== null) as Book[];
        onImportBooks(newBooks);
      } else {
        const newMembers: Member[] = dataLines.map(line => {
          const delimiter = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
          const parts = line.split(delimiter);
          if (parts.length < 5) return null;
          const [memberId, name, nationality, gender, email, phone, address, city] = parts.map(p => p.trim());
          return { 
            memberId: memberId || `M-${Math.floor(Math.random() * 1000)}`, 
            name: name || 'Socio Nuevo', 
            nationality: nationality || '-', 
            gender: gender || '-', 
            email: email || '', 
            phone: phone || '', 
            address: address || '', 
            city: city || '', 
            role: UserRole.SOCIO, 
            password: 'password123', 
            approvedBy: currentUser.name 
          };
        }).filter(m => m !== null) as Member[];
        onImportMembers(newMembers);
      }
      alert('Importación masiva completada.');
    } catch (e) {
      alert('Error al procesar el formato. Verifica los datos.');
    }
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      processImportText(content, importTarget);
    };
    reader.readAsText(file);
  };

  const handleSyncGoogleSheets = async () => {
    if (!googleSheetsLink.startsWith('http')) {
      alert('Por favor, ingresa un enlace de Google Sheets válido.');
      return;
    }
    setIsSyncing(true);
    try {
      let fetchUrl = googleSheetsLink;
      if (googleSheetsLink.includes('/edit')) {
        fetchUrl = googleSheetsLink.replace(/\/edit.*$/, '/export?format=csv');
      } else if (!googleSheetsLink.includes('output=csv')) {
        fetchUrl = googleSheetsLink + (googleSheetsLink.includes('?') ? '&' : '?') + 'output=csv';
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error('No se pudo descargar el contenido.');
      const text = await response.text();
      processImportText(text, importTarget);
      setGoogleSheetsLink('');
    } catch (error) {
      console.error(error);
      alert('Error al sincronizar. Asegúrate que la hoja de cálculo esté publicada como CSV o sea accesible.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      {/* NAVEGACIÓN PRINCIPAL */}
      <div className="flex justify-center mb-12">
        <div className="bg-white rounded-[32px] p-2 shadow-2xl shadow-slate-100/50 border border-slate-100 flex flex-wrap gap-2">
          {[
            { id: 'inventory', label: 'Catálogo' },
            { id: 'members', label: 'Socios' },
            { id: 'loans', label: 'Préstamos' },
            { id: 'database', label: 'Base de Datos' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Administración de Catálogo</h2>
             <button 
                onClick={() => { setIsEditing(false); setManualBook({ language: 'Spanish', genre: 'Classic', status: BookStatus.AVAILABLE }); setShowModal('book'); }}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all"
             >
               + Añadir Libro
             </button>
           </div>
           
           <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest border-b">
                 <tr>
                   <th className="px-8 py-6">Libro</th>
                   <th className="px-8 py-6">Código / Ref</th>
                   <th className="px-8 py-6">Estado</th>
                   <th className="px-8 py-6 text-right">Acción</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {books.map(b => (
                   <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-6 flex items-center gap-4">
                        <img src={b.imageUrl || 'https://via.placeholder.com/40x60'} className="w-10 h-14 object-cover rounded-lg shadow-sm" alt="" />
                        <div><span className="font-black text-slate-900 block">{b.book}</span><span className="text-[10px] text-slate-400 font-bold uppercase">{b.author}</span></div>
                     </td>
                     <td className="px-8 py-6 font-black text-slate-700">{b.code} ({b.letter})</td>
                     <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === BookStatus.AVAILABLE ? 'bg-yellow-400 text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                          {b.status === BookStatus.AVAILABLE ? 'Disponible' : (b.status === BookStatus.RESERVED ? 'Reservado' : 'Ocupado')}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right space-x-2">
                        {/* Botón para liberar libro si está ocupado o reservado */}
                        {b.status !== BookStatus.AVAILABLE && (
                          <button 
                            onClick={() => onUpdateBook({ ...b, status: BookStatus.AVAILABLE })}
                            title="Liberar / Hacer Disponible"
                            className="bg-emerald-50 p-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-emerald-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          </button>
                        )}
                        <button 
                          onClick={() => onToggleTop(b.id)} 
                          title="Destacar Libro"
                          className={`p-3 rounded-xl transition-all ${b.isTop ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'bg-slate-50 text-slate-300 hover:text-yellow-400'}`}
                        >
                          ★
                        </button>
                        <button 
                          onClick={() => { setIsEditing(true); setManualBook(b); setShowModal('book'); }} 
                          title="Modificar Contenido"
                          className="bg-slate-50 p-3 rounded-xl hover:bg-purple-600 hover:text-white transition-all text-slate-400"
                        >
                          ✎
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Gestión de Socios</h2>
            <button 
              onClick={() => { setIsEditing(false); setManualMember({ role: UserRole.SOCIO, approvedBy: currentUser.name }); setShowModal('member'); }}
              className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-purple-700 transition-all"
            >
              + Añadir Socio
            </button>
          </div>

          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest border-b">
                <tr><th className="px-6 py-6">ID</th><th className="px-6 py-6">Nombre</th><th className="px-6 py-6">Email</th><th className="px-6 py-6">Rol</th><th className="px-6 py-6 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(m => (
                  <tr key={m.memberId} className="hover:bg-slate-50/50">
                    <td className="px-6 py-6 font-black text-[10px] uppercase text-slate-400">{m.memberId}</td>
                    <td className="px-6 py-6 font-black text-slate-900">{m.name}</td>
                    <td className="px-6 py-6 text-xs font-bold text-slate-600">{m.email}</td>
                    <td className="px-6 py-6"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${m.role === UserRole.SUPER_ADMIN ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>{m.role}</span></td>
                    <td className="px-6 py-6 text-right space-x-1">
                      <button onClick={() => { setIsEditing(true); setManualMember(m); setShowModal('member'); }} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-purple-600 hover:text-white transition-all">✎</button>
                      <button onClick={() => { if(confirm('¿Eliminar socio?')) onDeleteMember(m.memberId); }} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Préstamos Activos</h2>
          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest border-b">
                <tr><th className="px-8 py-6">Libro</th><th className="px-8 py-6">Socio</th><th className="px-8 py-6">Vencimiento</th><th className="px-8 py-6 text-right">Acción</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.filter(l => l.status === 'active').map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="px-8 py-6 font-black text-slate-900">{books.find(b => b.id === l.bookId)?.book}</td>
                    <td className="px-8 py-6 font-bold text-slate-600">{members.find(m => m.memberId === l.memberId)?.name}</td>
                    <td className="px-8 py-6 font-black text-rose-500">{new Date(l.dueDate).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => onFinishLoan(l.id)} className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Devolver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Sincronización de Base de Datos</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">¿Qué deseas importar masivamente?</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setImportTarget('books')} 
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${importTarget === 'books' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Libros
              </button>
              <button 
                onClick={() => setImportTarget('members')} 
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${importTarget === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Socios
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Archivo de PC</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10 leading-relaxed">Sube un archivo .CSV o .TXT con los datos separados por comas o tabulación.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-auto w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all"
              >
                Seleccionar Archivo
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileLoad} accept=".csv,.txt" className="hidden" />
            </div>

            <div className="bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 flex flex-col group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center mb-6 shadow-sm self-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2 text-center">Google Sheets Link</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 text-center leading-relaxed">Pega el link de "Publicar en la web" -> formato CSV para importar datos remotos.</p>
              <input 
                type="text" 
                placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                value={googleSheetsLink}
                onChange={(e) => setGoogleSheetsLink(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-emerald-400 font-medium text-xs mb-4"
              />
              <button 
                onClick={handleSyncGoogleSheets}
                disabled={isSyncing}
                className="mt-auto w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIBRO */}
      {showModal === 'book' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[48px] w-full max-w-4xl p-10 relative shadow-2xl flex flex-col md:flex-row gap-10 my-10 animate-in zoom-in duration-300">
            <button onClick={() => setShowModal(null)} className="absolute top-8 right-8 text-2xl hover:text-purple-600 transition-colors">✕</button>
            
            {/* PORTADA SECCIÓN */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="w-full aspect-[3/4] bg-slate-50 rounded-[32px] overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner relative group">
                {manualBook.imageUrl ? (
                  <img src={manualBook.imageUrl} className="w-full h-full object-cover" alt="Portada" />
                ) : (
                  <p className="text-slate-300 font-black uppercase text-[10px]">Vista Previa Portada</p>
                )}
                {isSearchingIA && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center font-black text-[10px] uppercase text-purple-600 animate-pulse">Buscando...</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={handleAISearchCover} disabled={isSearchingIA} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-purple-700 transition-all">
                  ✨ Buscar con IA
                </button>
                <button onClick={() => coverInputRef.current?.click()} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Subir Foto PC
                </button>
                <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
                
                <div className="mt-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Enlace Directo Portada</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={manualBook.imageUrl || ''}
                    onChange={(e) => setManualBook({...manualBook, imageUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-bold outline-none focus:border-purple-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* FORMULARIO */}
            <div className="flex-grow">
              <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">{isEditing ? 'Editar' : 'Nuevo'} Libro</h2>
              <form onSubmit={handleSaveManualBook} className="grid grid-cols-2 gap-4">
                <input placeholder="ID Único" required value={manualBook.id || ''} onChange={e => setManualBook({...manualBook, id: e.target.value})} className="col-span-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input placeholder="Código Referencia" required value={manualBook.code || ''} onChange={e => setManualBook({...manualBook, code: e.target.value})} className="col-span-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input placeholder="Título del Libro" required value={manualBook.book || ''} onChange={e => setManualBook({...manualBook, book: e.target.value})} className="col-span-2 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input placeholder="Autor" required value={manualBook.author || ''} onChange={e => setManualBook({...manualBook, author: e.target.value})} className="col-span-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input placeholder="Letra Ref" required value={manualBook.letter || ''} onChange={e => setManualBook({...manualBook, letter: e.target.value})} className="col-span-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold uppercase" maxLength={1} />
                <select value={manualBook.genre} onChange={e => setManualBook({...manualBook, genre: e.target.value})} className="col-span-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold">
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input placeholder="Volumen" value={manualBook.volume || '1'} onChange={e => setManualBook({...manualBook, volume: e.target.value})} className="col-span-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                
                {/* Selector de Estado Manual */}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Estado del Libro</label>
                  <select 
                    value={manualBook.status} 
                    onChange={e => setManualBook({...manualBook, status: e.target.value as BookStatus})} 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-purple-400 transition-all"
                  >
                    <option value={BookStatus.AVAILABLE}>Disponible</option>
                    <option value={BookStatus.BORROWED}>Ocupado / Prestado</option>
                    <option value={BookStatus.RESERVED}>Reservado</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                   <input 
                    type="checkbox" 
                    id="isTop"
                    checked={manualBook.isTop || false}
                    onChange={(e) => setManualBook({...manualBook, isTop: e.target.checked})}
                    className="w-5 h-5 accent-yellow-400"
                   />
                   <label htmlFor="isTop" className="text-xs font-black text-slate-700 uppercase tracking-widest cursor-pointer">Destacar este libro en el inicio</label>
                </div>
                <button type="submit" className="col-span-2 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] mt-4 shadow-xl active:scale-95 transition-all">Guardar Libro</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SOCIO */}
      {showModal === 'member' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[48px] w-full max-w-4xl p-12 relative shadow-2xl animate-in zoom-in duration-300 my-10">
            <button onClick={() => setShowModal(null)} className="absolute top-10 right-10 text-2xl hover:text-purple-600 transition-colors">✕</button>
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter">{isEditing ? 'Editar' : 'Registrar'} Socio</h2>
            <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <input required placeholder="ID de Socio" value={manualMember.memberId || ''} onChange={e => setManualMember({...manualMember, memberId: e.target.value})} className="p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white focus:shadow-md transition-all" />
              <input required placeholder="Nombre Completo" value={manualMember.name || ''} onChange={e => setManualMember({...manualMember, name: e.target.value})} className="lg:col-span-2 p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white focus:shadow-md transition-all" />
              <input required type="email" placeholder="Email de Contacto" value={manualMember.email || ''} onChange={e => setManualMember({...manualMember, email: e.target.value})} className="p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white focus:shadow-md transition-all" />
              <input placeholder="Teléfono" value={manualMember.phone || ''} onChange={e => setManualMember({...manualMember, phone: e.target.value})} className="p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white focus:shadow-md transition-all" />
              <input placeholder="Ciudad" value={manualMember.city || ''} onChange={e => setManualMember({...manualMember, city: e.target.value})} className="p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white focus:shadow-md transition-all" />
              <select value={manualMember.role} onChange={e => setManualMember({...manualMember, role: e.target.value as UserRole})} className="p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none focus:bg-white focus:shadow-md transition-all">
                <option value={UserRole.SOCIO}>Socio</option>
                <option value={UserRole.ADMIN}>Administrador</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              </select>
              <button type="submit" className="md:col-span-2 lg:col-span-3 bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px] mt-6 shadow-xl active:scale-95 transition-all">Confirmar Registro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
