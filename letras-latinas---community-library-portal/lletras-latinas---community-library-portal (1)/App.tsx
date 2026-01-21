
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Book, Member, UserRole, BookStatus, Loan, Reservation } from './types';
import { INITIAL_BOOKS, INITIAL_MEMBERS } from './constants';
import Catalog from './pages/Catalog';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Login from './pages/Login';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem('biblio_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('biblio_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('biblio_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('biblio_loans');
    return saved ? JSON.parse(saved) : [];
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('biblio_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistencia
  useEffect(() => localStorage.setItem('biblio_user', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('biblio_books', JSON.stringify(books)), [books]);
  useEffect(() => localStorage.setItem('biblio_members', JSON.stringify(members)), [members]);
  useEffect(() => localStorage.setItem('biblio_loans', JSON.stringify(loans)), [loans]);
  useEffect(() => localStorage.setItem('biblio_reservations', JSON.stringify(reservations)), [reservations]);

  const handleLogin = (user: Member) => setCurrentUser(user);
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('biblio_user');
  };

  const handleReserve = (bookId: string) => {
    if (!currentUser) return;
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: BookStatus.RESERVED } : b));
    const newRes: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      bookId,
      memberId: currentUser.memberId,
      reservationDate: new Date().toISOString()
    };
    setReservations(prev => [...prev, newRes]);
  };

  const handleCancelReservation = (resId: string) => {
    const res = reservations.find(r => r.id === resId);
    if (!res) return;
    setBooks(prev => prev.map(b => b.id === res.bookId ? { ...b, status: BookStatus.AVAILABLE } : b));
    setReservations(prev => prev.filter(r => r.id !== resId));
  };

  const handleFinishLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    setBooks(prev => prev.map(b => b.id === loan.bookId ? { ...b, status: BookStatus.AVAILABLE } : b));
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'returned' } : l));
  };

  const handleAddBook = (book: Book) => setBooks(prev => [...prev, book]);
  const handleUpdateBook = (book: Book) => setBooks(prev => prev.map(b => b.id === book.id ? book : b));
  const handleImportBooks = (newBooks: Book[]) => setBooks(prev => [...prev, ...newBooks]);

  const handleAddMember = (member: Member) => setMembers(prev => [...prev, member]);
  const handleUpdateMember = (member: Member) => setMembers(prev => prev.map(m => m.memberId === member.memberId ? member : m));
  const handleDeleteMember = (memberId: string) => setMembers(prev => prev.filter(m => m.memberId !== memberId));
  const handleImportMembers = (newMembers: Member[]) => setMembers(prev => [...prev, ...newMembers]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar user={currentUser} onLogout={handleLogout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Catalog books={books} onReserve={handleReserve} currentUser={currentUser} />} />
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} members={members} />} />
            <Route path="/profile" element={currentUser ? <MemberDashboard user={currentUser} loans={loans.filter(l => l.memberId === currentUser.memberId)} reservations={reservations.filter(r => r.memberId === currentUser.memberId)} books={books} onCancelReservation={handleCancelReservation} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={currentUser && (currentUser.role !== UserRole.SOCIO) ? <AdminDashboard books={books} members={members} loans={loans} reservations={reservations} currentUser={currentUser} onToggleTop={(id) => setBooks(prev => prev.map(b => b.id === id ? {...b, isTop: !b.isTop} : b))} onAddBook={handleAddBook} onUpdateBook={handleUpdateBook} onImportBooks={handleImportBooks} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} onImportMembers={handleImportMembers} onFinishLoan={handleFinishLoan} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
