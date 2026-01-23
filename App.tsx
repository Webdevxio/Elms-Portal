
import React, { useState, useEffect, useRef } from 'react';
import { View, Course, Module, ModuleItem, User, ItemType, Certificate, Order, Quiz, QuizQuestion } from './types';
import { MOCK_COURSES, INITIAL_USER } from './constants';
import { generateLessonSummary, generateQuizFromContent } from './services/geminiService';
import AuthScreen from './components/AuthScreen';

interface UserQuizAttempt {
  courseTitle: string;
  quizTitle: string;
  date: string;
  score: string;
  status: 'Passed' | 'Failed';
}

const App: React.FC = () => {
  // --- AUTH & USER STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  
  // --- PROFILE EDIT STATE ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // --- APP CONTENT STATE ---
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeItem, setActiveItem] = useState<ModuleItem | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // --- ADMIN STATE ---
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseInstructor, setNewCourseInstructor] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('$99');
  const [newCourseThumb, setNewCourseThumb] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop');

  // --- QUIZ STATE ---
  const [quizAttempts, setQuizAttempts] = useState<UserQuizAttempt[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // --- PERSISTENCE LAYER ---
  useEffect(() => {
    const savedUsers = localStorage.getItem('dreams_database_users');
    const savedSession = localStorage.getItem('dreams_active_user');
    const savedAuth = localStorage.getItem('dreams_isLoggedIn');
    const savedQuizAttempts = localStorage.getItem('dreams_quiz_attempts');
    const savedCourses = localStorage.getItem('dreams_courses_v2');
    
    // Manage Users
    let usersList = savedUsers ? JSON.parse(savedUsers) : [];
    if (!usersList.some((u: any) => u.email === 'jawad.khan@dev.com')) {
      usersList.push({ ...INITIAL_USER, password: '112233' });
    }
    if (!usersList.some((u: any) => u.email === 'admin@dreamslms.com')) {
      usersList.push({ 
        name: 'Dreams Admin', 
        email: 'admin@dreamslms.com', 
        password: 'admin123', 
        role: 'admin', 
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
        phone: '+1 800-ADMIN-01' 
      });
    }
    setRegisteredUsers(usersList);
    localStorage.setItem('dreams_database_users', JSON.stringify(usersList));

    // Restore Session
    if (savedAuth === 'true' && savedSession) {
      setUser(JSON.parse(savedSession));
      setIsLoggedIn(true);
    }

    // Restore Content
    if (savedQuizAttempts) setQuizAttempts(JSON.parse(savedQuizAttempts));
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(MOCK_COURSES);
    }
  }, []);

  // Sync state to local storage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('dreams_isLoggedIn', 'true');
      localStorage.setItem('dreams_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dreams_isLoggedIn');
      localStorage.removeItem('dreams_active_user');
    }
  }, [user, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('dreams_quiz_attempts', JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('dreams_courses_v2', JSON.stringify(courses));
    }
  }, [courses]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(INITIAL_USER);
    setCurrentView(View.DASHBOARD);
    setSelectedCourse(null);
    resetQuizState();
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setActiveItem(course.modules[0]?.items[0] || null);
    setCurrentView(View.PLAYER);
    resetQuizState();
  };

  const handleGetAiSummary = async () => {
    if (!activeItem) return;
    setIsLoadingSummary(true);
    const summary = await generateLessonSummary(activeItem.title + ": " + activeItem.content);
    setAiSummary(summary);
    setIsLoadingSummary(false);
  };

  // --- ADMIN ACTIONS ---
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: 'c-' + Date.now(),
      title: newCourseTitle,
      instructor: newCourseInstructor,
      price: newCoursePrice,
      thumbnail: newCourseThumb,
      modules: []
    };
    setCourses([newCourse, ...courses]);
    setIsAdminFormOpen(false);
    setNewCourseTitle('');
    setNewCourseInstructor('');
  };

  const handleAddModule = (courseId: string) => {
    const moduleName = prompt('Enter module name:');
    if (!moduleName) return;
    const newModule: Module = {
      id: 'm-' + Date.now(),
      title: moduleName,
      items: []
    };
    setCourses(courses.map(c => c.id === courseId ? { ...c, modules: [...c.modules, newModule] } : c));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string | null>(null);

  const triggerUpload = (courseId: string, moduleId: string) => {
    setTargetCourseId(courseId);
    setTargetModuleId(moduleId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetCourseId || !targetModuleId) return;

    const fileName = file.name.split('.')[0];
    const videoUrl = URL.createObjectURL(file);

    const newItem: ModuleItem = {
      id: 'i-' + Date.now(),
      type: 'video',
      title: fileName,
      content: videoUrl,
      isCompleted: false,
      duration: 'Local File'
    };

    setCourses(courses.map(c => {
      if (c.id === targetCourseId) {
        return {
          ...c,
          modules: c.modules.map(m => m.id === targetModuleId ? { ...m, items: [...m.items, newItem] } : m)
        };
      }
      return c;
    }));

    setTargetCourseId(null);
    setTargetModuleId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- QUIZ ACTIONS ---
  const resetQuizState = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setIsQuizFinished(false);
    setIsGeneratingQuiz(false);
  };

  const startQuiz = async () => {
    if (!activeItem || !selectedCourse) return;
    setIsGeneratingQuiz(true);
    try {
      const quizContext = `Course: ${selectedCourse.title}. Module Item: ${activeItem.title}. Content: ${activeItem.content}`;
      const generatedQuiz = await generateQuizFromContent(quizContext);
      setCurrentQuiz(generatedQuiz);
    } catch (err) {
      setCurrentQuiz({
        title: activeItem.title,
        questions: [
          {
            question: "What is the main goal of this module?",
            options: ["Learn Basics", "Master Everything", "Skip Lessons", "Forget Skills"],
            correctAnswer: 0,
            explanation: "The module is designed to build a strong foundation."
          }
        ]
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null || !currentQuiz) return;
    if (selectedAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    if (currentQuestionIndex + 1 < currentQuiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!currentQuiz || !selectedCourse) return;
    const finalScoreValue = selectedAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer ? quizScore + 1 : quizScore;
    const percentage = (finalScoreValue / currentQuiz.questions.length) * 100;
    const attempt: UserQuizAttempt = {
      courseTitle: selectedCourse.title,
      quizTitle: currentQuiz.title,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      score: `${finalScoreValue}/${currentQuiz.questions.length}`,
      status: percentage >= 60 ? 'Passed' : 'Failed'
    };
    setQuizAttempts(prev => [attempt, ...prev]);
    setIsQuizFinished(true);
  };

  // --- PROFILE ACTIONS ---
  const startEditingProfile = () => {
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setEditAvatar(user.avatar);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, name: editName, phone: editPhone, avatar: editAvatar };
    setUser(updatedUser);
    const updatedUsers = registeredUsers.map(u => u.email === user.email ? { ...u, name: editName, phone: editPhone, avatar: editAvatar } : u);
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('dreams_database_users', JSON.stringify(updatedUsers));
    setIsEditingProfile(false);
  };

  const Logo = ({ light = false }: { light?: boolean }) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 ${light ? 'bg-white' : 'bg-[#2d1b69]'} rounded-lg flex items-center justify-center`}>
         <svg className={`w-5 h-5 ${light ? 'text-[#2d1b69]' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
         </svg>
      </div>
      <span className={`text-2xl font-black ${light ? 'text-white' : 'text-[#2d1b69]'}`}>Dreams<span className="text-[#ff536a]">LMS</span></span>
    </div>
  );

  const renderSidebar = () => {
    const menuItems = [
      { id: View.DASHBOARD, label: 'Dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
      { id: View.PROFILE, label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: View.ENROLLED, label: 'Enrolled Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13' },
      { id: View.QUIZZES, label: 'Quiz Attempts', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2' },
      { id: View.WISHLIST, label: 'Wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682' },
    ];

    if (user.role === 'admin') {
      menuItems.push({ id: View.ADMIN, label: 'Admin Panel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' });
    }

    return (
      <aside className="lg:col-span-3 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
          <div className="p-6 border-b border-gray-50 bg-[#fff5f6]"><Logo /></div>
          <div className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => { setCurrentView(item.id); setSelectedCourse(null); setIsEditingProfile(false); resetQuizState(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${currentView === item.id ? 'text-[#ff536a] bg-[#fff5f6]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-50">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1" /></svg>
                Logout
             </button>
          </div>
        </div>
      </aside>
    );
  };

  const renderAdminView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">Course Management</h2>
        <button onClick={() => setIsAdminFormOpen(true)} className="px-6 py-3 bg-[#2d1b69] text-white rounded-xl font-bold hover:bg-[#1a103d] transition shadow-lg">Add New Course</button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />

      {isAdminFormOpen && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 animate-in slide-in-from-top-4">
          <h3 className="text-xl font-black">Course Creation</h3>
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Course Title" required value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} className="bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#ff536a]" />
            <input type="text" placeholder="Instructor Name" required value={newCourseInstructor} onChange={e => setNewCourseInstructor(e.target.value)} className="bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#ff536a]" />
            <input type="text" placeholder="Price (e.g. $99)" value={newCoursePrice} onChange={e => setNewCoursePrice(e.target.value)} className="bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#ff536a]" />
            <input type="text" placeholder="Thumbnail URL" value={newCourseThumb} onChange={e => setNewCourseThumb(e.target.value)} className="bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#ff536a]" />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-8 py-3 bg-[#ff536a] text-white rounded-xl font-bold">Create Course</button>
              <button type="button" onClick={() => setIsAdminFormOpen(false)} className="px-8 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs font-black uppercase text-gray-400 tracking-widest">
              <th className="px-6 py-4">Thumbnail</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Modules</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4"><img src={course.thumbnail} className="w-16 h-10 object-cover rounded-lg" alt="" /></td>
                <td className="px-6 py-4 font-black text-gray-900">{course.title}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-500">{course.modules.length} Modules</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleAddModule(course.id)} className="text-xs font-black text-[#ff536a] hover:underline">Add Module</button>
                  <div className="mt-2 space-y-1">
                    {course.modules.map(mod => (
                      <div key={mod.id} className="flex items-center justify-between gap-4 p-2 bg-gray-100 rounded-lg">
                        <span className="text-[10px] font-bold text-gray-600 truncate max-w-[100px]">{mod.title}</span>
                        <button onClick={() => triggerUpload(course.id, mod.id)} className="text-[10px] bg-[#2d1b69] text-white px-2 py-1 rounded">Upload Video</button>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCourseGrid = (courseList: Course[], title: string) => (
    <section className="space-y-6">
      <h3 className="text-xl font-black text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courseList.map((course) => (
          <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all relative flex flex-col">
            <div className="relative aspect-video">
              <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
              <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col flex-1 space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <img src={course.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} className="w-6 h-6 rounded-full" alt="" />
                   <span className="text-[10px] font-bold text-gray-500">{course.instructor}</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">{course.category}</span>
               </div>
               
               <h4 className="text-sm font-black text-gray-900 leading-tight group-hover:text-[#ff536a] transition line-clamp-2 min-h-[2.5rem]">{course.title}</h4>
               
               <div className="flex items-center gap-1">
                 <div className="flex text-yellow-400">
                   {[...Array(5)].map((_, i) => (
                     <svg key={i} className={`w-3 h-3 ${i < Math.floor(course.rating || 0) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                   ))}
                 </div>
                 <span className="text-[10px] font-bold text-gray-900">{course.rating}</span>
                 <span className="text-[10px] font-medium text-gray-400">({course.reviewsCount} Reviews)</span>
               </div>

               <div className="flex items-center justify-between pt-2 mt-auto">
                 <span className="text-lg font-black text-[#ff536a]">{course.price}</span>
                 <button onClick={() => handleViewCourse(course)} className="text-[10px] font-black bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-[#ff536a] transition flex items-center gap-2">
                   View Course
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderQuizInterface = () => {
    if (isGeneratingQuiz) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-12 text-center">
          <div className="w-16 h-16 border-4 border-[#ff536a] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black mb-2">Generating Quiz...</h2>
          <p className="text-gray-400 font-medium">Lumina AI is crafting custom questions for you.</p>
        </div>
      );
    }

    if (!currentQuiz) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-12 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#ff536a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
          </div>
          <h2 className="text-3xl font-black mb-4">{activeItem?.title}</h2>
          <p className="text-gray-400 max-w-md mb-8">Test your knowledge of the material covered in this section with a quick AI-powered quiz.</p>
          <button onClick={startQuiz} className="px-10 py-4 bg-[#ff536a] text-white rounded-2xl font-black hover:bg-[#ff3b55] transition shadow-2xl">Start Quiz</button>
        </div>
      );
    }

    if (isQuizFinished) {
      const finalScore = selectedAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer ? quizScore + 1 : quizScore;
      const percentage = (finalScore / currentQuiz.questions.length) * 100;
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-12 text-center animate-in zoom-in-95 duration-500">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${percentage >= 60 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {percentage >= 60 ? 
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> :
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            }
          </div>
          <h2 className="text-4xl font-black mb-2">{percentage >= 60 ? 'Quiz Passed!' : 'Try Again!'}</h2>
          <p className="text-gray-400 font-bold mb-8 text-lg">You scored <span className="text-white">{finalScore}</span> out of <span className="text-white">{currentQuiz.questions.length}</span></p>
          <div className="flex gap-4">
            <button onClick={resetQuizState} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition">Retake Quiz</button>
            <button onClick={() => setCurrentView(View.DASHBOARD)} className="px-8 py-3 bg-[#ff536a] text-white rounded-xl font-bold hover:bg-[#ff3b55] transition">Back to Dashboard</button>
          </div>
        </div>
      );
    }

    const question = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="w-full h-full flex flex-col bg-slate-900 text-white p-8 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto w-full space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-500">
              <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="bg-[#ff536a] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl md:text-3xl font-black leading-tight">{question.question}</h2>
            <div className="grid grid-cols-1 gap-4">
              {question.options.map((opt, idx) => (
                <button key={idx} onClick={() => setSelectedAnswer(idx)} className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedAnswer === idx ? 'border-[#ff536a] bg-[#ff536a]/10 text-white' : 'border-white/10 bg-white/5 hover:border-white/20 text-gray-300'}`}>
                  <span className="font-bold">{opt}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === idx ? 'border-[#ff536a] bg-[#ff536a]' : 'border-white/20 group-hover:border-white/40'}`}>
                    {selectedAnswer === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-8">
            <button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="px-12 py-4 bg-[#ff536a] text-white rounded-2xl font-black hover:bg-[#ff3b55] disabled:opacity-30 transition shadow-xl">
              {currentQuestionIndex + 1 === currentQuiz.questions.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayer = () => {
    if (!selectedCourse) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-black aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
          {activeItem?.type === 'video' ? (
            activeItem.content.includes('youtube.com') ? (
              <iframe className="w-full h-full" src={activeItem.content.replace('watch?v=', 'embed/')} allowFullScreen title={activeItem.title} />
            ) : (
              <video className="w-full h-full" src={activeItem.content} controls controlsList="nodownload" />
            )
          ) : activeItem?.type === 'quiz' ? (
            renderQuizInterface()
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-12 text-center overflow-y-auto custom-scrollbar">
              <svg className="w-16 h-16 mb-4 text-[#ff536a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <h2 className="text-2xl font-bold mb-4">{activeItem?.title}</h2>
              <div className="max-w-xl text-gray-300 whitespace-pre-wrap text-left prose prose-invert">{activeItem?.content}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-gray-900">{activeItem?.title}</h1>
                {activeItem?.type !== 'quiz' && (
                  <button onClick={handleGetAiSummary} disabled={isLoadingSummary} className="px-6 py-2.5 bg-[#ff536a] text-white rounded-xl text-xs font-bold hover:bg-[#ff3b55] disabled:opacity-50 transition flex items-center gap-2">
                    {isLoadingSummary ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>}
                    Generate AI Summary
                  </button>
                )}
              </div>
              {aiSummary && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 animate-in slide-in-from-top-4">
                  <h4 className="text-blue-900 font-black text-sm mb-3 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9v8l10-12h-9l1 8z" /></svg> AI Smart Summary</h4>
                  <div className="text-blue-800 text-sm whitespace-pre-wrap font-medium">{aiSummary}</div>
                </div>
              )}
              <div className="prose max-w-none text-gray-600 font-medium">
                {activeItem?.type === 'quiz' ? 'Test your proficiency with this custom quiz module.' : `This lesson covers important concepts in ${selectedCourse.title}. Follow along carefully.`}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-lg font-black text-gray-900">Course Content</h3>
            <div className="space-y-3">
              {selectedCourse.modules.map(mod => (
                <div key={mod.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 font-black text-sm text-gray-700">{mod.title}</div>
                  <div className="p-2 space-y-1">
                    {mod.items.map(item => (
                      <button key={item.id} onClick={() => { setActiveItem(item); setAiSummary(''); resetQuizState(); }} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${activeItem?.id === item.id ? 'bg-[#ff536a] text-white' : 'hover:bg-gray-50 text-gray-500'}`}>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.type === 'video' ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" : item.type === 'quiz' ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"} /></svg>
                          {item.title}
                        </span>
                        {item.duration && <span className="opacity-60">{item.duration}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="blue-gradient rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
               <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                 <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl" alt="Pfp" />
                 <div className="text-center md:text-left"><h2 className="text-3xl font-black">{user.name}</h2><p className="text-blue-100 font-medium opacity-80 uppercase tracking-widest text-[10px]">{user.role}</p></div>
               </div>
               <div className="flex items-center gap-3 relative z-10">
                 <button onClick={() => setCurrentView(View.ENROLLED)} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition shadow-lg">My Learning</button>
                 {user.role === 'admin' && <button onClick={() => setCurrentView(View.ADMIN)} className="px-6 py-3 bg-[#ff536a] text-white rounded-xl font-bold text-sm hover:bg-[#ff3b55] transition shadow-lg">Manage Courses</button>}
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[ { label: 'Total Courses', val: courses.length.toString(), color: 'bg-blue-50 text-blue-600' }, { label: 'Quiz Attempts', val: quizAttempts.length.toString(), color: 'bg-red-50 text-red-600' }, { label: 'Completed', val: '0', color: 'bg-green-50 text-green-600' } ].map((stat) => (
                <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center font-black text-xl`}>{stat.val}</div>
                  <p className="text-gray-400 text-sm font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
            {renderCourseGrid(courses, "Recently Enrolled Courses")}
          </div>
        );
      case View.PLAYER: return renderPlayer();
      case View.ADMIN: return renderAdminView();
      case View.ENROLLED: return renderCourseGrid(courses, "My Enrolled Courses");
      case View.WISHLIST: return renderCourseGrid(courses.slice(0, 1), "My Wishlist");
      case View.PROFILE:
        if (isEditingProfile) {
          return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-black text-gray-900">Edit Profile</h3>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-black text-gray-700">Full Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff536a] font-bold text-sm" placeholder="Enter full name" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-black text-gray-700">Phone Number</label>
                    <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff536a] font-bold text-sm" placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-black text-gray-700">Avatar URL</label>
                    <input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff536a] font-bold text-sm" placeholder="Paste image URL" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="submit" className="px-8 py-3 bg-[#ff536a] text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-100 hover:bg-[#ff3b55] transition">Save Changes</button>
                   <button type="button" onClick={() => setIsEditingProfile(false)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Cancel</button>
                </div>
              </form>
            </div>
          );
        }
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900">My Profile</h3>
              <button onClick={startEditingProfile} className="p-2 text-gray-400 hover:text-[#ff536a] transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
              <div><p className="text-sm font-black text-gray-900">Full Name</p><p className="text-sm font-bold text-gray-500 mt-1">{user.name}</p></div>
              <div><p className="text-sm font-black text-gray-900">Email</p><p className="text-sm font-bold text-gray-500 mt-1">{user.email}</p></div>
              <div><p className="text-sm font-black text-gray-900">Role</p><p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest text-[10px]">{user.role}</p></div>
              <div><p className="text-sm font-black text-gray-900">Phone</p><p className="text-sm font-bold text-gray-500 mt-1">{user.phone || 'N/A'}</p></div>
            </div>
          </div>
        );
      case View.QUIZZES:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black text-gray-900">My Quiz Attempts</h3>
            <div className="space-y-4">
              {quizAttempts.length > 0 ? quizAttempts.map((q, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#ff536a]/30 transition">
                  <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-widest text-[#ff536a]">{q.courseTitle}</p><h4 className="font-black text-gray-900">{q.quizTitle}</h4><p className="text-xs font-bold text-gray-400">Attempted on {q.date}</p></div>
                  <div className="flex items-center gap-6"><div className="text-right"><p className="text-xl font-black text-gray-900">{q.score}</p><p className={`text-[10px] font-black uppercase ${q.status === 'Passed' ? 'text-green-500' : 'text-red-500'}`}>{q.status}</p></div></div>
                </div>
              )) : <div className="text-center py-20 text-gray-400"><p className="font-black">No quiz attempts yet.</p></div>}
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess} 
        registeredUsers={registeredUsers} 
        setRegisteredUsers={setRegisteredUsers} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col">
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {renderSidebar()}
          <div className="lg:col-span-9 space-y-8">{renderContent()}</div>
        </div>
      </main>
      <footer className="bg-white border-t border-gray-100 pt-20 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
          <div className="space-y-6"><Logo /><p className="text-sm text-gray-400 font-medium">Platform designed to help learners manage, deliver, and track learning activities.</p></div>
          <div className="space-y-6"><h4 className="text-lg font-black text-[#2d1b69]">Quick Links</h4><ul className="space-y-3 text-sm font-bold text-gray-500"><li className="hover:text-[#ff536a] cursor-pointer" onClick={() => { setCurrentView(View.ENROLLED); setIsEditingProfile(false); resetQuizState(); }}>My Courses</li><li className="hover:text-[#ff536a] cursor-pointer" onClick={() => { setCurrentView(View.PROFILE); setIsEditingProfile(false); resetQuizState(); }}>Profile</li></ul></div>
          <div className="space-y-6"><h4 className="text-lg font-black text-[#2d1b69]">Support</h4><ul className="space-y-3 text-sm font-bold text-gray-500"><li>Contact: support@dreamslms.com</li><li>Help Center</li></ul></div>
          <div className="space-y-6"><h4 className="text-lg font-black text-[#2d1b69]">Newsletter</h4><div className="relative"><input type="text" placeholder="Your email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 pr-12 text-sm outline-none focus:border-[#ff536a] text-black" /></div></div>
        </div>
        <div className="bg-[#2d1b69] py-6 text-center text-white text-xs font-bold uppercase tracking-widest"><p>© 2025 DreamsLMS. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default App;
