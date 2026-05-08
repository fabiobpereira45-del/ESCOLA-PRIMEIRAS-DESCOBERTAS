export interface Student {
  id: string;
  name: string;
  birthDate: string;
  grade: string;
  turma: string;
  parentName: string;
  parentContact: string;
  photoUrl?: string;
  address?: string;
  phone?: string;
  additionalPhone?: string;
  continuousMedication?: boolean;
  continuousMedicationDetails?: string;
  allergies?: boolean;
  allergiesDetails?: string;
  surgery?: boolean;
  surgeryDetails?: string;
  neurodivergent?: boolean;
  neurodivergentReport?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  photoUrl?: string;
}

export interface Grade {
  studentId: string;
  subject: string;
  period: string; // 1º Bimestre, etc.
  value: number;
}

export interface Attendance {
  studentId: string;
  date: string;
  present: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  target: 'all' | 'parents' | 'teachers' | 'students';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  available: boolean;
  loanedTo?: string;
  dueDate?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

export interface FinancialRecord {
  id: string;
  studentId: string;
  type: 'tuition' | 'fee' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PhotoAlbum {
  id: string;
  title: string;
  date: string;
  coverUrl: string;
  photos: string[];
}

export interface DirectiveMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
}
