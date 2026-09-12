import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Access granted. Welcome to SentinelSOC.');
      } else {
        await register(name, email, password);
        toast.success('Account created. Access granted.');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication failed. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <ShieldAlert className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Sentinel<span className="text-cyan-400">SOC</span></h1>
          <p className="text-gray-400 text-sm mt-2 tracking-widest font-mono">SECURE AUTHENTICATION</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Operator Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Operator ID (Email)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="analyst@soc.local"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Passcode</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all font-mono tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'AUTHENTICATING...' : (isLogin ? 'INITIALIZE SESSION' : 'REGISTER OPERATOR')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-mono text-cyan-400/70 hover:text-cyan-300 transition-colors"
          >
            {isLogin ? 'REQUEST NEW OPERATOR ACCESS' : 'RETURN TO SECURE LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
