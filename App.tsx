
import React, { useState, useEffect } from 'react';
import { View, Course, Module, ModuleItem, User, ItemType, Certificate, Order } from './types';
import { MOCK_COURSES, INITIAL_USER } from './constants';
import { generateLessonSummary } from './services/geminiService';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- APP CONTENT STATE ---
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeItem, setActiveItem] = useState<ModuleItem | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // --- PERSISTENCE LAYER ---
  useEffect(() => {
    const savedUsers = localStorage.getItem('dreams_database_users');
    const savedSession = localStorage.getItem('dreams_active_user');
    const savedAuth = localStorage.getItem('dreams_isLoggedIn');
    
    let usersList = savedUsers ? JSON.parse(savedUsers) : [];
    if (!usersList.some((u: any) => u.email === 'jawad.khan@dev.com')) {
      usersList.push({ ...INITIAL_USER, password: '112233' });
      localStorage.setItem('dreams_database_users', JSON.stringify(usersList));
    }
    setRegisteredUsers(usersList);

    if (savedAuth === 'true' && savedSession) {
      setUser(JSON.parse(savedSession));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('dreams_isLoggedIn', 'true');
      localStorage.setItem('dreams_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dreams_isLoggedIn');
      localStorage.removeItem('dreams_active_user');
    }
  }, [user, isLoggedIn]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!signupName || !signupEmail || !signupPassword) return setAuthError('All fields required.');
    if (signupPassword !== confirmPassword) return setAuthError('Passwords mismatch.');
    const newUser = { name: signupName, email: signupEmail, password: signupPassword, role: 'student', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupName}` };
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('dreams_database_users', JSON.stringify(updatedUsers));
    setUser({ ...newUser, role: 'student', phone: '' });
    setIsLoggedIn(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const foundUser = registeredUsers.find(u => u.email === loginEmail && u.password === loginPassword);
    if (foundUser) {
      setUser({ ...foundUser, role: foundUser.role, phone: foundUser.phone || '' });
      setIsLoggedIn(true);
    } else {
      setAuthError('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView(View.DASHBOARD);
    setSelectedCourse(null);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setActiveItem(course.modules[0]?.items[0] || null);
    setCurrentView(View.PLAYER);
  };

  const handleGetAiSummary = async () => {
    if (!activeItem) return;
    setIsLoadingSummary(true);
    const summary = await generateLessonSummary(activeItem.title + ": " + activeItem.content);
    setAiSummary(summary);
    setIsLoadingSummary(false);
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-white">
        <div className="hidden lg:flex flex-1 bg-[#FFF5F6] flex-col items-center justify-center p-12 text-center">
          <div className="relative w-full max-w-lg mb-12">
            <div className="bg-white rounded-full w-96 h-96 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
            <img src="https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg" alt="Edu" className="relative z-10 w-full" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#2d1b69] mb-4">Welcome to <br /> DreamsLMS Courses.</h2>
        </div>
        <div className="flex-1 flex flex-col px-6 py-8 md:px-20 lg:px-24">
          <div className="flex justify-between items-center mb-12"><Logo /></div>
          <div className="max-w-md w-full mx-auto my-auto">
            {authScreen === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <h1 className="text-3xl font-extrabold text-gray-900">Sign into Your Account</h1>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Email" />
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Password" />
                {authError && <div className="text-red-600 text-xs font-bold">{authError}</div>}
                <button type="submit" className="w-full py-4 bg-[#ff536a] text-white rounded-xl font-bold hover:bg-[#ff3b55] transition shadow-lg">Login</button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Sign Up</h1>
                <input type="text" required value={signupName} onChange={(e) => setSignupName(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Full Name" />
                <input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Email" />
                <input type="password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Password" />
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Confirm Password" />
                {authError && <div className="text-red-600 text-xs font-bold">{authError}</div>}
                <button type="submit" className="w-full py-4 bg-[#ff536a] text-white rounded-xl font-bold hover:bg-[#ff3b55] transition shadow-lg">Sign Up</button>
              </form>
            )}
            <p className="text-center mt-6 text-sm text-gray-500 font-medium">
              {authScreen === 'login' ? "Don't you have an account?" : "Already have an account?"}
              <button onClick={() => setAuthScreen(authScreen === 'login' ? 'signup' : 'login')} className="text-[#ff536a] font-bold ml-1.5">{authScreen === 'login' ? 'Sign up' : 'Sign In'}</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderSidebar = () => {
    const menuItems = [
      { id: View.DASHBOARD, label: 'Dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
      { id: View.PROFILE, label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: View.ENROLLED, label: 'Enrolled Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13' },
      { id: View.CERTIFICATES, label: 'My Certificates', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944' },
      { id: View.WISHLIST, label: 'Wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682' },
      { id: View.REVIEWS, label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674' },
      { id: View.QUIZZES, label: 'My Quiz Attempts', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2' },
      { id: View.ORDERS, label: 'Order History', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293' },
    ];

    return (
      <aside className="lg:col-span-3 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-[#fff5f6]"><Logo /></div>
          <div className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => { setCurrentView(item.id); setSelectedCourse(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${currentView === item.id ? 'text-[#ff536a] bg-[#fff5f6]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-50">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1" /></svg>
                Logout
             </button>
          </div>
        </div>
      </aside>
    );
  };

  const renderCourseGrid = (courseList: Course[], title: string) => (
    <section className="space-y-6">
      <h3 className="text-xl font-black text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courseList.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
            <img src={course.thumbnail} className="w-full h-44 object-cover" alt={course.title} />
            <div className="p-5 space-y-3">
               <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">{course.instructor}</span>
               <h4 className="text-sm font-black text-gray-900 leading-tight group-hover:text-[#ff536a] transition">{course.title}</h4>
               <div className="flex items-center justify-between pt-2">
                 <span className="text-[#ff536a] font-black">{course.price || '$99'}</span>
                 <button onClick={() => handleViewCourse(course)} className="text-xs font-black bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-[#ff536a] transition">View Course</button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderPlayer = () => {
    if (!selectedCourse) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-black aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
          {activeItem?.type === 'video' ? (
            <iframe 
              className="w-full h-full" 
              src={activeItem.content.replace('watch?v=', 'embed/')} 
              allowFullScreen 
              title={activeItem.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-12 text-center">
              <svg className="w-16 h-16 mb-4 text-[#ff536a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <h2 className="text-2xl font-bold mb-4">{activeItem?.title}</h2>
              <div className="max-w-xl text-gray-300 whitespace-pre-wrap text-left">{activeItem?.content}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-gray-900">{activeItem?.title}</h1>
                <button onClick={handleGetAiSummary} disabled={isLoadingSummary} className="px-6 py-2.5 bg-[#ff536a] text-white rounded-xl text-xs font-bold hover:bg-[#ff3b55] disabled:opacity-50 transition flex items-center gap-2">
                  {isLoadingSummary ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>}
                  Generate AI Summary
                </button>
              </div>
              {aiSummary && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 animate-in slide-in-from-top-4">
                  <h4 className="text-blue-900 font-black text-sm mb-3 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9v8l10-12h-9l1 8z" /></svg> AI Smart Summary</h4>
                  <div className="text-blue-800 text-sm whitespace-pre-wrap font-medium">{aiSummary}</div>
                </div>
              )}
              <div className="prose max-w-none text-gray-600 font-medium">This lesson covers important concepts in {selectedCourse.title}. Follow along carefully.</div>
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
                      <button key={item.id} onClick={() => { setActiveItem(item); setAiSummary(''); }} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${activeItem?.id === item.id ? 'bg-[#ff536a] text-white' : 'hover:bg-gray-50 text-gray-500'}`}>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.type === 'video' ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"} /></svg>
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
                 <div className="text-center md:text-left"><h2 className="text-3xl font-black">{user.name}</h2><p className="text-blue-100 font-medium opacity-80">Student</p></div>
               </div>
               <div className="flex items-center gap-3 relative z-10">
                 <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition shadow-lg">Become Instructor</button>
                 <button className="px-6 py-3 bg-[#ff536a] text-white rounded-xl font-bold text-sm hover:bg-[#ff3b55] transition shadow-lg">Dashboard</button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[ { label: 'Enrolled Courses', val: '12', color: 'bg-blue-50 text-blue-600' }, { label: 'Active Courses', val: '03', color: 'bg-red-50 text-red-600' }, { label: 'Completed Courses', val: '10', color: 'bg-green-50 text-green-600' } ].map((stat) => (
                <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center font-black text-xl`}>{stat.val}</div>
                  <p className="text-gray-400 text-sm font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
            {renderCourseGrid(MOCK_COURSES, "Recently Enrolled Courses")}
          </div>
        );
      case View.PLAYER: return renderPlayer();
      case View.ENROLLED: return renderCourseGrid(MOCK_COURSES, "My Enrolled Courses");
      case View.WISHLIST: return renderCourseGrid(MOCK_COURSES.slice(0, 1), "My Wishlist");
      case View.PROFILE:
        const firstName = user.name.split(' ')[0];
        const lastName = user.name.split(' ').slice(1).join(' ') || 'Richard';
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-gray-900">My Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
              <div><p className="text-sm font-black text-gray-900">First Name</p><p className="text-sm font-bold text-gray-500 mt-1">{firstName}</p></div>
              <div><p className="text-sm font-black text-gray-900">Last Name</p><p className="text-sm font-bold text-gray-500 mt-1">{lastName}</p></div>
              <div><p className="text-sm font-black text-gray-900">Registration Date</p><p className="text-sm font-bold text-gray-500 mt-1">16 Jan 2024, 11:15 AM</p></div>
              <div><p className="text-sm font-black text-gray-900">Email</p><p className="text-sm font-bold text-gray-500 mt-1">{user.email}</p></div>
            </div>
            <div className="pt-6 border-t border-gray-50"><p className="text-sm font-black text-gray-900">Bio</p><p className="text-sm font-bold text-gray-500 mt-3 leading-relaxed">I'm passionate about developing software solutions.</p></div>
          </div>
        );
      case View.CERTIFICATES:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black text-gray-900">My Certificates</h3>
            <div className="space-y-4">
              {[ {id: '1', title: 'React.js Pro Mastery', date: 'Feb 15, 2025'} ].map(cert => (
                <div key={cert.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div><h4 className="font-black text-gray-900">{cert.title}</h4><p className="text-xs font-bold text-gray-400">Awarded on {cert.date}</p></div>
                  <button className="px-6 py-2 bg-[#ff536a] text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-100">Download PDF</button>
                </div>
              ))}
            </div>
          </div>
        );
      case View.ORDERS:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-50"><h3 className="text-2xl font-black text-gray-900">Order History</h3></div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-50">
                <tr><th className="px-8 py-4">Course</th><th className="px-8 py-4">Date</th><th className="px-8 py-4">Amount</th><th className="px-8 py-4">Status</th></tr>
              </thead>
              <tbody className="text-sm font-bold text-gray-600">
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-8 py-6">Pro Course Batch 11</td><td className="px-8 py-6">Jan 10, 2025</td><td className="px-8 py-6 text-[#ff536a]">$99</td><td className="px-8 py-6"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case View.QUIZZES:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black text-gray-900">My Quiz Attempts</h3>
            <div className="space-y-4">
              {[ { title: 'Orientation Quiz', date: 'Jan 12, 2025', score: '8/10', status: 'Passed' } ].map((q, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div><h4 className="font-black text-gray-900">{q.title}</h4><p className="text-xs font-bold text-gray-400">Attempted on {q.date}</p></div>
                  <div className="flex items-center gap-6">
                    <div className="text-right"><p className="text-lg font-black text-gray-900">{q.score}</p><p className="text-[10px] font-black text-green-500 uppercase">{q.status}</p></div>
                    <button className="text-[#ff536a] font-black text-xs hover:underline">Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case View.REVIEWS:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black text-gray-900">My Reviews</h3>
            <div className="space-y-6">
              {[ { course: 'Pro Course Batch 11', rating: 5, comment: 'Excellent course material!' } ].map((r, i) => (
                <div key={i} className="p-6 border border-gray-50 rounded-2xl space-y-3">
                   <div className="flex items-center justify-between">
                     <h4 className="font-black text-gray-900">{r.course}</h4>
                     <div className="flex gap-1 text-[#ffc107]">{Array.from({length: r.rating}).map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>
                   </div>
                   <p className="text-sm font-medium text-gray-500">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

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
          <div className="space-y-6"><h4 className="text-lg font-black text-[#2d1b69]">Quick Links</h4><ul className="space-y-3 text-sm font-bold text-gray-500"><li className="hover:text-[#ff536a] cursor-pointer" onClick={() => setCurrentView(View.ENROLLED)}>My Courses</li><li className="hover:text-[#ff536a] cursor-pointer" onClick={() => setCurrentView(View.PROFILE)}>Profile</li></ul></div>
          <div className="space-y-6"><h4 className="text-lg font-black text-[#2d1b69]">Support</h4><ul className="space-y-3 text-sm font-bold text-gray-500"><li>Contact: support@dreamslms.com</li><li>Help Center</li></ul></div>
          <div className="space-y-6"><h4 className="text-lg font-black text-[#2d1b69]">Newsletter</h4><div className="relative"><input type="text" placeholder="Your email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 pr-12 text-sm outline-none focus:border-[#ff536a] text-black" /></div></div>
        </div>
        <div className="bg-[#2d1b69] py-6 text-center text-white text-xs font-bold uppercase tracking-widest"><p>© 2025 DreamsLMS. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default App;
