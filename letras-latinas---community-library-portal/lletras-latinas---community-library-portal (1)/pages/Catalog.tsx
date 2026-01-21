
import React, { useState, useMemo } from 'react';
import { Book, BookStatus, Member } from '../types';

interface CatalogProps {
  books: Book[];
  onReserve: (bookId: string) => void;
  currentUser: Member | null;
}

const Catalog: React.FC<CatalogProps> = ({ books, onReserve, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const match = b.book.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.code.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [books, searchTerm]);

  const topBooks = useMemo(() => books.filter(b => b.isTop), [books]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* SECCIÓN DESTACADOS */}
      {topBooks.length > 0 && (
        <section className="px-2">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center text-lg shadow-lg rotate-3">★</div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Selección del Mes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topBooks.map(book => <BookCard key={book.id} book={book} onReserve={onReserve} isLoggedIn={!!currentUser} isFeatured={true} />)}
          </div>
        </section>
      )}

      {/* SECCIÓN CATÁLOGO GENERAL */}
      <section className="px-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 pt-10 border-t border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Explora la Colección</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Más de {books.length} títulos disponibles</p>
          </div>
          <div className="w-full md:w-96 relative group">
            <input 
              type="text" 
              placeholder="Busca por título, autor o código..." 
              className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-white border border-slate-200 outline-none focus:border-purple-500 transition-all font-bold text-sm text-slate-700 shadow-xl shadow-slate-100/50"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredBooks.map(book => <BookCard key={book.id} book={book} onReserve={onReserve} isLoggedIn={!!currentUser} />)}
        </div>
      </section>
    </div>
  );
};

const BookCard: React.FC<{book: Book, onReserve: (id: string) => void, isLoggedIn: boolean, isFeatured?: boolean}> = ({book, onReserve, isLoggedIn, isFeatured}) => {
  const highQualityFallbacks = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765'
  ];
  const finalCover = book.imageUrl || `${highQualityFallbacks[parseInt(book.id) % highQualityFallbacks.length]}?q=80&w=800&auto=format&fit=crop&sig=${book.id}`;

  const isAvailable = book.status === BookStatus.AVAILABLE;

  return (
    <div className={`group flex flex-col h-full transition-all duration-500 ${isFeatured ? 'scale-105' : ''}`}>
      {/* IMAGEN DEL LIBRO */}
      <div className="aspect-[3/4] relative overflow-hidden rounded-[48px] shadow-sm group-hover:shadow-3xl group-hover:-translate-y-2 transition-all duration-700 border border-slate-50">
        <img 
          src={finalCover} 
          alt={book.book} 
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125" 
          loading="lazy"
        />
        
        {/* OVERLAY GRADIENTE */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* STATUS BADGE - AMARILLO DISPONIBLE, BLANCO/NEGRO OCUPADO */}
        <div className="absolute top-5 right-5">
          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] backdrop-blur-xl shadow-2xl border border-white/20 ${
            isAvailable 
              ? 'bg-yellow-400 text-slate-900' 
              : 'bg-white/95 text-slate-900'
          }`}>
            {isAvailable ? 'Disponible' : 'Ocupado'}
          </span>
        </div>

        {/* CÓDIGO REF - ORILLA IZQUIERDA ABAJO */}
        <div className="absolute bottom-5 left-5">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-[20px] shadow-2xl flex flex-col items-center justify-center min-w-[55px] border border-white/50 group-hover:scale-110 transition-transform duration-500">
             <span className="text-[11px] font-black text-slate-900 leading-none mb-1">{book.code.split('-').pop()}</span>
             <div className="w-4 h-[1px] bg-slate-200 mb-1"></div>
             <span className="text-[9px] font-black text-purple-600 uppercase leading-none tracking-tighter">{book.letter}</span>
          </div>
        </div>
      </div>

      {/* DETALLES */}
      <div className="pt-7 pb-4 px-3 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="font-black text-slate-900 text-xl leading-tight mb-1 group-hover:text-purple-600 transition-colors uppercase tracking-tight line-clamp-2">
            {book.book}
          </h3>
          <p className="text-sm font-bold text-slate-400 italic">
            por <span className="text-slate-500">{book.author}</span>
          </p>
        </div>

        <div className="mb-7 flex items-center gap-3">
           <span className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-100/50">
             {book.genre}
           </span>
           {book.volume !== "1" && (
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
               Vol. {book.volume}
             </span>
           )}
        </div>

        {/* BOTÓN RESERVAR */}
        <div className="mt-auto">
          <button 
            onClick={() => onReserve(book.id)}
            disabled={!isLoggedIn || !isAvailable}
            className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${
              isLoggedIn && isAvailable 
                ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-yellow-100 border border-yellow-300' 
                : 'bg-white/90 text-slate-900 cursor-not-allowed border border-slate-200 shadow-none'
            }`}
          >
             {isLoggedIn ? (isAvailable ? 'RESERVAR AHORA' : 'OCUPADO') : 'INGRESA PARA RESERVAR'}
             {isLoggedIn && isAvailable && (
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
             )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Catalog;
