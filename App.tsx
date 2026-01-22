
import React, { useState, useEffect } from 'react';
import { View, Course, Module, ModuleItem, User, ItemType } from './types';
import { MOCK_COURSES, INITIAL_USER } from './constants';
import Sidebar from './components/Sidebar';

type AuthScreen = 'login' | 'signup';

const App: React.FC = () => {
  // --- AUTH & USER STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  
  // --- FORM STATE ---
  const [loginEmail, setLoginEmail] = useState('jawad.khan@dev.com');
  const [loginPassword, setLoginPassword] = useState('112233');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- APP CONTENT STATE ---
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);
  const [activeItem, setActiveItem] = useState<ModuleItem | null>(null);

  // --- ADMIN TOOLS STATE ---
  const [adminTargetCourse, setAdminTargetCourse] = useState<string>(courses[0].id);
  const [adminTargetModule, setAdminTargetModule] = useState<string>('');
  const [newItem, setNewItem] = useState<{title: string, type: ItemType, content: string, duration: string}>({
    title: '', type: 'video', content: '', duration: ''
  });
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // --- PERSISTENCE LAYER ---
  useEffect(() => {
    const savedUsers = localStorage.getItem('lumina_database_users');
    const savedCourses = localStorage.getItem('lumina_courses');
    const savedSession = localStorage.getItem('lumina_active_user');
    const savedAuth = localStorage.getItem('lumina_isLoggedIn');
    
    // Seed Admin if database is empty
    let usersList = savedUsers ? JSON.parse(savedUsers) : [];
    const adminExists = usersList.some((u: any) => u.email === 'jawad.khan@dev.com');
    
    if (!adminExists) {
      const adminUser = {
        name: 'Jawad Khan',
        email: 'jawad.khan@dev.com',
        password: '112233',
        role: 'admin',
        avatar: INITIAL_USER.avatar
      };
      usersList.push(adminUser);
      localStorage.setItem('lumina_database_users', JSON.stringify(usersList));
    }
    setRegisteredUsers(usersList);

    if (savedCourses) {
      const parsedCourses = JSON.parse(savedCourses);
      setCourses(parsedCourses);
      setSelectedCourse(parsedCourses[0]);
    }

    if (savedAuth === 'true' && savedSession) {
      setUser(JSON.parse(savedSession));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_courses', JSON.stringify(courses));
    if (isLoggedIn) {
      localStorage.setItem('lumina_isLoggedIn', 'true');
      localStorage.setItem('lumina_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lumina_isLoggedIn');
      localStorage.removeItem('lumina_active_user');
    }
  }, [user, courses, isLoggedIn]);

  // --- AUTH ACTIONS ---
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!signupName || !signupEmail || !signupPassword) {
      setAuthError('All fields are required.');
      return;
    }

    if (registeredUsers.some(u => u.email === signupEmail)) {
      setAuthError('This email is already registered.');
      return;
    }

    const newUser = {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupName}`
    };

    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('lumina_database_users', JSON.stringify(updatedUsers));
    
    // Auto-login after signup
    setUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'student' | 'admin',
      phone: '',
      avatar: newUser.avatar
    });
    setIsLoggedIn(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const foundUser = registeredUsers.find(u => u.email === loginEmail && u.password === loginPassword);

    if (foundUser) {
      setUser({
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role as 'student' | 'admin',
        phone: foundUser.phone || '',
        avatar: foundUser.avatar
      });
      setIsLoggedIn(true);
    } else {
      setAuthError('Invalid email or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView(View.DASHBOARD);
    setActiveItem(null);
    setAuthScreen('login');
  };

  // --- ADMIN ACTIONS ---
  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    const updatedCourses = courses.map(c => {
      if (c.id === adminTargetCourse) {
        return {
          ...c,
          modules: [...c.modules, { 
            id: `m-${Date.now()}`, 
            title: newModuleTitle, 
            items: [] 
          }]
        };
      }
      return c;
    });
    setCourses(updatedCourses);
    setNewModuleTitle('');
  };

  const handleAddItem = () => {
    if (!newItem.title || !newItem.content || !adminTargetModule) return;
    const updatedCourses = courses.map(c => {
      if (c.id === adminTargetCourse) {
        return {
          ...c,
          modules: c.modules.map(m => {
            if (m.id === adminTargetModule) {
              return {
                ...m,
                items: [...m.items, {
                  id: `i-${Date.now()}`,
                  ...newItem,
                  isCompleted: false
                }]
              };
            }
            return m;
          })
        };
      }
      return c;
    });
    setCourses(updatedCourses);
    setNewItem({ title: '', type: 'video', content: '', duration: '' });
    alert("Content Published!");
  };

  // --- HELPERS ---
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const calculateProgress = (course: Course) => {
    const flat = course.modules.flatMap(m => m.items);
    if (flat.length === 0) return 0;
    const completed = flat.filter(i => i.isCompleted).length;
    return Math.round((completed / flat.length) * 100);
  };

  const toggleComplete = (itemId: string) => {
    const updatedCourses = courses.map(c => ({
      ...c,
      modules: c.modules.map(m => ({
        ...m,
        items: m.items.map(i => i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i)
      }))
    }));
    setCourses(updatedCourses);
    const updatedCourse = updatedCourses.find(c => c.id === selectedCourse.id)!;
    setSelectedCourse(updatedCourse);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent">
        <div className="glass w-full max-w-md p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b3dff] to-transparent opacity-50"></div>
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#8b3dff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20 group hover:rotate-6 transition-transform">
              <span className="text-white text-4xl font-black">L</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Lumina <span className="text-[#8b3dff]">Portal</span></h1>
            <p className="text-slate-400 mt-2 text-sm">Empowering the next generation of creators</p>
          </div>

          <div className="flex bg-[#10101f] p-1 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => { setAuthScreen('login'); setAuthError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authScreen === 'login' ? 'bg-[#8b3dff] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setAuthScreen('signup'); setAuthError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authScreen === 'signup' ? 'bg-[#8b3dff] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={authScreen === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {authScreen === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8b3dff] transition-all" 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Email Address</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                value={authScreen === 'login' ? loginEmail : signupEmail}
                onChange={(e) => authScreen === 'login' ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)}
                className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8b3dff] transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={authScreen === 'login' ? loginPassword : signupPassword}
                onChange={(e) => authScreen === 'login' ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
                className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8b3dff] transition-all" 
              />
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-[#8b3dff] text-white rounded-2xl font-black hover:bg-[#7a2ff0] transition shadow-lg shadow-purple-900/40 uppercase tracking-widest text-xs"
            >
              {authScreen === 'login' ? 'Proceed to Learning' : 'Initialize Account'}
            </button>
          </form>

          {authScreen === 'login' && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Forgot your credentials? Contact <span className="text-[#8b3dff] hover:underline cursor-pointer">Support</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] flex">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto h-screen custom-scrollbar">
        {/* ADMIN VIEW */}
        {currentView === View.ADMIN && user.role === 'admin' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-white">Control <span className="text-[#8b3dff]">Center</span></h1>
                <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Simulated Backend Management</p>
              </div>
              <div className="flex items-center gap-4 bg-[#10101f] px-6 py-3 rounded-2xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse"></div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Database Synced</span>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="bg-[#10101f] border border-white/5 rounded-[2rem] p-8 shadow-xl">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Database Health</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">Registered Users</span>
                      <span className="text-2xl font-black text-white">{registeredUsers.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">Total Courses</span>
                      <span className="text-2xl font-black text-white">{courses.length}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold border border-red-500/20 hover:bg-red-500/20 transition text-sm">
                  Wipe Data Store
                </button>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#10101f] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                  <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#8b3dff]/20 text-[#8b3dff] flex items-center justify-center text-sm">01</span>
                    New Content Item
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Module</label>
                        <select 
                          value={adminTargetModule}
                          onChange={(e) => setAdminTargetModule(e.target.value)}
                          className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]"
                        >
                          <option value="">Select Target...</option>
                          {courses.find(c => c.id === adminTargetCourse)?.modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Type</label>
                        <select 
                          value={newItem.type}
                          onChange={(e) => setNewItem({...newItem, type: e.target.value as ItemType})}
                          className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]"
                        >
                          <option value="video">Video</option>
                          <option value="note">Document</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Content URL / Markdown</label>
                      <textarea 
                        rows={3}
                        value={newItem.content}
                        onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                        placeholder="Paste link or write text here..."
                        className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]"
                      />
                    </div>
                    <button onClick={handleAddItem} className="w-full py-5 bg-[#8b3dff] text-white rounded-2xl font-black hover:bg-[#7a2ff0] transition shadow-lg uppercase tracking-widest text-sm">
                      Publish Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {currentView === View.DASHBOARD && (
          <div className="max-w-6xl mx-auto space-y-12">
            <header>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                Welcome Back, <span className="text-[#8b3dff] text-glow">{user.name.split(' ')[0]}</span>.
              </h1>
              <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.3em] text-[10px]">Your personalized learning matrix is ready</p>
            </header>

            {courses.map(course => (
              <div key={course.id} className="bg-[#10101f] border border-white/5 rounded-[2.5rem] p-8 flex flex-col lg:flex-row gap-8 items-center group hover:bg-[#15152a] transition-all duration-500">
                <div className="w-full lg:w-96 aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl">
                   <img src={course.thumbnail} alt="Course" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                   <div className="absolute bottom-6 left-6">
                     <span className="bg-[#8b3dff] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Premium Course</span>
                   </div>
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-[#8b3dff] transition-colors">{course.title}</h2>
                    <p className="text-slate-500 font-bold mt-1">Instructor: {course.instructor}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Curriculum Completion</span>
                      <span className="text-white">{calculateProgress(course)}%</span>
                    </div>
                    <div className="w-full bg-[#1a1a2e] h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-[#8b3dff] h-full rounded-full shadow-[0_0_15px_rgba(139,61,255,0.4)] transition-all duration-1000 ease-out" 
                        style={{ width: `${calculateProgress(course)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setSelectedCourse(course);
                        const firstItem = course.modules[0].items[0];
                        setActiveItem(firstItem);
                        setCurrentView(View.PLAYER);
                      }}
                      className="px-8 py-4 bg-[#8b3dff] text-white rounded-2xl font-black hover:bg-[#7a2ff0] transition shadow-lg shadow-purple-900/40 uppercase tracking-widest text-xs"
                    >
                      Resume Learning
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PLAYER VIEW */}
        {currentView === View.PLAYER && activeItem && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-7xl mx-auto">
            <div className="lg:col-span-3 space-y-6">
               <div className="bg-[#0a0a1a] rounded-[2.5rem] aspect-video overflow-hidden border border-white/5 shadow-2xl">
                  {activeItem.type === 'video' ? (
                    <iframe 
                      className="w-full h-full"
                      src={getEmbedUrl(activeItem.content)}
                      title={activeItem.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="p-12 h-full bg-[#10101f] overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
                      <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">{activeItem.title}</h2>
                      <div className="text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">
                        {activeItem.content}
                      </div>
                    </div>
                  )}
               </div>

               <div className="bg-[#10101f] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${activeItem.type === 'video' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {activeItem.type === 'video' ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{activeItem.title}</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{activeItem.type} • {activeItem.duration || 'Study Material'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleComplete(activeItem.id)} 
                    className={`px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 uppercase tracking-widest text-xs ${activeItem.isCompleted ? 'bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/20' : 'bg-[#8b3dff] text-white shadow-lg hover:bg-[#7a2ff0]'}`}
                  >
                    {activeItem.isCompleted ? 'Completed' : 'Mark as Done'}
                  </button>
               </div>
            </div>

            <div className="bg-[#10101f] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-[#15152a]">
                 <h4 className="font-black text-white uppercase text-[10px] tracking-[0.3em]">Course Structure</h4>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                 {selectedCourse.modules.map((module, mIdx) => (
                   <div key={module.id}>
                      <div className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-[#8b3dff]/30 ml-2 mb-2">
                        {module.title}
                      </div>
                      <div className="space-y-1">
                        {module.items.map(item => (
                          <button 
                            key={item.id} 
                            onClick={() => setActiveItem(item)} 
                            className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all group ${activeItem.id === item.id ? 'bg-[#8b3dff] text-white shadow-xl' : 'hover:bg-[#1a1a2e] text-slate-500 hover:text-white'}`}
                          >
                            <div className={`w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.isCompleted ? 'bg-[#00ffa3] border-[#00ffa3] text-black' : activeItem.id === item.id ? 'border-white/50' : 'border-slate-800'}`}>
                              {item.isCompleted && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                            <span className="text-sm font-bold truncate">{item.title}</span>
                          </button>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {currentView === View.PROFILE && (
          <div className="max-w-4xl mx-auto space-y-10">
            <h1 className="text-4xl font-black text-white mb-4">Account <span className="text-[#8b3dff]">Matrix</span></h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-[#10101f] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl text-center">
                 <div className="w-32 h-32 mx-auto rounded-[2.5rem] border-4 border-[#1a1a2e] shadow-xl overflow-hidden bg-[#15152a]">
                    <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                 </div>
                 <h2 className="text-xl font-bold text-white mt-6">{user.name}</h2>
                 <p className="text-[#8b3dff] text-[10px] font-black uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <div className="lg:col-span-2 bg-[#10101f] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Display Name</label>
                    <input type="text" value={user.name} disabled className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-6 py-4 text-white opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Email Identity</label>
                    <input type="email" value={user.email} disabled className="w-full bg-[#15152a] border border-white/5 rounded-2xl px-6 py-4 text-white opacity-50 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
