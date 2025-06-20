import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, role: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const demoUsers = [
    { username: 'rohit', password: 'rohit123', role: 'Sales Engineer' },
    { username: 'uma', password: 'uma123', role: 'Sales Director' },
    { username: 'deepak', password: 'deepak123', role: 'Sales Engineer' },
    { username: 'vinod', password: 'vinod123', role: 'Sales Director' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Find user in demoUsers
    const user = demoUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setError('');
      onLogin(user.username, user.role);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">      {/* Logo and Title on top */}
      <div className="flex flex-col items-center w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div style={{ background: 'linear-gradient(71deg, rgba(251, 78, 89, 1) 0%, rgba(24, 0, 58, 1) 100%)' }} className="p-4 rounded">
            <img src="/logo-01-300.png" alt="JBS Logo" className="h-14 w-auto" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent tracking-tight">
              AccelQuote AGX™
            </h1>
            <p className="text-xs text-gray-500 font-medium">Agentic Gen AI eXperience</p>
          </div>
          <div className="relative flex items-center justify-center mt-2">
            <span className="block rounded-full bg-gradient-to-tr from-purple-400 via-blue-400 to-blue-600 p-2 shadow-xl">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
                <ellipse cx="24" cy="24" rx="20" ry="16" fill="#ede9fe" />
                <path d="M16 24c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="24" cy="24" r="3" fill="#6366f1" className="animate-pulse"/>
              </svg>
            </span>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.1s' }}></span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.3s' }}></span>
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce-slow" style={{ animationDelay: '0.5s' }}></span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce-slow" style={{ animationDelay: '0.7s' }}></span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Login</h2>
          <input
            type="text"
            placeholder="Username"
            className="px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
