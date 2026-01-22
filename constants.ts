
import { Course, User } from './types';

export const INITIAL_USER: User = {
  name: 'Jawad Khan',
  email: 'jawad.khan@dev.com',
  phone: '+880 1700 000000',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jawad',
  role: 'student'
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Pro Course (Content Updated up to Batch 11)',
    instructor: 'ঝংকার মাহবুব',
    thumbnail: 'https://i.ibb.co/L89Z9D9/course-thumb.png',
    modules: [
      {
        id: 'm1',
        title: 'Module 0: Orientation',
        items: [
          { 
            id: 'i1', 
            type: 'video', 
            title: 'Welcome to the Course', 
            content: 'https://www.youtube.com/watch?v=u6_a0d92F68', 
            duration: '04:30', 
            isCompleted: true 
          },
          { 
            id: 'i2', 
            type: 'note', 
            title: 'Course Roadmap', 
            content: '# Roadmap\n\n1. HTML Basics\n2. CSS Mastery\n3. JavaScript Fundamentals\n4. React.js Pro', 
            isCompleted: true 
          },
          { 
            id: 'i3', 
            type: 'quiz', 
            title: 'Orientation Quiz', 
            content: 'Check your setup', 
            isCompleted: false 
          }
        ]
      },
      {
        id: 'm2',
        title: 'Module 1: Basic HTML & CSS',
        items: [
          { 
            id: 'i4', 
            type: 'video', 
            title: 'What is HTML?', 
            content: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 
            duration: '12:05', 
            isCompleted: false 
          },
          { 
            id: 'i5', 
            type: 'video', 
            title: 'CSS Box Model', 
            content: 'https://www.youtube.com/watch?v=nSst4-WzuxY', 
            duration: '18:45', 
            isCompleted: false 
          }
        ]
      }
    ]
  }
];
