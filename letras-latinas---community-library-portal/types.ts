
export enum UserRole {
  SOCIO = 'Socio',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin'
}

export enum BookStatus {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  BORROWED = 'Borrowed'
}

export interface Book {
  id: string;
  code: string;
  letter: string;
  author: string;
  book: string;
  language: string;
  genre: string;
  volume: string;
  status: BookStatus;
  isTop?: boolean;
  imageUrl?: string;
}

export interface Member {
  memberId: string;
  name: string;
  nationality: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  role: UserRole;
  password?: string;
  approvedBy?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  memberId: string;
  loanDate: string;
  dueDate: string;
  status: 'active' | 'returned';
}

export interface Reservation {
  id: string;
  bookId: string;
  memberId: string;
  reservationDate: string;
}
