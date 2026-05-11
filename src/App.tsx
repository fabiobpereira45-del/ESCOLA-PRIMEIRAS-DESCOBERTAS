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
import { Student, Teacher, Announcement, DirectiveMember, FinancialRecord } from './types';
import FinanceView from './components/FinanceView';
import LibraryView from './components/LibraryView';
import GradesView from './components/GradesView';
import CarneView from './components/CarneView';
import EADPortal from './components/EADPortal';
import { jsPDF } from 'jspdf';
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

type View = 'dashboard' | 'students' | 'teachers' | 'grades' | 'communication' | 'library' | 'financial' | 'carne' | 'ead' | 'inventory' | 'photos' | 'attendance' | 'classes' | 'directive' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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
  const [directiveMembers, setDirectiveMembers] = useState<DirectiveMember[]>([
    { id: 'd1', name: 'Dr. Roberto', role: 'Diretor Geral', email: 'roberto@escola.com' },
    { id: 'd2', name: 'Dra. Silvana', role: 'Diretora Acadêmica', email: 'silvana@escola.com' },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [classes, setClasses] = useState([
    { id: '1', name: 'G1', teacher: 'Prof. Márcia', color: '#FF8A65', border: '#D84315', icon: '🐣' },
    { id: '2', name: 'G2', teacher: 'Prof. Ricardo', color: '#4FC3F7', border: '#0288D1', icon: '🐥' },
    { id: '3', name: 'G3', teacher: 'Profª. Ana Clara', color: '#FFF176', border: '#FBC02D', icon: '🦁' },
    { id: '4', name: 'G4', teacher: 'Prof. João', color: '#81C784', border: '#388E3C', icon: '🐸' },
    { id: '5', name: 'G5', teacher: 'Profª. Bia', color: '#FF5252', border: '#D50000', icon: '🐞' },
    { id: '6', name: '1º Ano', teacher: 'Prof. Pedro', color: '#4FC3F7', border: '#0288D1', icon: '🦉' },
    { id: '7', name: '2º Ano', teacher: 'Profª. Sônia', color: '#FF8A65', border: '#D84315', icon: '🐘' },
    { id: '8', name: '3º Ano', teacher: 'Prof. Marcos', color: '#81C784', border: '#388E3C', icon: '🦖' },
    { id: '9', name: '4º Ano', teacher: 'Profª. Helô', color: '#FFF176', border: '#FBC02D', icon: '🦋' },
    { id: '10', name: '5º Ano', teacher: 'Prof. Lucca', color: '#FF5252', border: '#D50000', icon: '🦅' },
  ]);
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Giz Colorido', stock: 45, min: 20, unit: 'Caixas', icon: '🖍️' },
    { id: '2', name: 'Papel A4', stock: 12, min: 25, unit: 'Resmas', icon: '📄' },
    { id: '3', name: 'Lápis de Cor', stock: 120, min: 50, unit: 'Unidades', icon: '✏️' },
    { id: '4', name: 'Borracha', stock: 8, min: 15, unit: 'Unidades', icon: '🧼' },
  ]);
  const [albums, setAlbums] = useState([
    { id: '1', title: 'Festa da Primavera 🌸', count: 42, date: 'Setembro 2024', cover: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80' },
    { id: '2', title: 'Passeio ao Zoológico 🦁', count: 128, date: 'Agosto 2024', cover: 'https://images.unsplash.com/photo-1544367567-0f2fe5509f71?w=400&q=80' },
    { id: '3', title: 'Semana de Artes 🎨', count: 56, date: 'Julho 2024', cover: 'https://images.unsplash.com/photo-1513364235703-01308a0d4cbb?w=400&q=80' },
  ]);
  const [financialRecords, setFinancialRecords] = useState([
    { id: 'f1', studentId: '1', type: 'tuition', amount: 850.00, dueDate: '2024-10-10', status: 'paid' },
    { id: 'f2', studentId: '1', type: 'tuition', amount: 850.00, dueDate: '2024-11-10', status: 'pending' },
    { id: 'f3', studentId: '2', type: 'fee', amount: 150.00, dueDate: '2024-10-05', status: 'overdue' },
  ]);
  const [libraryBooks, setLibraryBooks] = useState([
    { id: 'b1', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', category: 'Infantil', available: true },
    { id: 'b2', title: 'Dom Casmurro', author: 'Machado de Assis', category: 'Literatura', available: false, loanedTo: 'Pedro Silva', dueDate: '2024-10-20' },
    { id: 'b3', title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', category: 'Fantasia', available: true },
  ]);

  useEffect(() => {
    async function loadData() {
      const { data: studentData } = await supabase.from('students').select('*');
      if (studentData) setStudents(studentData as any);

      const { data: teacherData } = await supabase.from('teachers').select('*');
      if (teacherData) setTeachers(teacherData as any);

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

      const { data: schoolData } = await supabase.from('school_info').select('*').single();
      if (schoolData) {
        setSchoolInfo({
          ...schoolData,
          logoUrl: schoolData.logo_url || schoolData.logoUrl || '/logo.png',
          primaryColor: schoolData.primary_color || schoolData.primaryColor || '#4FC3F7',
          passingGrade: schoolData.passing_grade || schoolData.passingGrade || 7.0,
          contractTemplate: schoolData.contract_template || schoolData.contractTemplate || ''
        } as any);
      }
    }
    loadData();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: Home, color: '#4FC3F7', emoji: '🏠' },
    { id: 'students', label: 'Alunos', icon: Users, color: '#FF8A65', emoji: '🎒' },
    { id: 'classes', label: 'Turmas', icon: Users, color: '#4FC3F7', emoji: '🏫' },
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
              {menuItems.map((item) => (
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
              <button className="bg-[#81C784] hover:bg-white/10 text-white font-black py-2 px-4 rounded-2xl border-b-4 border-[#388E3C] text-sm flex items-center gap-2">
                <span>📢 Mural</span>
              </button>
              <button className="bg-[#FFF176] text-[#5D4037] font-black py-2 px-4 rounded-2xl border-b-4 border-[#FBC02D] text-sm flex items-center gap-2">
                <span>💰 Caixa</span>
              </button>
            </div>
            <div className="flex items-center gap-3 bg-[#0288D1] p-2 pr-4 rounded-full border-2 border-white/20">
              <div className="w-10 h-10 bg-white rounded-full border-2 border-[#FFF176] overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Profile" />
              </div>
              <div>
                <p className="text-xs font-black leading-none italic uppercase underline">Coordenador</p>
                <p className="font-black text-sm">Prof. Carlos</p>
              </div>
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
              {currentView === 'dashboard' && <Dashboard students={students} announcements={announcements} financialRecords={financialRecords} />}
              {currentView === 'attendance' && <AttendanceView students={students} />}
              {currentView === 'teachers' && <TeachersView teachers={teachers} setTeachers={setTeachers} />}
              {currentView === 'communication' && <CommunicationView announcements={announcements} setAnnouncements={setAnnouncements} />}
              {currentView === 'grades' && <GradesView />}
              {currentView === 'students' && <StudentsView students={students} setStudents={setStudents} schoolInfo={schoolInfo} searchQuery={searchQuery} classes={classes} />}
              {currentView === 'classes' && <ClassesView classes={classes} setClasses={setClasses} students={students} />}
              {currentView === 'library' && <LibraryView books={libraryBooks} setBooks={setLibraryBooks} />}
              {currentView === 'financial' && <FinanceView records={financialRecords} setRecords={setFinancialRecords} />}
              {currentView === 'carne' && <CarneView students={students} financialRecords={financialRecords} schoolInfo={schoolInfo} />}
              {currentView === 'ead' && <EADPortal />}
              {currentView === 'inventory' && <InventoryView items={inventory} setItems={setInventory} />}
              {currentView === 'photos' && <PhotosView albums={albums} setAlbums={setAlbums} />}
              {currentView === 'directive' && <DirectiveView members={directiveMembers} setMembers={setDirectiveMembers} />}
              {currentView === 'settings' && <SettingsView info={schoolInfo} setInfo={setSchoolInfo} />}
              {/* Other views */}
              {false && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="p-8 bg-white rounded-3xl shadow-xl mb-4 transform rotate-3">
                    <Settings className="w-12 h-12 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-500">Módulo em construção</h3>
                  <p>Estamos preparando algo incrível para as crianças!</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Dashboard({ students, announcements, financialRecords }: { students: Student[], announcements: Announcement[], financialRecords: FinancialRecord[] }) {
  const pendingPayments = financialRecords.filter(r => r.status === 'pending').length;
  const overduePayments = financialRecords.filter(r => r.status === 'overdue').length;
  const totalAmount = financialRecords.reduce((acc, r) => acc + r.amount, 0);

  // Get birthdays in the current month
  const currentMonth = new Date().getMonth();
  const birthdayBoys = students.filter(s => {
    if (!s.birthDate) return false;
    const bDate = new Date(s.birthDate);
    return bDate.getMonth() === currentMonth;
  });

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <h2 className="text-5xl font-black text-[#01579B]">Resumo Escolar 🚀</h2>
          <p className="text-[#546E7A] font-bold text-lg mt-1 italic">Tudo sob controle na Escola Primeiras Descobertas!</p>
        </div>
        <div className="flex gap-4">
          <div className="hidden md:flex flex-col items-end justify-center px-6 py-2 bg-white rounded-3xl border-2 border-[#E1F5FE] shadow-sm">
            <p className="text-[10px] font-black text-[#4FC3F7] uppercase">Data de Hoje</p>
            <p className="font-black text-[#0277BD]">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <button className="bg-[#FF5252] text-white py-4 px-8 rounded-[32px] border-b-8 border-[#D50000] font-black flex items-center gap-3 shadow-xl transform hover:-translate-y-1 transition-all active:translate-y-1">
            <span className="text-2xl">💻</span> <span>AULA AO VIVO</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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
              <span className="bg-[#FF8A65] text-white px-4 py-1 rounded-full text-xs font-black uppercase">Importante</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.slice(0, 4).map(ann => (
                <div key={ann.id} className="p-6 rounded-[32px] bg-[#FBE9E7] border-l-8 border-[#FF5722] shadow-sm flex flex-col hover:bg-[#FFCCBC] transition-colors cursor-pointer">
                  <h4 className="font-black text-[#D84315] text-lg mb-2">{ann.title}</h4>
                  <p className="text-sm text-[#BF360C] font-medium leading-relaxed flex-1">{ann.content}</p>
                  <p className="text-[10px] text-[#FF5722] mt-4 font-black uppercase tracking-widest bg-white/50 self-start px-3 py-1 rounded-full">{ann.date}</p>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-4 bg-[#FF8A65] text-white rounded-3xl font-black text-lg border-b-8 border-[#D84315] shadow-lg hover:brightness-110 active:translate-y-1 transition-all">VER TODOS OS RECADOS</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-[#81C784] rounded-[40px] border-4 border-[#388E3C] p-8 shadow-2xl flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">💹</span>
                      <h3 className="text-2xl font-black text-white">Metas</h3>
                   </div>
                   <p className="text-white/90 font-bold mb-6">Estamos com 92% da meta de rematrículas atingida!</p>
                </div>
                <div className="space-y-2">
                   <div className="h-4 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[92%] shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                   </div>
                   <p className="text-right text-white font-black text-xs uppercase">Meta: 200 Alunos</p>
                </div>
             </div>
             
             <div className="bg-white rounded-[40px] border-4 border-[#4FC3F7] p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                   <span className="text-3xl">🎂</span>
                   <h3 className="text-2xl font-black text-[#01579B]">Aniversários</h3>
                </div>
                <div className="space-y-4">
                   {birthdayBoys.length > 0 ? (
                     birthdayBoys.slice(0, 3).map((s, i) => (
                       <div key={i} className="flex items-center gap-3 bg-[#E1F5FE] p-3 rounded-2xl border-b-2 border-[#4FC3F7]">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-inner">🎈</div>
                          <p className="font-black text-[#0277BD] text-xs">{s.name}</p>
                       </div>
                     ))
                   ) : (
                     <p className="text-gray-400 font-bold text-sm text-center py-4 italic">Nenhum aniversário este mês</p>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="bg-[#4FC3F7] rounded-[40px] border-4 border-[#0288D1] p-8 shadow-2xl flex flex-col gap-4 group hover:-rotate-1 transition-transform">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-inner text-5xl group-hover:scale-110 transition-transform">🦁</div>
            <div>
              <h3 className="text-3xl font-black text-white leading-tight">Turma Leãozinho</h3>
              <p className="text-white/80 font-bold mb-4 italic">Veja as fotos do lanche de hoje!</p>
              <button className="bg-white text-[#0288D1] px-6 py-3 rounded-2xl font-black text-sm border-b-4 border-gray-200 w-full hover:scale-105 active:scale-95 transition-all">VER ÁLBUM DO DIA</button>
            </div>
          </div>

          <div className="bg-[#FFF176] rounded-[40px] border-4 border-[#FBC02D] p-8 shadow-2xl">
             <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">🍎</span>
                <h3 className="text-2xl font-black text-[#5D4037]">Educadores</h3>
             </div>
             <div className="space-y-4">
                {['Profª. Márcia', 'Prof. Ricardo', 'Profª. Ana Clara'].map((t, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/50 p-3 rounded-2xl border-b-4 border-[#FBC02D] hover:bg-white transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-white rounded-full border-2 border-[#FBC02D] overflow-hidden flex items-center justify-center text-lg">👩‍🏫</div>
                    <div>
                      <p className="font-black text-[#8D6E63] text-sm leading-none">{t}</p>
                      <p className="text-[10px] text-[#A1887F] font-bold mt-1 uppercase">Presente</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-[#78909C] rounded-[40px] border-4 border-[#455A64] p-8 shadow-2xl text-white">
             <h3 className="text-xl font-black mb-4 flex items-center gap-2"><span>🛡️</span> Segurança</h3>
             <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold bg-black/10 p-3 rounded-xl">
                   <span>Backup Diário</span>
                   <span className="text-[#81C784]">CONCLUÍDO</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold bg-black/10 p-3 rounded-xl">
                   <span>Câmeras Online</span>
                   <span className="text-[#81C784]">ATIVO</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsView({ students, setStudents, schoolInfo, searchQuery, classes }: { students: Student[], setStudents: (s: Student[]) => void, schoolInfo: any, searchQuery: string, classes: any[] }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRegistering(false);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const defaultStudentState = { 
    name: '', age: '', class: '', guardian: '', 
    address: '', phone: '', additionalPhone: '', 
    medication: false, medicationDetails: '', 
    allergyMed: false, allergyMedDetails: '',
    allergyFood: false, allergyFoodDetails: '',
    neurodivergent: false, atipicidade: '', report: false,
    disability: false, disabilityDetails: '',
    surgery: false, surgeryDetails: '',
    gender: 'M' as 'M' | 'F',
    photoUrl: '',
    registrationNumber: ''
  };
  const [newStudent, setNewStudent] = useState(defaultStudentState);

  const handleRegister = async (e: any) => {
    e.preventDefault();
    const regNumber = newStudent.registrationNumber || `EPD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const studentData = { 
      name: newStudent.name,
      grade: 'Novo', 
      turma: newStudent.class,
      parent_name: newStudent.guardian,
      parent_contact: newStudent.phone,
      address: newStudent.address,
      additional_phone: newStudent.additionalPhone,
      photo_url: newStudent.photoUrl,
      registration_number: regNumber,
      // Saúde
      medication: newStudent.medication,
      medication_details: newStudent.medicationDetails,
      allergy_med: newStudent.allergyMed,
      allergy_med_details: newStudent.allergyMedDetails,
      allergy_food: newStudent.allergyFood,
      allergy_food_details: newStudent.allergyFoodDetails,
      neurodivergent: newStudent.neurodivergent,
      atipicidade: newStudent.atipicidade,
      has_report: newStudent.report,
      disability: newStudent.disability,
      disability_details: newStudent.disabilityDetails,
      surgery: newStudent.surgery,
      surgery_details: newStudent.surgeryDetails,
      gender: newStudent.gender,
      age: parseInt(newStudent.age as string) || 0
    };
    
    if (editingId) {
      const { error } = await supabase.from('students').update(studentData).eq('id', editingId);
      if (!error) {
        setStudents(students.map(s => s.id === editingId ? { ...s, ...studentData } as any : s));
      } else {
        console.error('Update error:', error);
        alert('Erro ao atualizar: ' + error.message);
      }
    } else {
      const { data, error } = await supabase.from('students').insert(studentData).select();
      if (!error && data) {
        setStudents([...students, data[0] as any]);
      } else {
        console.error('Insert error:', error);
        alert('Erro ao matricular: ' + error.message);
      }
    }
    
    setIsRegistering(false);
    setEditingId(null);
    setNewStudent(defaultStudentState);
  };

  const handleEdit = (student: any) => {
    setNewStudent({
      ...defaultStudentState,
      name: student.name || '',
      age: student.age?.toString() || '',
      class: student.turma || '',
      guardian: student.parent_name || student.parentName || '',
      phone: student.parent_contact || student.parentContact || '',
      address: student.address || '',
      additionalPhone: student.additional_phone || student.additionalPhone || '',
      medication: student.medication || false,
      medicationDetails: student.medication_details || '',
      allergyMed: student.allergy_med || false,
      allergyMedDetails: student.allergy_med_details || '',
      allergyFood: student.allergy_food || false,
      allergyFoodDetails: student.allergy_food_details || '',
      neurodivergent: student.neurodivergent || false,
      atipicidade: student.atipicidade || '',
      report: student.has_report || student.report || false,
      disability: student.disability || false,
      disabilityDetails: student.disability_details || '',
      surgery: student.surgery || false,
      surgeryDetails: student.surgery_details || '',
      gender: (student.gender as 'M' | 'F') || 'M',
      photoUrl: student.photo_url || student.photoUrl || '',
      registrationNumber: student.registration_number || student.registrationNumber || ''
    });
    setEditingId(student.id);
    setIsRegistering(true);
  };

  const [isUploading, setIsUploading] = useState(false);
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('students')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('students')
        .getPublicUrl(filePath);

      setNewStudent(prev => ({ ...prev, photoUrl: publicUrl }));
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) {
      setStudents(students.filter(s => s.id !== id));
    }
    setDeletingId(null);
  };

  const generatePDF = async (student: Student) => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');
    
    // Header background
    doc.setFillColor(schoolInfo.primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    
    let textX = 105;
    let textAlign: "center" | "left" = "center";

    // Logo with aspect ratio
    if (schoolInfo.logoUrl) {
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = schoolInfo.logoUrl;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        if (logoImg.complete && logoImg.naturalWidth !== 0) {
          const imgProps = (doc as any).getImageProperties(logoImg);
          const ratio = imgProps.width / imgProps.height;
          const h = 35;
          const w = h * ratio;
          doc.addImage(logoImg, 'PNG', 15, 5, w, h);
          textX = 20 + w + 10; // Margin + logo + padding
          textAlign = "left";
        }
      } catch (e) {
        console.warn("Could not load logo for PDF", e);
      }
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${schoolInfo.address}`, textX, 18, { align: textAlign });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tel: ${schoolInfo.phone} | CNPJ: ${schoolInfo.cnpj}`, textX, 26, { align: textAlign });
    doc.text(`Email: ${schoolInfo.email}`, textX, 34, { align: textAlign });

    // Title
    doc.setTextColor(1, 87, 155); // Dark blue
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROVANTE DE MATRÍCULA', 105, 60, { align: 'center' });
    
    // Decorative Line
    doc.setDrawColor(79, 195, 247);
    doc.setLineWidth(1);
    doc.line(40, 65, 170, 65);

    // Body
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const startY = 85;
    const spacing = 12;

    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO ALUNO', 20, startY - 10);
    doc.setLineWidth(0.5);
    doc.line(20, startY - 7, 190, startY - 7);

    doc.setFont('helvetica', 'bold'); doc.text('Nome Completo:', 20, startY);
    doc.setFont('helvetica', 'normal'); doc.text(student.name, 60, startY);

    doc.setFont('helvetica', 'bold'); doc.text('Nº Matrícula:', 20, startY + spacing);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(216, 67, 21); // Orange accent
    doc.text((student as any).registration_number || (student as any).registrationNumber || 'GERANDO...', 60, startY + spacing);
    doc.setTextColor(60, 60, 60);

    doc.setFont('helvetica', 'bold'); doc.text('Série / Turma:', 20, startY + spacing * 2);
    doc.setFont('helvetica', 'normal'); doc.text(`${student.grade} • ${student.turma}`, 60, startY + spacing * 2);

    doc.setFont('helvetica', 'bold'); doc.text('Responsável:', 20, startY + spacing * 3);
    doc.setFont('helvetica', 'normal'); doc.text(student.parent_name || (student as any).parentName || '---', 60, startY + spacing * 3);

    doc.setFont('helvetica', 'bold'); doc.text('Contato:', 20, startY + spacing * 4);
    doc.setFont('helvetica', 'normal'); doc.text(student.parent_contact || (student as any).parentContact || '---', 60, startY + spacing * 4);

    // Declaration
    const text = schoolInfo.contractTemplate;
    const splitText = doc.splitTextToSize(text, 170);
    doc.text(splitText, 20, startY + spacing * 5);

    // Date
    doc.text(`Emitido em: ${today}`, 20, 200);

    // Signature
    doc.line(60, 240, 150, 240);
    doc.setFontSize(10);
    doc.text(schoolInfo.director, 105, 245, { align: 'center' });
    doc.text('Diretoria Geral', 105, 250, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento gerado eletronicamente pelo Sistema EPD.', 105, 285, { align: 'center' });

    doc.save(`Comprovante_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  const openNewRegistration = () => {
    setEditingId(null);
    setNewStudent(defaultStudentState);
    setIsRegistering(true);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Exploradores 🎒</h2>
          <p className="text-[#546E7A] font-bold">Nossa turminha de aventureiros!</p>
        </div>
        <button 
          onClick={openNewRegistration}
          className="px-8 py-4 bg-[#FF8A65] text-white rounded-[32px] font-black border-b-8 border-[#D84315] shadow-xl flex items-center gap-3 transform hover:scale-105 transition-all"
        >
          <PlusCircle className="w-6 h-6" />
          <span>MATRICULAR ALUNO</span>
        </button>
      </div>

      <AnimatePresence>
        {deletingId && (
          <ConfirmationModal 
            title="Remover Amiguinho?"
            message="Tem certeza que deseja remover este pequeno aventureiro da turma?"
            confirmText="SIM, REMOVER"
            cancelText="NÃO, MANTER"
            onConfirm={() => handleDelete(deletingId)}
            onClose={() => setDeletingId(null)}
            color="#FF5252"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRegistering && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[56px] border-8 border-[#FF8A65] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A65]/10 rounded-full translate-x-12 -translate-y-12" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 bg-[#FFF176] rounded-3xl border-4 border-[#FBC02D] flex items-center justify-center text-4xl shadow-inner">🧸</div>
                   <h3 className="text-3xl font-black text-[#D84315] uppercase italic">{editingId ? 'Editar Aluno' : 'Nova Matrícula'}</h3>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Nome do Pequeno</label>
                    <input 
                      required
                      value={newStudent.name}
                      onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                      className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#FF8A65] outline-none transition-all"
                      placeholder="Ex: Joãozinho Silva"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Idade</label>
                      <input 
                        required
                        type="number"
                        value={newStudent.age}
                        onChange={e => setNewStudent({...newStudent, age: e.target.value})}
                        className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#FF8A65] outline-none transition-all"
                        placeholder="7"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Turma</label>
                      <select 
                        required
                        value={newStudent.class}
                        onChange={e => setNewStudent({...newStudent, class: e.target.value})}
                        className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#FF8A65] outline-none transition-all appearance-none"
                      >
                        <option value="">Selecione uma turma...</option>
                        {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Responsável</label>
                    <input 
                      required
                      value={newStudent.guardian}
                      onChange={e => setNewStudent({...newStudent, guardian: e.target.value})}
                      className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#FF8A65] outline-none transition-all"
                      placeholder="Nome do Papai ou Mamãe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Endereço</label>
                    <input 
                      required
                      value={newStudent.address}
                      onChange={e => setNewStudent({...newStudent, address: e.target.value})}
                      className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#FF8A65] outline-none transition-all"
                      placeholder="Rua, Número, Bairro"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Telefone</label>
                      <input 
                        required
                        value={newStudent.phone}
                        onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                        className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#FF8A65] outline-none transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Tel. Adicional</label>
                      <input 
                        value={newStudent.additionalPhone}
                        onChange={e => setNewStudent({...newStudent, additionalPhone: e.target.value})}
                        className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#FF8A65] outline-none transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Gênero</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setNewStudent({...newStudent, gender: 'M'})}
                          className={`flex-1 py-3 rounded-2xl font-black border-4 transition-all ${newStudent.gender === 'M' ? 'bg-[#E1F5FE] border-[#4FC3F7] text-[#0288D1]' : 'bg-gray-50 border-transparent text-gray-400'}`}
                        >
                          👦 MENINO
                        </button>
                        <button 
                          type="button"
                          onClick={() => setNewStudent({...newStudent, gender: 'F'})}
                          className={`flex-1 py-3 rounded-2xl font-black border-4 transition-all ${newStudent.gender === 'F' ? 'bg-[#FCE4EC] border-[#F06292] text-[#C2185B]' : 'bg-gray-50 border-transparent text-gray-400'}`}
                        >
                          👧 MENINA
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-[#D84315] uppercase tracking-widest ml-1">Foto do Pequeno</label>
                      <div className="flex gap-4 items-center bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] p-4">
                        <div className="w-16 h-16 bg-white rounded-2xl border-4 border-[#FF8A65] flex items-center justify-center overflow-hidden shadow-sm">
                          {newStudent.photoUrl ? (
                            <img src={newStudent.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">📸</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                          />
                          <label 
                            htmlFor="photo-upload"
                            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-[#FF8A65] text-white hover:brightness-95 border-b-4 border-[#D84315]'}`}
                          >
                            {isUploading ? 'ENVIANDO...' : 'UPLOAD DA FOTO'}
                          </label>
                          <p className="text-[10px] font-bold text-gray-400 mt-2 ml-1">Tamanho máx: 2MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saúde e Cuidados */}
                  <div className="pt-8 pb-4 border-t-4 border-dashed border-[#E1F5FE]">
                    <h4 className="text-2xl font-black text-[#01579B] flex items-center gap-3">
                      <span className="bg-[#E1F5FE] p-2 rounded-xl text-lg">🩺</span> Saúde e Cuidados
                    </h4>
                    <p className="text-gray-400 font-bold text-xs mt-1 ml-12 uppercase tracking-tighter">Informações importantes para a segurança do aluno</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                    <div className="bg-[#FFF8F1] p-6 rounded-[40px] border-4 border-[#FFE0B2] space-y-4 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer font-black text-[#E65100] uppercase text-xs">
                        <input type="checkbox" checked={newStudent.medication} onChange={e => setNewStudent({...newStudent, medication: e.target.checked})} className="w-6 h-6 rounded-lg accent-[#FB8C00]" />
                        Medicamento Contínuo?
                      </label>
                      {newStudent.medication && (
                        <input required value={newStudent.medicationDetails} onChange={e => setNewStudent({...newStudent, medicationDetails: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-[#FFE0B2] rounded-xl font-bold text-sm outline-none focus:border-[#FB8C00]" placeholder="Qual e dosagem?" />
                      )}
                    </div>

                    <div className="bg-[#F3E5F5] p-6 rounded-[40px] border-4 border-[#E1BEE7] space-y-4 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer font-black text-[#4A148C] uppercase text-xs">
                        <input type="checkbox" checked={newStudent.neurodivergent} onChange={e => setNewStudent({...newStudent, neurodivergent: e.target.checked})} className="w-6 h-6 rounded-lg accent-[#8E24AA]" />
                        Neurodivergente?
                      </label>
                      {newStudent.neurodivergent && (
                        <div className="space-y-3">
                          <select required value={newStudent.atipicidade} onChange={e => setNewStudent({...newStudent, atipicidade: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-[#E1BEE7] rounded-xl font-bold text-sm outline-none focus:border-[#8E24AA]">
                            <option value="">Qual a atipicidade?</option>
                            <option value="TEA">TEA (Autismo)</option>
                            <option value="TOD">TOD (Opositor)</option>
                            <option value="TDAH">TDAH</option>
                            <option value="Outro">Outro</option>
                          </select>
                          <label className="flex items-center gap-2 text-[10px] font-black text-[#8E24AA] ml-1">
                            <input type="checkbox" checked={newStudent.report} onChange={e => setNewStudent({...newStudent, report: e.target.checked})} className="w-4 h-4 accent-[#8E24AA]" />
                            POSSUI LAUDO?
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#E8F5E9] p-6 rounded-[40px] border-4 border-[#C8E6C9] space-y-4 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer font-black text-[#1B5E20] uppercase text-xs">
                        <input type="checkbox" checked={newStudent.allergyMed} onChange={e => setNewStudent({...newStudent, allergyMed: e.target.checked})} className="w-6 h-6 rounded-lg accent-[#43A047]" />
                        Alergia a Medicamento?
                      </label>
                      {newStudent.allergyMed && (
                        <input required value={newStudent.allergyMedDetails} onChange={e => setNewStudent({...newStudent, allergyMedDetails: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-[#C8E6C9] rounded-xl font-bold text-sm outline-none focus:border-[#43A047]" placeholder="Quais?" />
                      )}
                    </div>

                    <div className="bg-[#FFFDE7] p-6 rounded-[40px] border-4 border-[#FFF59D] space-y-4 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer font-black text-[#F57F17] uppercase text-xs">
                        <input type="checkbox" checked={newStudent.allergyFood} onChange={e => setNewStudent({...newStudent, allergyFood: e.target.checked})} className="w-6 h-6 rounded-lg accent-[#FBC02D]" />
                        Alergia Alimentar?
                      </label>
                      {newStudent.allergyFood && (
                        <input required value={newStudent.allergyFoodDetails} onChange={e => setNewStudent({...newStudent, allergyFoodDetails: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-[#FFF59D] rounded-xl font-bold text-sm outline-none focus:border-[#FBC02D]" placeholder="Quais?" />
                      )}
                    </div>

                    <div className="bg-[#E0F7FA] p-6 rounded-[40px] border-4 border-[#B2EBF2] space-y-4 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer font-black text-[#006064] uppercase text-xs">
                        <input type="checkbox" checked={newStudent.disability} onChange={e => setNewStudent({...newStudent, disability: e.target.checked})} className="w-6 h-6 rounded-lg accent-[#00BCD4]" />
                        Porta Deficiência?
                      </label>
                      {newStudent.disability && (
                        <input required value={newStudent.disabilityDetails} onChange={e => setNewStudent({...newStudent, disabilityDetails: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-[#B2EBF2] rounded-xl font-bold text-sm outline-none focus:border-[#00BCD4]" placeholder="Qual?" />
                      )}
                    </div>

                    <div className="bg-[#FCE4EC] p-6 rounded-[40px] border-4 border-[#F8BBD0] space-y-4 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer font-black text-[#880E4F] uppercase text-xs">
                        <input type="checkbox" checked={newStudent.surgery} onChange={e => setNewStudent({...newStudent, surgery: e.target.checked})} className="w-6 h-6 rounded-lg accent-[#D81B60]" />
                        Fez alguma Cirurgia?
                      </label>
                      {newStudent.surgery && (
                        <input required value={newStudent.surgeryDetails} onChange={e => setNewStudent({...newStudent, surgeryDetails: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-[#F8BBD0] rounded-xl font-bold text-sm outline-none focus:border-[#D81B60]" placeholder="Qual e quando?" />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsRegistering(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[24px] font-black border-b-6 border-gray-300 active:translate-y-1 transition-all"
                    >
                      CANCELAR
                    </button>
                    <button 
                      type="submit"
                      className="flex-3 py-4 bg-[#81C784] text-white rounded-[24px] font-black border-b-6 border-[#388E3C] active:translate-y-1 transition-all shadow-lg"
                    >
                      FINALIZAR MATRÍCULA 🎉
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {students
          .filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (s.turma && s.turma.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map(s => (
          <div key={s.id} className="relative group">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[56px] -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-all duration-300 bg-[#E1F5FE]" />
            <div className="bg-white p-8 rounded-[56px] border-4 border-[#4FC3F7] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
               <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                 <button 
                   onClick={(e) => { e.stopPropagation(); handleEdit(s); }} 
                   className="w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-lg border-b-4 border-[#FBC02D] shadow-sm hover:scale-110 transition-transform cursor-pointer"
                 >
                   ✏️
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setDeletingId(s.id); }} 
                   className="w-10 h-10 bg-[#FF5252] rounded-full flex items-center justify-center text-white border-b-4 border-[#D50000] shadow-sm hover:scale-110 transition-transform cursor-pointer"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
               </div>
                <div className={`w-28 h-28 bg-[#F5FBFF] rounded-[40px] border-4 border-[#E1F5FE] overflow-hidden mb-6 shadow-inner relative group-hover:rotate-6 transition-transform flex items-center justify-center text-5xl ${s.gender === 'F' ? 'bg-[#FFF5F8]' : ''}`}>
                   {(s.photoUrl || (s as any).photo_url) ? (
                     <img src={s.photoUrl || (s as any).photo_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     s.gender === 'F' ? '👧' : '👦'
                   )}
                </div>
               <h3 className="text-2xl font-black text-[#5D4037] mb-1">{s.name}</h3>
               <span className="bg-[#4FC3F7] px-4 py-1 rounded-full text-white font-black text-xs border-2 border-[#0288D1] mb-6 uppercase tracking-tighter">
                  {s.grade} • {s.turma}
               </span>
               
               <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t-4 border-dashed border-gray-100 mb-6">
                  <div className="bg-[#FFF9C4] p-3 rounded-2xl border-b-4 border-[#FBC02D]">
                    <p className="text-[10px] font-black text-[#F57F17] opacity-60 uppercase mb-1">Presença</p>
                    <p className="text-lg font-black text-[#F57F17]">98%</p>
                  </div>
                  <div className="bg-[#E8F5E9] p-3 rounded-2xl border-b-4 border-[#388E3C]">
                    <p className="text-[10px] font-black text-[#2E7D32] opacity-60 uppercase mb-1">Média</p>
                    <p className="text-lg font-black text-[#2E7D32]">8.5</p>
                  </div>
               </div>

               <div className="w-full space-y-3">
                 <button 
                   onClick={() => generatePDF(s)}
                   className="w-full py-4 bg-[#E1F5FE] text-[#0288D1] rounded-[24px] font-black text-sm border-b-6 border-[#4FC3F7] flex items-center justify-center gap-2 hover:brightness-95 active:translate-y-1 transition-all"
                 >
                   <Printer className="w-4 h-4" /> COMPROVANTE
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassesView({ classes, setClasses, students }: { classes: any[], setClasses: (c: any[]) => void, students: Student[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSave = async (data: any) => {
    const classData = { 
      name: data.name,
      teacher: data.teacher,
      icon: data.icon,
      color: data.color,
      border_color: data.border || data.border_color
    };
    if (editingClass) {
      const { error } = await supabase.from('classes').update(classData).eq('id', editingClass.id);
      if (!error) {
        setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...classData } : c));
      }
    } else {
      const { data: newData, error } = await supabase.from('classes').insert(classData).select();
      if (!error && newData) {
        setClasses([...classes, newData[0]]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (!error) {
      setClasses(classes.filter(c => c.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Nossas Turmas 🏫</h2>
          <p className="text-[#546E7A] font-bold">Gerencie as salas e turmas da escola</p>
        </div>
        <button 
          onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
          className="px-8 py-4 bg-[#4FC3F7] text-white rounded-[32px] font-black border-b-8 border-[#0288D1] shadow-xl flex items-center gap-3 transform hover:scale-105 transition-all"
        >
          <PlusCircle className="w-6 h-6" />
          <span>NOVA TURMA</span>
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <MagicFormModal 
            title={editingClass ? "Editar Turma" : "Nova Turma"}
            icon="🏫"
            fields={[
              { key: 'name', label: 'Nome da Turma', placeholder: 'Ex: G3 - Matutino' },
              { key: 'teacher', label: 'Professor(a) Responsável', placeholder: 'Ex: Profª. Márcia' },
              { key: 'icon', label: 'Ícone (Emoji)', placeholder: 'Ex: 🦁' },
              { key: 'color', label: 'Cor de Fundo', type: 'color' },
              { key: 'border', label: 'Cor da Borda', type: 'color' }
            ]}
            initialData={editingClass}
            onSubmit={handleSave}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingId && (
          <ConfirmationModal 
            title="Excluir Turma?"
            message="Tem certeza que deseja remover esta turma? Os alunos continuarão no sistema."
            confirmText="SIM, EXCLUIR"
            cancelText="CANCELAR"
            onConfirm={() => handleDelete(deletingId)}
            onClose={() => setDeletingId(null)}
            color="#FF5252"
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map(c => {
          const studentCount = students.filter(s => s.turma === c.name).length;
          return (
            <div key={c.id} className="bg-white p-8 rounded-[48px] shadow-2xl border-l-8 border-b-8 relative group hover:scale-[1.02] transition-transform" style={{ borderColor: c.border_color || c.border || '#0288D1' }}>
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingClass(c); setIsModalOpen(true); }} className="w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-lg border-b-4 border-[#FBC02D] shadow-sm hover:scale-110 transition-transform cursor-pointer">✏️</button>
                <button onClick={() => setDeletingId(c.id)} className="w-10 h-10 bg-[#FF5252] rounded-full flex items-center justify-center text-white border-b-4 border-[#D50000] shadow-sm hover:scale-110 transition-transform cursor-pointer"><Trash2 className="w-5 h-5" /></button>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner" style={{ backgroundColor: c.color || '#E1F5FE' }}>
                  {c.icon || '🏫'}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[#5D4037]">{c.name}</h4>
                  <p className="text-[#0288D1] font-black text-sm uppercase tracking-tighter">{c.teacher || 'Sem professor'}</p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-100">
                <div className="flex items-center gap-2">
                   <Users className="w-5 h-5 text-gray-400" />
                   <span className="font-black text-gray-600 uppercase text-xs">{studentCount} ALUNOS MATRICULADOS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttendanceView({ students }: { students: Student[] }) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const today = new Date().toLocaleDateString('pt-BR');

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveAttendance = () => {
    alert('Chamada salva com muito carinho! ✨');
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Hora da Chamada! 📝</h2>
          <p className="text-[#546E7A] font-bold">Quem veio brincar na escola hoje?</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-[32px] border-4 border-[#E1F5FE] shadow-lg flex items-center gap-4">
           <span className="text-3xl">📅</span>
           <div className="text-left">
             <p className="text-[10px] font-black text-[#78909C] uppercase tracking-widest">Data de Hoje</p>
             <p className="font-black text-[#01579B] text-xl">{today}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[56px] border-8 border-[#81C784] shadow-2xl overflow-hidden">
        <div className="p-8 bg-[#E8F5E9] border-b-4 border-[#81C784] flex items-center justify-between">
           <h3 className="text-2xl font-black text-[#2E7D32] flex items-center gap-3">
             <span className="text-3xl">🎒</span> Lista de Alunos
           </h3>
           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black text-[#2E7D32] opacity-60">PRESENTES</p>
                <p className="text-2xl font-black text-[#2E7D32]">
                   {Object.values(attendance).filter(Boolean).length} / {students.length}
                </p>
              </div>
              <button 
                onClick={saveAttendance}
                className="px-10 py-5 bg-[#388E3C] text-white rounded-[24px] font-black border-b-8 border-[#1B5E20] shadow-xl hover:brightness-110 active:translate-y-1 transition-all"
              >
                SALVAR CHAMADA ✅
              </button>
           </div>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {students.map(student => (
              <button 
                key={student.id}
                onClick={() => toggleAttendance(student.id)}
                className={`p-6 rounded-[32px] border-4 flex items-center gap-6 transition-all transform active:scale-95 ${
                  attendance[student.id] 
                  ? 'bg-[#E8F5E9] border-[#81C784] shadow-inner' 
                  : 'bg-white border-[#E1F5FE] hover:border-[#81C784]/30'
                }`}
              >
                 <div className={`w-16 h-16 rounded-2xl border-4 overflow-hidden relative flex items-center justify-center text-4xl ${attendance[student.id] ? 'border-[#81C784] bg-white' : 'border-[#E1F5FE] bg-[#F5FBFF]'}`}>
                    {student.photoUrl ? <img src={student.photoUrl} alt="" className="w-full h-full object-cover" /> : '👦'}
                    {attendance[student.id] && (
                       <div className="absolute inset-0 bg-[#81C784]/20 flex items-center justify-center">
                          <CheckCircle2 className="text-[#2E7D32] w-8 h-8 drop-shadow-md" />
                       </div>
                    )}
                 </div>
                 <div className="flex-1 text-left">
                    <p className={`text-xl font-black ${attendance[student.id] ? 'text-[#2E7D32]' : 'text-[#78909C]'}`}>
                      {student.name}
                    </p>
                    <p className={`text-xs font-black uppercase tracking-widest ${attendance[student.id] ? 'text-[#81C784]' : 'text-gray-400'}`}>
                      {attendance[student.id] ? 'Presente na aula!' : 'Ainda não chegou'}
                    </p>
                 </div>
                 <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center text-xl shadow-md ${
                   attendance[student.id] ? 'bg-[#388E3C] border-white text-white' : 'bg-gray-100 border-gray-200 text-transparent'
                 }`}>
                   ✓
                 </div>
              </button>
           ))}
        </div>
      </div>
    </div>
  );
}

function TeachersView({ teachers, setTeachers }: { teachers: Teacher[], setTeachers: (t: Teacher[]) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSave = async (data: any) => {
    const teacherData = { ...data, classes: data.classes.split(',').map((c: string) => c.trim()) };
    if (editingTeacher) {
      const { error } = await supabase.from('teachers').update(teacherData).eq('id', editingTeacher.id);
      if (!error) {
        setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, ...teacherData } : t));
      }
    } else {
      const { data: newData, error } = await supabase.from('teachers').insert(teacherData).select();
      if (!error && newData) {
        setTeachers([...teachers, newData[0] as any]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (!error) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-10">
      {isModalOpen && (
        <MagicFormModal 
          title={editingTeacher ? "Editar Mestre" : "Novo Mestre"}
          icon="🍎"
          fields={[
            { key: 'name', label: 'Nome do Mestre', placeholder: 'Ex: Prof. João' },
            { key: 'subject', label: 'Matéria', placeholder: 'Ex: Matemática' },
            { key: 'classes', label: 'Turmas (separadas por vírgula)', placeholder: 'Ex: 1º Ano A, 2º Ano B' }
          ]}
          initialData={editingTeacher ? { ...editingTeacher, classes: editingTeacher.classes.join(', ') } : {}}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <AnimatePresence>
        {deletingId && (
          <ConfirmationModal 
            title="Remover Mestre?"
            message="Deseja realmente remover este mestre da nossa escola?"
            confirmText="SIM, REMOVER"
            cancelText="NÃO, MANTER"
            onConfirm={() => handleDelete(deletingId)}
            onClose={() => setDeletingId(null)}
            color="#FF5252"
          />
        )}
      </AnimatePresence>
       <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-[#01579B]">Nossos Mestres 🍎</h2>
        <button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="px-8 py-4 bg-[#81C784] text-white rounded-[32px] font-black border-b-8 border-[#388E3C] flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
          <PlusCircle className="w-6 h-6" />
          <span>NOVO MESTRE</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {teachers.map(t => (
          <div key={t.id} className="bg-white p-10 rounded-[48px] shadow-2xl border-r-8 border-b-8 border-[#4FC3F7] relative group hover:scale-[1.02] transition-transform">
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                 <button onClick={() => { setEditingTeacher(t); setIsModalOpen(true); }} className="w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-lg border-b-4 border-[#FBC02D] shadow-sm hover:scale-110 transition-transform cursor-pointer">✏️</button>
                 <button onClick={() => setDeletingId(t.id)} className="w-10 h-10 bg-[#FF5252] rounded-full flex items-center justify-center text-white border-b-4 border-[#D50000] shadow-sm hover:scale-110 transition-transform cursor-pointer">
                   <Trash2 className="w-5 h-5" />
                 </button>
            </div>
            <div className="absolute top-4 left-4 text-5xl opacity-20">🍏</div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 bg-[#FFF176] rounded-[40px] border-4 border-[#FBC02D] mb-6 flex items-center justify-center text-6xl shadow-xl overflow-hidden group-hover:rotate-6 transition-transform">
                {t.photoUrl ? <img src={t.photoUrl} alt="" className="w-full h-full object-cover" /> : '👨‍🏫'}
              </div>
              <h4 className="text-2xl font-black text-[#5D4037] mb-1">{t.name}</h4>
              <p className="text-[#0288D1] font-black text-sm mb-6 uppercase tracking-widest">{t.subject}</p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {t.classes.map((c: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-[#E1F5FE] rounded-2xl text-[10px] font-black text-[#0277BD] border-2 border-[#4FC3F7] shadow-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunicationView({ announcements, setAnnouncements }: { announcements: Announcement[], setAnnouncements: (a: Announcement[]) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSave = async (data: any) => {
    if (editingAnn) {
      const { error } = await supabase.from('announcements').update(data).eq('id', editingAnn.id);
      if (!error) {
        setAnnouncements(announcements.map(a => a.id === editingAnn.id ? { ...a, ...data } : a));
      }
    } else {
      const annData = { ...data, date: new Date().toLocaleDateString('pt-BR') };
      const { data: newData, error } = await supabase.from('announcements').insert(annData).select();
      if (!error && newData) {
        setAnnouncements([newData[0] as any, ...announcements]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
    setDeletingId(null);
  };

  return (
     <div className="max-w-4xl mx-auto space-y-10">
      {isModalOpen && (
        <MagicFormModal 
          title={editingAnn ? "Editar Recado" : "Novo Recado"}
          icon="📢"
          fields={[
            { key: 'title', label: 'Título do Recado', placeholder: 'Ex: Reunião de Pais' },
            { key: 'content', label: 'Mensagem', placeholder: 'Ex: Lembramos que amanhã...' },
            { key: 'target', label: 'Público (all, parents, teachers)', placeholder: 'Ex: parents' }
          ]}
          initialData={editingAnn || { target: 'all' }}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <AnimatePresence>
        {deletingId && (
          <ConfirmationModal 
            title="Remover Recado?"
            message="Tem certeza que deseja apagar este recado do mural?"
            confirmText="SIM, APAGAR"
            cancelText="NÃO, MANTER"
            onConfirm={() => handleDelete(deletingId)}
            onClose={() => setDeletingId(null)}
            color="#FF5252"
          />
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-[#D84315] drop-shadow-sm">Mural de Recados 📢</h2>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-white text-[#D84315] rounded-2xl font-black border-4 border-[#FF8A65] shadow-md">FILTROS</button>
           <button onClick={() => { setEditingAnn(null); setIsModalOpen(true); }} className="px-6 py-3 bg-[#FF8A65] text-white rounded-2xl font-black border-b-6 border-[#D84315] shadow-lg hover:scale-105 transition-all">NOVO RECADO</button>
        </div>
      </div>

      <div className="space-y-8">
        {announcements.map(ann => (
          <div key={ann.id} className="bg-white p-10 rounded-[48px] border-4 border-[#FF8A65] shadow-xl relative overflow-hidden group">
             <div className="absolute top-4 right-4 flex gap-2 z-30">
                  <button onClick={() => { setEditingAnn(ann); setIsModalOpen(true); }} className="w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-lg border-b-4 border-[#FBC02D] shadow-sm hover:scale-110 transition-transform cursor-pointer">✏️</button>
                  <button onClick={() => setDeletingId(ann.id)} className="w-10 h-10 bg-[#FF5252] rounded-full flex items-center justify-center text-white border-b-4 border-[#D50000] shadow-sm hover:scale-110 transition-transform cursor-pointer">
                    <Trash2 className="w-5 h-5" />
                  </button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A65]/10 rounded-full translate-x-12 -translate-y-12" />
             <div className="flex items-center gap-6 mb-6">
               <div className="w-16 h-16 bg-[#FFF9C4] rounded-3xl border-4 border-[#FBC02D] flex items-center justify-center shadow-inner">
                 <span className="text-3xl">🔔</span>
               </div>
               <div>
                 <h3 className="text-2xl font-black text-[#D84315]">{ann.title}</h3>
                 <p className="text-xs text-[#FF8A65] font-black uppercase tracking-widest bg-white/80 self-start px-3 py-1 rounded-full border border-[#FF8A65]/20 mt-1">{ann.date} • Para: {ann.target}</p>
               </div>
             </div>
             <p className="text-[#5D4037] text-lg font-medium leading-relaxed italic">{ann.content}</p>
             <div className="mt-8 flex items-center justify-between">
                <button className="px-8 py-3 bg-[#E1F5FE] text-[#0277BD] rounded-2xl font-black border-b-4 border-[#4FC3F7] hover:brightness-110 active:translate-y-1 transition-all">Lido e Entendido! ✅</button>
                <div className="flex -space-x-4 items-center">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-[#FF8A65] overflow-hidden shadow-md" />
                  ))}
                  <span className="ml-4 text-xs text-[#78909C] font-black uppercase">+12 pais viram</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryView({ items, setItems }: { items: any[], setItems: (i: any[]) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSave = async (data: any) => {
    if (editingItem) {
      const { error } = await supabase.from('inventory').update(data).eq('id', editingItem.id);
      if (!error) {
        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
      }
    } else {
      const itemData = { ...data, icon: '📦' };
      const { data: newData, error } = await supabase.from('inventory').insert(itemData).select();
      if (!error && newData) {
        setItems([...items, newData[0] as any]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(i => i.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-10">
      {isModalOpen && (
        <MagicFormModal 
          title={editingItem ? "Editar Item" : "Novo Item"}
          icon="📦"
          fields={[
            { key: 'name', label: 'Nome do Material', placeholder: 'Ex: Lápis' },
            { key: 'stock', label: 'Quantidade Atual', type: 'number', placeholder: 'Ex: 100' },
            { key: 'min', label: 'Estoque Mínimo', type: 'number', placeholder: 'Ex: 20' },
            { key: 'unit', label: 'Unidade (Caixas, Un, etc)', placeholder: 'Ex: Unidades' }
          ]}
          initialData={editingItem || {}}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <AnimatePresence>
        {deletingId && (
          <ConfirmationModal 
            title="Remover do Estoque?"
            message="Tem certeza que deseja apagar este item permanentemente?"
            confirmText="SIM, REMOVER"
            cancelText="NÃO, MANTER"
            onConfirm={() => handleDelete(deletingId)}
            onClose={() => setDeletingId(null)}
            color="#FF5252"
          />
        )}
      </AnimatePresence>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Estoque da Escola 📦</h2>
          <p className="text-[#546E7A] font-bold">Onde guardamos nossos materiais!</p>
        </div>
        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="px-8 py-4 bg-[#81C784] text-white rounded-[24px] font-black border-b-8 border-[#388E3C] shadow-xl hover:scale-105 transition-all">NOVO ITEM</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item, i) => (
          <div key={item.id} className="bg-white p-8 rounded-[48px] border-4 border-[#E1F5FE] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-4 right-4 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="w-8 h-8 bg-[#FFF176] rounded-full flex items-center justify-center text-sm border-b-4 border-[#FBC02D] shadow-sm">✏️</button>
                 <button onClick={() => setDeletingId(item.id)} className="w-8 h-8 bg-[#FF5252] rounded-full flex items-center justify-center text-white border-b-4 border-[#D50000] shadow-sm">
                   <Trash2 className="w-4 h-4" />
                 </button>
            </div>
            <h4 className="text-xl font-black text-[#5D4037] mb-4 flex items-center gap-2">
               <span className="text-2xl">{item.icon}</span> {item.name}
            </h4>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-5xl font-black ${item.stock < item.min ? 'text-[#D84315]' : 'text-[#01579B]'}`}>{item.stock}</p>
                <p className="text-[10px] text-[#78909C] font-black uppercase tracking-widest">{item.unit}</p>
              </div>
              {item.stock < item.min && (
                <div className="px-3 py-1 bg-[#FBE9E7] rounded-full border-2 border-[#FF8A65] text-[10px] text-[#D84315] font-black uppercase animate-pulse">
                  BAIXO ⚠️
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosView({ albums, setAlbums }: { albums: any[], setAlbums: (a: any[]) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSave = async (data: any) => {
    if (editingAlbum) {
      const { error } = await supabase.from('albums').update(data).eq('id', editingAlbum.id);
      if (!error) {
        setAlbums(albums.map(a => a.id === editingAlbum.id ? { ...a, ...data } : a));
      }
    } else {
      const albumData = { ...data, count: 0, cover: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80' };
      const { data: newData, error } = await supabase.from('albums').insert(albumData).select();
      if (!error && newData) {
        setAlbums([...albums, newData[0] as any]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (!error) {
      setAlbums(albums.filter(a => a.id !== id));
    }
    setDeletingId(null);
  };

  return (
     <div className="space-y-10">
       {isModalOpen && (
        <MagicFormModal 
          title={editingAlbum ? "Editar Álbum" : "Novo Álbum"}
          icon="📸"
          fields={[
            { key: 'title', label: 'Título do Álbum', placeholder: 'Ex: Passeio no Parque' },
            { key: 'date', label: 'Data', placeholder: 'Ex: Outubro 2024' },
          ]}
          initialData={editingAlbum || {}}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <AnimatePresence>
        {deletingId && (
          <ConfirmationModal 
            title="Remover Álbum?"
            message="Todas as fotos do álbum serão removidas. Continuar?"
            confirmText="SIM, REMOVER"
            cancelText="NÃO, MANTER"
            onConfirm={() => handleDelete(deletingId)}
            onClose={() => setDeletingId(null)}
            color="#FF5252"
          />
        )}
      </AnimatePresence>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Álbum de Memórias 📸</h2>
          <p className="text-[#546E7A] font-bold">Cada foto um sorriso guardado!</p>
        </div>
        <button onClick={() => { setEditingAlbum(null); setIsModalOpen(true); }} className="px-8 py-4 bg-[#FF5252] text-white rounded-[24px] font-black border-b-8 border-[#D50000] shadow-xl hover:scale-105 transition-all">NOVO ÁLBUM</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {albums.map((al, i) => (
          <div key={al.id} className="group relative">
             <div className="absolute top-4 right-10 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => { setEditingAlbum(al); setIsModalOpen(true); }} className="w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-lg border-b-4 border-[#FBC02D] shadow-sm">✏️</button>
                 <button onClick={() => setDeletingId(al.id)} className="w-10 h-10 bg-[#FF5252] rounded-full flex items-center justify-center text-white border-b-4 border-[#D50000] shadow-sm">
                   <Trash2 className="w-5 h-5" />
                 </button>
            </div>
             <div className="absolute inset-0 bg-[#4FC3F7] rounded-[56px] translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-all" />
             <div className="bg-white p-6 rounded-[56px] border-4 border-[#E1F5FE] shadow-2xl overflow-hidden relative">
                <div className="h-64 rounded-[40px] overflow-hidden mb-6 border-4 border-white shadow-inner relative">
                   <img src={al.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                      <div className="flex items-center gap-3 text-white">
                         <span className="text-2xl">🖼️</span>
                         <span className="font-black text-xl drop-shadow-md">{al.count} fotos</span>
                      </div>
                   </div>
                </div>
                <div className="px-4">
                  <h4 className="text-2xl font-black text-[#5D4037] mb-2">{al.title}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-[#78909C] uppercase tracking-widest">{al.date}</p>
                    <button className="w-12 h-12 bg-[#E1F5FE] rounded-full flex items-center justify-center text-[#0288D1] border-2 border-white shadow-lg hover:bg-[#4FC3F7] hover:text-white transition-all scale-100 group-hover:scale-110">
                       →
                    </button>
                  </div>
                </div>
             </div>
          </div>
        ))}
        <div onClick={() => { setEditingAlbum(null); setIsModalOpen(true); }} className="border-8 border-dashed border-[#E1F5FE] rounded-[56px] flex flex-col items-center justify-center min-h-[350px] text-[#4FC3F7] hover:bg-[#E1F5FE]/20 hover:border-[#4FC3F7] transition-all cursor-pointer group">
           <PlusCircle className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
           <p className="font-black text-xl uppercase tracking-widest">Criar Álbum</p>
        </div>
      </div>
    </div>
  );
}

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);


function DirectiveView({ members, setMembers }: { members: DirectiveMember[], setMembers: (m: DirectiveMember[]) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DirectiveMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDeletingId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSave = async (data: any) => {
    if (editingMember) {
      const { error } = await supabase.from('directive').update(data).eq('id', editingMember.id);
      if (!error) {
        setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...data } : m));
      }
    } else {
      const { data: newData, error } = await supabase.from('directive').insert(data).select();
      if (!error && newData) {
        setMembers([...members, newData[0] as any]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('directive').delete().eq('id', id);
    if (!error) {
      setMembers(members.filter(m => m.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-10">
      {isModalOpen && (
        <MagicFormModal 
          title={editingMember ? "Editar Diretor" : "Novo Diretor"}
          icon="👔"
          fields={[
            { key: 'name', label: 'Nome do Diretor', placeholder: 'Ex: Dr. Carlos' },
            { key: 'role', label: 'Cargo', placeholder: 'Ex: Diretor Financeiro' },
            { key: 'email', label: 'E-mail', placeholder: 'Ex: carlos@escola.com' },
            { key: 'phone', label: 'Telefone', placeholder: 'Ex: (11) 99999-9999' }
          ]}
          initialData={editingMember || {}}
          onSubmit={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      <AnimatePresence>
        {deletingId && (
          <ConfirmationModal 
            title="Remover Diretor?"
            message="Tem certeza que deseja remover este membro do corpo diretivo?"
            confirmText="SIM, REMOVER"
            cancelText="NÃO, MANTER"
            onConfirm={() => handleDelete(deletingId)}
            onClose={() => setDeletingId(null)}
            color="#FF5252"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Corpo Diretivo 👔</h2>
          <p className="text-[#546E7A] font-bold">Liderança e Gestão da Escola Mágica</p>
        </div>
        <button 
          onClick={() => { setEditingMember(null); setIsModalOpen(true); }} 
          className="px-8 py-4 bg-[#4FC3F7] text-white rounded-[32px] font-black border-b-8 border-[#0288D1] flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
        >
          <PlusCircle className="w-6 h-6" />
          <span>NOVO DIRETOR</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {members.map(m => (
          <div key={m.id} className="bg-white p-10 rounded-[48px] shadow-2xl border-l-8 border-b-8 border-[#0288D1] relative group hover:scale-[1.02] transition-transform">
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                 <button onClick={() => { setEditingMember(m); setIsModalOpen(true); }} className="w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-lg border-b-4 border-[#FBC02D] shadow-sm hover:scale-110 transition-transform cursor-pointer">✏️</button>
                 <button onClick={() => setDeletingId(m.id)} className="w-10 h-10 bg-[#FF5252] rounded-full flex items-center justify-center text-white border-b-4 border-[#D50000] shadow-sm hover:scale-110 transition-transform cursor-pointer">
                   <Trash2 className="w-5 h-5" />
                 </button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-[#E1F5FE] rounded-full border-4 border-[#4FC3F7] mb-6 flex items-center justify-center text-6xl shadow-xl overflow-hidden group-hover:rotate-3 transition-transform">
                {m.photoUrl ? <img src={m.photoUrl} alt="" className="w-full h-full object-cover" /> : '👤'}
              </div>
              <h4 className="text-2xl font-black text-[#5D4037] mb-1">{m.name}</h4>
              <p className="text-[#0288D1] font-black text-sm mb-4 uppercase tracking-widest">{m.role}</p>
              
              <div className="w-full space-y-2 border-t-2 border-dashed border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 flex items-center gap-2">📧 {m.email || 'Não informado'}</p>
                <p className="text-xs font-bold text-gray-400 flex items-center gap-2">📞 {m.phone || 'Não informado'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MagicFormModal({ title, icon, fields, initialData, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState<any>(initialData || {});

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[56px] border-8 border-[#4FC3F7] p-10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
      >
        <button onClick={onClose} type="button" className="absolute top-6 right-6 p-2 bg-[#E1F5FE] text-[#0288D1] rounded-full hover:rotate-90 transition-transform z-20">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-8">
           <div className="w-16 h-16 bg-[#FFF176] rounded-3xl border-4 border-[#FBC02D] flex items-center justify-center text-4xl shadow-inner">{icon}</div>
           <h3 className="text-3xl font-black text-[#01579B] uppercase italic">{title}</h3>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
          {fields.map((f: any) => (
            <div key={f.key} className="space-y-2">
              <label className="text-sm font-black text-[#0288D1] uppercase tracking-widest ml-1">{f.label}</label>
              {f.type === 'color' ? (
                <div className="grid grid-cols-5 gap-3 p-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px]">
                  {['#4FC3F7', '#FF8A65', '#81C784', '#FFF176', '#FF5252', '#BA68C8', '#F06292', '#A1887F', '#90A4AE', '#37474F'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, [f.key]: c})}
                      className={`w-full aspect-square rounded-xl border-4 transition-all hover:scale-110 ${formData[f.key] === c ? 'border-white ring-4 ring-[#4FC3F7] scale-105' : 'border-transparent shadow-sm'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="col-span-5 flex items-center gap-4 mt-2 pt-2 border-t-2 border-dashed border-[#E1F5FE]">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Personalizada:</span>
                    <input 
                      type="color" 
                      value={formData[f.key] || '#4FC3F7'}
                      onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input 
                      type="text"
                      value={formData[f.key] || ''}
                      onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                      className="flex-1 bg-white border-2 border-[#E1F5FE] rounded-lg px-3 py-1 font-mono text-xs font-bold"
                      placeholder="#HEX"
                    />
                  </div>
                </div>
              ) : (
                <input 
                  required={f.required !== false}
                  value={formData[f.key] || ''}
                  onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                  type={f.type || 'text'}
                  className="w-full px-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-bold focus:border-[#4FC3F7] outline-none transition-all"
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[24px] font-black border-b-6 border-gray-300 active:translate-y-1 transition-all">CANCELAR</button>
            <button type="submit" className="flex-3 py-4 bg-[#81C784] text-white rounded-[24px] font-black border-b-6 border-[#388E3C] active:translate-y-1 transition-all shadow-lg">SALVAR ✅</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function SettingsView({ info, setInfo }: { info: any, setInfo: (i: any) => void }) {
  const [formData, setFormData] = useState(info);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData(info);
  }, [info]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `school-logo-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('students') // Usando o mesmo bucket já criado
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('students')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
    } catch (error: any) {
      alert('Erro no upload da logo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Map camelCase to snake_case for database
      const dbData = {
        name: formData.name,
        address: formData.address,
        cnpj: formData.cnpj,
        director: formData.director,
        logo_url: formData.logoUrl,
        primary_color: formData.primaryColor,
        passing_grade: formData.passingGrade,
        contract_template: formData.contractTemplate
      };

      const { error } = await supabase.from('school_info').upsert({ 
        id: info.id || 1, 
        ...dbData
      });
      
      if (!error) {
        setInfo(formData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error('Error saving settings:', error);
        alert('Erro ao salvar: ' + error.message);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h2 className="text-4xl font-black text-[#37474F]">Configurações ⚙️</h2>
        <p className="text-gray-500 font-bold">Personalize a identidade e as regras da sua escola!</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        {/* Coluna 1: Dados Básicos */}
        <div className="bg-white p-8 rounded-[48px] shadow-2xl border-b-8 border-gray-200 space-y-6">
          <h3 className="text-xl font-black text-[#01579B] flex items-center gap-2">
            <span className="bg-[#E1F5FE] p-2 rounded-xl">🏢</span> Dados Oficiais
          </h3>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome da Escola</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-5 py-3 bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-2xl font-bold outline-none focus:border-[#4FC3F7]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CNPJ</label>
            <input 
              value={formData.cnpj} 
              onChange={e => setFormData({...formData, cnpj: e.target.value})}
              className="w-full px-5 py-3 bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-2xl font-bold outline-none focus:border-[#4FC3F7]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Endereço</label>
            <textarea 
              rows={2}
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full px-5 py-3 bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-2xl font-bold outline-none focus:border-[#4FC3F7] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Diretor(a)</label>
            <input 
              value={formData.director} 
              onChange={e => setFormData({...formData, director: e.target.value})}
              className="w-full px-5 py-3 bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-2xl font-bold outline-none focus:border-[#4FC3F7]"
            />
          </div>
        </div>

        {/* Coluna 2: Identidade Visual */}
        <div className="bg-white p-8 rounded-[48px] shadow-2xl border-b-8 border-gray-200 space-y-6">
          <h3 className="text-xl font-black text-[#FF8A65] flex items-center gap-2">
            <span className="bg-[#FBE9E7] p-2 rounded-xl">🎨</span> Identidade Visual
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo da Escola</label>
            <div className="flex gap-4 items-center bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-3xl p-4">
              <div className="w-20 h-20 bg-white rounded-2xl border-4 border-[#FF8A65] flex items-center justify-center overflow-hidden shadow-sm">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-3xl">🏫</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-[#FF8A65] text-white hover:brightness-95 shadow-md border-b-4 border-[#D84315]'}`}
                >
                  {isUploading ? 'ENVIANDO...' : 'UPLOAD DA LOGO'}
                </label>
                <p className="text-[10px] font-bold text-gray-300 mt-2 ml-1 italic">Dê preferência a fundos transparentes (PNG).</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cor Principal do Sistema</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color"
                value={formData.primaryColor} 
                onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-md"
              />
              <input 
                value={formData.primaryColor} 
                onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                className="flex-1 px-5 py-3 bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-2xl font-bold uppercase"
              />
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 mt-4">
            <p className="text-xs font-bold text-blue-600 leading-relaxed italic">
              A cor escolhida será aplicada automaticamente nos documentos PDF e nos cabeçalhos de impressão.
            </p>
          </div>
        </div>

        {/* Coluna 3: Regras e Documentos */}
        <div className="bg-white p-8 rounded-[48px] shadow-2xl border-b-8 border-gray-200 space-y-6">
          <h3 className="text-xl font-black text-[#81C784] flex items-center gap-2">
            <span className="bg-[#E8F5E9] p-2 rounded-xl">📜</span> Regras e Contratos
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nota para Aprovação</label>
            <div className="flex gap-4 items-center">
              <input 
                type="range" min="0" max="10" step="0.5"
                value={formData.passingGrade} 
                onChange={e => setFormData({...formData, passingGrade: parseFloat(e.target.value)})}
                className="flex-1 accent-[#81C784]"
              />
              <span className="w-12 h-12 bg-[#81C784] text-white flex items-center justify-center rounded-xl font-black shadow-lg">
                {formData.passingGrade.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Texto do Comprovante/Contrato</label>
            <textarea 
              rows={5}
              value={formData.contractTemplate} 
              onChange={e => setFormData({...formData, contractTemplate: e.target.value})}
              className="w-full px-5 py-3 bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-2xl font-bold outline-none focus:border-[#4FC3F7] text-sm leading-relaxed"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className={`w-full py-5 text-white rounded-[32px] font-black border-b-8 shadow-lg transition-all mt-4 flex items-center justify-center gap-3 ${
              isSaving 
              ? 'bg-gray-400 border-gray-500 cursor-wait' 
              : showSuccess 
                ? 'bg-[#4FC3F7] border-[#0288D1]' 
                : 'bg-[#81C784] border-[#388E3C] hover:scale-[1.02] active:translate-y-1'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                SALVANDO...
              </>
            ) : showSuccess ? (
              <>✅ SALVO COM SUCESSO!</>
            ) : (
              <>SALVAR TUDO ✅</>
            )}
          </button>
          
          <AnimatePresence>
            {showSuccess && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[#388E3C] font-bold text-xs mt-3"
              >
                As alterações foram sincronizadas com a nuvem! ☁️
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}

function ConfirmationModal({ title, message, confirmText, cancelText, onConfirm, onClose, color }: any) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[48px] border-8 p-10 max-w-md w-full shadow-2xl relative text-center"
        style={{ borderColor: color }}
      >
        <div className="w-20 h-20 bg-[#FBE9E7] rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
          ⚠️
        </div>
        <h3 className="text-2xl font-black text-[#5D4037] mb-4 uppercase">{title}</h3>
        <p className="text-gray-500 font-bold mb-8">{message}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[24px] font-black border-b-6 border-gray-300 active:translate-y-1 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-4 text-white rounded-[24px] font-black border-b-6 active:translate-y-1 transition-all shadow-lg"
            style={{ backgroundColor: color, borderBottomColor: '#D50000' }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

