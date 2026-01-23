
import { Course, User, Module } from './types';

export const INITIAL_USER: User = {
  name: 'Jawad Khan',
  email: 'jawad.khan@dev.com',
  phone: '+880 1700 000000',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jawad',
  role: 'student'
};

// Added explicit typing to Module[] to prevent ItemType inference errors
const DEFAULT_MODULES: Module[] = [
  {
    id: 'm-intro',
    title: 'Getting Started',
    items: [
      { 
        id: 'i-welcome', 
        type: 'video', 
        title: 'Welcome to the Course', 
        content: 'https://www.youtube.com/watch?v=u6_a0d92F68', 
        duration: '05:00', 
        isCompleted: false 
      }
    ]
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Information About UI/UX Design Degree',
    instructor: 'David Benitez',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=600&auto=format&fit=crop',
    category: 'Design',
    rating: 4.3,
    reviewsCount: 200,
    price: '$120',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c2',
    title: 'Wordpress for Beginners - Master Wordpress Quickly',
    instructor: 'Ana Reyes',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    thumbnail: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=600&auto=format&fit=crop',
    category: 'Wordpress',
    rating: 4.4,
    reviewsCount: 1188,
    price: '$140',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c3',
    title: 'Sketch from A to Z (2024): Become an app designer',
    instructor: 'Andrew Pirtle',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop',
    category: 'Design',
    rating: 4.8,
    reviewsCount: 170,
    price: '$160',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c4',
    title: 'Build Responsive Real World Websites with Crash Course',
    instructor: 'Christy Garner',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christy',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=600&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.2,
    reviewsCount: 220,
    price: '$200',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c5',
    title: 'Learn JavaScript and Express to become a Expert',
    instructor: 'Justin Gregory',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Justin',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=600&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.4,
    reviewsCount: 180,
    price: '$130',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c6',
    title: 'Introduction to Python Programming',
    instructor: 'Carolyn Hicks',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carolyn',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.7,
    reviewsCount: 130,
    price: '$150',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c7',
    title: 'Build Responsive Websites with HTML5 and CSS3',
    instructor: 'Rafael Miller',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.1,
    reviewsCount: 140,
    price: '$170',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c8',
    title: 'Information About Photoshop Design Degree',
    instructor: 'Nancy Duarte',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nancy',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    category: 'Design',
    rating: 4.3,
    reviewsCount: 190,
    price: '$110',
    modules: DEFAULT_MODULES
  },
  {
    id: 'c9',
    title: 'C# Developers Double Your Coding with Visual Studio',
    instructor: 'James Kegan',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    category: 'Programming',
    rating: 4.8,
    reviewsCount: 110,
    price: '$180',
    modules: DEFAULT_MODULES
  }
];
