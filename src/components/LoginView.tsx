import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, User as UserIcon, Lock, Sparkles, GraduationCap, School } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [role, setRole] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState(''); // Email, Name or Registration Number
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (role === 'admin') {
        // Admin Mock - In a real app use Supabase Auth
        if (identifier === 'admin' && password === 'admin123') {
          onLogin({ id: 'admin', name: 'Diretor Carlos', role: 'admin' });
        } else {
          setError('Credenciais de administrador inválidas.');
        }
      } else if (role === 'teacher') {
        const { data, error: fetchError } = await supabase
          .from('teachers')
          .select('*')
          .ilike('name', identifier)
          .single();

        if (fetchError || !data) {
          setError('Professor não encontrado.');
        } else {
          // In a real app, verify password
          onLogin({ id: data.id, name: data.name, role: 'teacher', teacherId: data.id });
        }
      } else if (role === 'student') {
        const { data, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('registration_number', identifier)
          .single();

        if (fetchError || !data) {
          setError('Matrícula não encontrada.');
        } else {
          onLogin({ id: data.id, name: data.name, role: 'student', studentId: data.id });
        }
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E1F5FE] flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4FC3F7]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFF176]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[56px] border-8 border-white shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="bg-[#0288D1] p-10 text-white text-center relative">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
             <School className="w-12 h-12 text-[#0288D1]" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Escola Primeiras Descobertas</h1>
          <p className="text-cyan-100 font-bold text-sm mt-2">Bem-vindo ao nosso portal mágico! ✨</p>
          
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {(['admin', 'teacher', 'student'] as const).map(r => (
              <button 
                key={r}
                onClick={() => { setRole(r); setIdentifier(''); setPassword(''); setError(''); }}
                className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-2 transition-all shadow-md ${
                  role === r ? 'bg-[#FFF176] text-[#5D4037] border-[#FBC02D] scale-110' : 'bg-white text-gray-400 border-gray-100 opacity-60'
                }`}
              >
                {r === 'admin' ? 'Diretor' : r === 'teacher' ? 'Professor' : 'Aluno'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 pt-14 space-y-6">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border-2 border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
              {role === 'admin' ? 'Usuário' : role === 'teacher' ? 'Nome do Professor' : 'Número de Matrícula (RA)'}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0288D1] w-5 h-5" />
              <input 
                type="text" 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={role === 'admin' ? 'admin' : role === 'teacher' ? 'Ex: Carlos Oliveira' : 'Ex: 2024001'}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-4 border-transparent rounded-3xl font-black text-[#01579B] outline-none focus:border-[#E1F5FE] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {role === 'admin' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0288D1] w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-4 border-transparent rounded-3xl font-black text-[#01579B] outline-none focus:border-[#E1F5FE] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-[#0288D1] text-white rounded-[32px] font-black text-lg border-b-8 border-[#01579B] shadow-xl hover:brightness-110 active:translate-y-2 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-6 h-6" /> ENTRAR NO PORTAL</>}
          </button>

          {role === 'student' && (
            <p className="text-center text-[10px] font-bold text-gray-400 px-6 italic">
              Atenção aluno: Use o seu RA entregue na secretaria para acessar o seu ambiente financeiro e de estudos.
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
