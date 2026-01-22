
import React, { useState } from 'react';
import { User } from '../types';
import { INITIAL_USER } from '../constants';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  registeredUsers: any[];
  setRegisteredUsers: (users: any[]) => void;
}

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

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, registeredUsers, setRegisteredUsers }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('jawad.khan@dev.com');
  const [password, setPassword] = useState('112233');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      onLoginSuccess({ ...foundUser, role: foundUser.role as 'student' | 'admin' });
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) return setError('All fields required.');
    if (password !== confirmPassword) return setError('Passwords mismatch.');
    
    const newUser = { 
      name, 
      email, 
      password, 
      role: 'student', 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      phone: ''
    };
    
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('dreams_database_users', JSON.stringify(updatedUsers));
    onLoginSuccess({ ...newUser, role: 'student' as const });
  };

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
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <h1 className="text-3xl font-extrabold text-gray-900">Sign into Your Account</h1>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Email" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Password" />
              {error && <div className="text-red-600 text-xs font-bold">{error}</div>}
              <button type="submit" className="w-full py-4 bg-[#ff536a] text-white rounded-xl font-bold hover:bg-[#ff3b55] transition shadow-lg">Login</button>
              <p className="text-[10px] text-gray-400 font-bold text-center mt-2">Admin Demo: admin@dreamslms.com / admin123</p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <h1 className="text-3xl font-extrabold text-gray-900">Sign Up</h1>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Full Name" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Email" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Password" />
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white text-black border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#ff536a]" placeholder="Confirm Password" />
              {error && <div className="text-red-600 text-xs font-bold">{error}</div>}
              <button type="submit" className="w-full py-4 bg-[#ff536a] text-white rounded-xl font-bold hover:bg-[#ff3b55] transition shadow-lg">Sign Up</button>
            </form>
          )}
          <p className="text-center mt-6 text-sm text-gray-500 font-medium">
            {authMode === 'login' ? "Don't you have an account?" : "Already have an account?"}
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[#ff536a] font-bold ml-1.5">{authMode === 'login' ? 'Sign up' : 'Sign In'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
