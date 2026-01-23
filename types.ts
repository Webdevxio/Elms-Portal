
export interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'student' | 'admin';
}

export type ItemType = 'video' | 'note' | 'quiz';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface ModuleItem {
  id: string;
  type: ItemType;
  title: string;
  content: string; // Video URL or Markdown/Text Note
  isCompleted: boolean;
  duration?: string;
}

export interface Module {
  id: string;
  title: string;
  items: ModuleItem[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar?: string;
  thumbnail: string;
  modules: Module[];
  price?: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
}

export enum View {
  DASHBOARD = 'dashboard',
  PLAYER = 'player',
  PROFILE = 'profile',
  ENROLLED = 'enrolled',
  CERTIFICATES = 'certificates',
  WISHLIST = 'wishlist',
  REVIEWS = 'reviews',
  QUIZZES = 'quizzes',
  ORDERS = 'orders',
  SETTINGS = 'settings',
  ADMIN = 'admin'
}

export interface Certificate {
  id: string;
  courseTitle: string;
  date: string;
}

export interface Order {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending';
}
