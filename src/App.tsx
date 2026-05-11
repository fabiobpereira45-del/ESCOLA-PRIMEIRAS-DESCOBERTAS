/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Home, 
  Library, 
  Package, 
  DollarSign, 
  Image as ImageIcon,
  CheckCircle2,
  Bell,
  Search,
  PlusCircle,
  Menu,
  X,
  ClipboardList,
  Printer,
  Trash2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Teacher, Announcement, DirectiveMember, FinancialRecord, User, Class } from './types';
import FinanceView from './components/FinanceView';
import LibraryView from './components/LibraryView';
import GradesView from './components/GradesView';
import CarneView from './components/CarneView';
import EADPortal from './components/EADPortal';
import LoginView from './components/LoginView';
import SubjectsView from './components/SubjectsView';
import AttendanceView from './components/AttendanceView';
import TeachersView from './components/TeachersView';
import CommunicationView from './components/CommunicationView';
import StudentsView from './components/StudentsView';
import ClassesView from './components/ClassesView';
import InventoryView from './components/InventoryView';
import PhotosView from './components/PhotosView';
import DirectiveView from './components/DirectiveView';
import SettingsView from './components/SettingsView';
import { supabase } from './lib/supabase';

// Theme Colors
const colors = {
  primary: '#4FC3F7',
  primaryBorder: '#0288D1',
  secondary: '#FF8A65',
  secondaryBorder: '#D84315',
  success: '#81C784',
  successBorder: '#388E3C',
  warning: '#FFF176',
  warningBorder: '#FBC02D',
  accent: '#FF5252',
  accentBorder: '#D50000',
  bg: '#E1F5FE',
  white: '#FFFFFF',
};

type View = 'dashboard' | 'students' | 'classes' | 'subjects' | 'attendance' | 'teachers' | 'grades' | 'communication' | 'library' | 'financial' | 'carne' | 'ead' | 'inventory' | 'photos' | 'directive' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'Escola Primeiras Descobertas (EPD)',
    address: 'Rua das Descobertas, 123',
    cnpj: '00.000.000/0001-00',
    phone: '(11) 98765-4321',
    email: 'contato@escolapreimeiras.com.br',
    director: 'Prof. Carlos Alberto',
    logoUrl: '/logo.png',
    primaryColor: '#4FC3F7',
    passingGrade: 7.0,
    contractTemplate: 'Declaramos para os devidos fins que o(a) aluno(a) acima identificado(a) encontra-se devidamente matriculado(a) nesta instituição de ensino para o ano letivo corrente.'
  });
  const [directiveMembers, setDirectiveMembers] = useState<DirectiveMember[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: studentData } = await supabase.from('students').select('*');
      if (studentData) setStudents(studentData as any);

      const { data: teacherData } = await supabase.from('teachers').select('*');
      if (teacherData) {
        setTeachers(teacherData.map(t => ({
          ...t,
          classes: t.classes || [],
          photoUrl: t.photo_url || t.photoUrl
        })) as any);
      }

      const { data: announcementData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (announcementData) setAnnouncements(announcementData as any);
      
      const { data: classesData } = await supabase.from('classes').select('*');
      if (classesData) setClasses(classesData as any);

      const { data: invData } = await supabase.from('inventory').select('*');
      if (invData) setInventory(invData as any);

      const { data: albumData } = await supabase.from('albums').select('*');
      if (albumData) setAlbums(albumData as any);

      const { data: finData } = await supabase.from('financial_records').select('*');
      if (finData) setFinancialRecords(finData as any);

      const { data: bookData } = await supabase.from('books').select('*');
      if (bookData) setLibraryBooks(bookData as any);

      const { data: dirData } = await supabase.from('directive').select('*');
      if (dirData) setDirectiveMembers(dirData as any);

      const { data: subData } = await supabase.from('subjects').select('*');
      if (subData) setSubjects(subData as any);

      const { data: schoolData } = await supabase.from('school_info').select('*').single();
      if (schoolData) {
        setSchoolInfo({
          ...schoolData,
          logoUrl: schoolData.logo_url || '/logo.png',
          primaryColor: schoolData.primary_color || '#4FC3F7',
          passingGrade: schoolData.passing_grade || 7.0,
          contractTemplate: schoolData.contract_template || '...'
        } as any);
      }
    }
    loadData();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: Home, color: '#4FC3F7', emoji: '🏠' },
    { id: 'students', label: 'Alunos', icon: Users, color: '#FF8A65', emoji: '🎒' },
    { id: 'classes', label: 'Turmas', icon: Users, color: '#4FC3F7', emoji: '🏫' },
    { id: 'subjects', label: 'Disciplinas', icon: BookOpen, color: '#BA68C8', emoji: '📚' },
    { id: 'attendance', label: 'Chamada', icon: ClipboardList, color: '#81C784', emoji: '📝' },
    { id: 'teachers', label: 'Professores', icon: GraduationCap, color: '#FFF176', emoji: '🍎' },
    { id: 'grades', label: 'Notas', icon: CheckCircle2, color: '#FF5252', emoji: '⭐' },
    { id: 'communication', label: 'Recados', icon: MessageSquare, color: '#FF8A65', emoji: '📌' },
    { id: 'library', label: 'Biblioteca', icon: Library, color: '#4FC3F7', emoji: '📚' },
    { id: 'financial', label: 'Financeiro', icon: DollarSign, color: '#FFF176', emoji: '💰' },
    { id: 'carne', label: 'Gerar Carnê', icon: Printer, color: '#FF8A65', emoji: '🎫' },
    { id: 'ead', label: 'EAD', icon: BookOpen, color: '#FF5252', emoji: '💻' },
    { id: 'inventory', label: 'Estoque', icon: Package, color: '#81C784', emoji: '📦' },
    { id: 'photos', label: 'Fotos', icon: ImageIcon, color: '#FF8A65', emoji: '🖼️' },
    { id: 'directive', label: 'Diretoria', icon: ShieldCheck, color: '#4FC3F7', emoji: '👔' },
    { id: 'settings', label: 'Configurações', icon: Settings, color: '#78909C', emoji: '⚙️' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'teacher') {
      return ['dashboard', 'attendance', 'grades', 'communication', 'library', 'photos', 'directive'].includes(item.id);
    }
    if (currentUser.role === 'student') {
      return ['dashboard', 'ead', 'grades', 'library', 'communication'].includes(item.id);
    }
    return false;
  });

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen flex text-gray-800 font-sans overflow-hidden print:block print:bg-white" style={{ backgroundColor: colors.bg }}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className="w-64 bg-white border-r-8 border-[#4FC3F7] shadow-xl flex flex-col z-20 print:hidden"
          >
            <div className="p-6 flex items-center gap-3 border-b-4 border-[#E1F5FE]">
              <div className="w-12 h-12 bg-[#4FC3F7] rounded-2xl flex items-center justify-center shadow-md border-b-4 border-[#0288D1]">
                <GraduationCap className="text-white w-7 h-7" />
              </div>
              <h1 className="font-black text-xl tracking-tight text-[#01579B]">EPD</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-3">
              <p className="text-[#0288D1] font-black uppercase text-[10px] tracking-widest mb-2 px-2">Menu Principal</p>
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 border-2 ${
                    currentView === item.id 
                    ? 'bg-[#E1F5FE] text-[#0277BD] border-[#4FC3F7] font-black shadow-sm' 
                    : 'hover:bg-gray-50 text-[#78909C] border-transparent'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t-4 border-[#E1F5FE]">
              <div className="p-4 bg-[#FFF9C4] rounded-2xl border-2 border-[#FBC02D]">
                <p className="text-[10px] font-black text-[#F57F17] mb-2 uppercase">Capacidade</p>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#81C784] w-[85%]"></div>
                </div>
                <p className="text-[9px] text-[#F57F17] mt-1 text-center font-bold">185 / 220 Alunos</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible">
        {/* Header */}
        <header className="h-20 bg-[#4FC3F7] px-8 flex items-center justify-between border-b-8 border-[#0288D1] shrink-0 shadow-lg print:hidden">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              <input 
                type="text" 
                placeholder="Procurar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/20 border-2 border-white/30 rounded-full w-64 focus:bg-white focus:text-gray-800 transition-all outline-none placeholder:text-white/60 text-white font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 text-white">
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentView('communication')}
                className="bg-[#81C784] hover:bg-white/10 text-white font-black py-2 px-4 rounded-2xl border-b-4 border-[#388E3C] text-sm flex items-center gap-2 hover:scale-105 transition-all"
              >
                <span>📢 Mural</span>
              </button>
              <button 
                onClick={() => setCurrentView('financial')}
                className="bg-[#FFF176] text-[#5D4037] font-black py-2 px-4 rounded-2xl border-b-4 border-[#FBC02D] text-sm flex items-center gap-2 hover:scale-105 transition-all"
              >
                <span>💰 Caixa</span>
              </button>
            </div>
            <div className="flex items-center gap-3 bg-[#0288D1] p-2 pr-4 rounded-full border-2 border-white/20">
              <div className="w-10 h-10 bg-white rounded-full border-2 border-[#FFF176] overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Profile" />
              </div>
              <div>
                <p className="text-xs font-black leading-none italic uppercase underline">{currentUser.role}</p>
                <p className="font-black text-sm">{currentUser.name}</p>
              </div>
              <button 
                onClick={() => setCurrentUser(null)}
                className="ml-4 p-2 bg-white/10 hover:bg-red-500/50 rounded-xl text-white transition-all"
                title="Sair"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 print:p-0 print:overflow-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <Dashboard students={students} announcements={announcements} financialRecords={financialRecords} userRole={currentUser.role} />}
              {currentView === 'subjects' && <SubjectsView subjects={subjects} setSubjects={setSubjects} />}
              {currentView === 'attendance' && <AttendanceView students={students} classes={classes} />}
              {currentView === 'teachers' && <TeachersView teachers={teachers} setTeachers={setTeachers} subjects={subjects} />}
              {currentView === 'communication' && <CommunicationView announcements={announcements} setAnnouncements={setAnnouncements} />}
              {currentView === 'grades' && <GradesView currentUser={currentUser} />}

              {currentView === 'students' && <StudentsView students={students} setStudents={setStudents} schoolInfo={schoolInfo} searchQuery={searchQuery} classes={classes} occurrences={occurrences} setOccurrences={setOccurrences} />}
              {currentView === 'classes' && <ClassesView classes={classes} setClasses={setClasses} students={students} />}
              {currentView === 'library' && <LibraryView books={libraryBooks} setBooks={setLibraryBooks} />}
              {currentView === 'financial' && <FinanceView records={financialRecords} setRecords={setFinancialRecords} students={students} teachers={teachers} classes={classes} />}
              {currentView === 'carne' && <CarneView students={students} financialRecords={financialRecords} schoolInfo={schoolInfo} />}
              {currentView === 'ead' && (
                <EADPortal 
                  studentRecords={financialRecords.filter(r => r.studentId === currentUser.studentId)} 
                />
              )}
              {currentView === 'inventory' && <InventoryView items={inventory} setItems={setInventory} />}
              {currentView === 'photos' && <PhotosView albums={albums} setAlbums={setAlbums} />}
              {currentView === 'directive' && <DirectiveView members={directiveMembers} setMembers={setDirectiveMembers} />}
              {currentView === 'settings' && <SettingsView info={schoolInfo} setInfo={setSchoolInfo} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Dashboard({ students, announcements, financialRecords, userRole }: { students: Student[], announcements: Announcement[], financialRecords: FinancialRecord[], userRole: string }) {
  const pendingPayments = financialRecords.filter(r => r.status === 'pending').length;
  const overduePayments = financialRecords.filter(r => r.status === 'overdue').length;
  
  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <h2 className="text-5xl font-black text-[#01579B]">Painel de Controle 🚀</h2>
          <p className="text-[#546E7A] font-bold text-lg mt-1 italic">Gestão completa da Escola Primeiras Descobertas!</p>
        </div>
        <div className="flex gap-4">
          <div className="hidden md:flex flex-col items-end justify-center px-6 py-2 bg-white rounded-3xl border-2 border-[#E1F5FE] shadow-sm">
            <p className="text-[10px] font-black text-[#4FC3F7] uppercase">Acesso: {userRole}</p>
            <p className="font-black text-[#0277BD]">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Only for Admin/Teacher */}
      {userRole !== 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Exploradores', count: students.length, color: '#4FC3F7', borderColor: '#0288D1', icon: '🎒', desc: 'Pequenos matriculados' },
            { label: 'Frequência', count: '96%', color: '#81C784', borderColor: '#388E3C', icon: '✅', desc: 'Média mensal' },
            { label: 'Pendências', count: pendingPayments + overduePayments, color: '#FFF176', borderColor: '#FBC02D', icon: '💰', desc: 'Mensalidades em aberto' },
            { label: 'Avisos', count: announcements.length, color: '#FF8A65', borderColor: '#D84315', icon: '📌', desc: 'Recados no mural' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="rounded-[40px] border-4 p-8 shadow-xl flex flex-col gap-2 relative overflow-hidden group transition-all hover:scale-105 hover:rotate-1"
              style={{ backgroundColor: stat.color, borderColor: stat.borderColor }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-5xl drop-shadow-md">{stat.icon}</span>
                <p className="text-white font-black text-[10px] uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{stat.label}</p>
              </div>
              <p className="text-4xl font-black text-white mt-4 drop-shadow-sm relative z-10">{stat.count}</p>
              <p className="text-white/80 font-bold text-xs relative z-10">{stat.desc}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Announcements */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border-4 border-[#FF8A65] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8A65]/5 -translate-y-32 translate-x-32 rounded-full" />
            <div className="flex items-center justify-between mb-8 border-b-4 border-dashed border-[#FF8A65] pb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">📌</span>
                <h3 className="text-3xl font-black text-[#D84315]">Mural de Avisos</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.slice(0, 4).map(ann => (
                <div key={ann.id} className="p-6 rounded-[32px] bg-[#FBE9E7] border-l-8 border-[#FF5722] shadow-sm flex flex-col hover:bg-[#FFCCBC] transition-colors cursor-pointer">
                  <h4 className="font-black text-[#D84315] text-lg mb-2 capitalize">{ann.title}</h4>
                  <p className="text-sm text-[#BF360C] font-medium leading-relaxed flex-1">{ann.content}</p>
                  <p className="text-[10px] text-[#FF5722] mt-4 font-black uppercase tracking-widest bg-white/50 self-start px-3 py-1 rounded-full">{ann.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Access or Birthday */}
        <div className="space-y-8">
           <div className="bg-[#4FC3F7] p-8 rounded-[48px] border-4 border-[#0288D1] shadow-xl text-white relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 text-white/30 animate-pulse" />
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">🍰 Aniversariantes</h3>
              <div className="space-y-4">
                {students.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center gap-4 bg-white/20 p-4 rounded-3xl border-2 border-white/30">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">🎈</div>
                    <div>
                      <p className="font-black text-sm">{s.name}</p>
                      <p className="text-[10px] font-bold opacity-70 italic">{s.turma}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
