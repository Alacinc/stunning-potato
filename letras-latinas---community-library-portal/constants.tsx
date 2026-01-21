
import { Book, Member, UserRole, BookStatus } from './types';

export const INITIAL_BOOKS: Book[] = [
  { id: '1', code: 'FIC-001', letter: 'G', author: 'Gabriel García Márquez', book: 'Cien Años de Soledad', language: 'Spanish', genre: 'Magic Realism', volume: '1', status: BookStatus.AVAILABLE, isTop: true },
  { id: '2', code: 'FIC-002', letter: 'C', author: 'Miguel de Cervantes', book: 'Don Quijote de la Mancha', language: 'Spanish', genre: 'Classic', volume: '1', status: BookStatus.AVAILABLE, isTop: true },
  { id: '3', code: 'SCI-001', letter: 'A', author: 'Isaac Asimov', book: 'Foundation', language: 'English', genre: 'Science Fiction', volume: '1', status: BookStatus.RESERVED, isTop: false },
  { id: '4', code: 'HIS-001', letter: 'Y', author: 'Yuval Noah Harari', book: 'Sapiens', language: 'English', genre: 'History', volume: '1', status: BookStatus.BORROWED, isTop: true },
  { id: '5', code: 'FIC-003', letter: 'B', author: 'Jorge Luis Borges', book: 'Ficciones', language: 'Spanish', genre: 'Short Story', volume: '1', status: BookStatus.AVAILABLE, isTop: false },
];

export const INITIAL_MEMBERS: Member[] = [
  { memberId: 'M-001', name: 'Super User', nationality: 'Admin', gender: 'Other', email: 'admin@library.com', phone: '123456789', address: 'Main St', city: 'Admin City', role: UserRole.SUPER_ADMIN, password: 'password123' },
  { memberId: 'M-002', name: 'John Doe', nationality: 'American', gender: 'Male', email: 'john@example.com', phone: '555-0199', address: '742 Evergreen Ter', city: 'Springfield', role: UserRole.SOCIO, password: 'password123' },
];

export const GENRES = ['All', 'Magic Realism', 'Classic', 'Science Fiction', 'History', 'Short Story', 'Fantasy', 'Mystery', 'Biography'];
export const LANGUAGES = ['All', 'Spanish', 'English', 'French', 'Portuguese'];
