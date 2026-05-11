import { useState } from 'react';
import { 
  PlayCircle, FileText, CheckCircle, Clock, BookOpen, Star, 
  CreditCard, CheckCircle2, AlertCircle, Printer, Calculator, 
  ChevronRight, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FinancialRecord } from '../types';

interface EADPortalProps {
  studentRecords: FinancialRecord[];
}

export default function EADPortal({ studentRecords = [] }: EADPortalProps) {
  const [activeTab, setActiveTab] = useState<'studies' | 'finance'>('studies');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const courses = [
    { id: 1, title: 'Matemática Divertida', progress: 85, lessons: 12, completed: 10, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80' },
    { id: 2, title: 'Gramática com Histórias', progress: 40, lessons: 15, completed: 6, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80' },
    { id: 3, title: 'Experiências de Ciências', progress: 0, lessons: 8, completed: 0, image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80' },
  ];

  const toggleInvoice = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedTotal = studentRecords
    .filter(r => selectedInvoices.includes(r.id))
    .reduce((acc, r) => acc + (r.amount - (r.discount || 0)), 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Portal do Aluno 🚀</h2>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setActiveTab('studies')}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === 'studies' ? 'bg-[#4FC3F7] text-white shadow-lg' : 'bg-white text-gray-400'
              }`}
            >
              Estudos Online
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === 'finance' ? 'bg-[#FFF176] text-[#5D4037] shadow-lg' : 'bg-white text-gray-400'
              }`}
            >
              Financeiro
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-[#FFF176] text-[#5D4037] rounded-[24px] font-black border-4 border-[#FBC02D] shadow-lg">
          <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
          <span>1.250 PONTOS</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'studies' && (
          <motion.div 
            key="studies"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Main Continue Watching */}
            <div className="lg:col-span-2 bg-[#1A535C] rounded-[56px] p-10 text-white relative overflow-hidden flex items-center shadow-2xl border-8 border-[#4FC3F7]">
               <div className="relative z-10 space-y-6">
                  <span className="px-4 py-1 bg-[#4ECDC4] text-white text-[10px] font-black rounded-full uppercase tracking-widest border-2 border-white/20 shadow-sm">CONTINUAR ASSISTINDO</span>
                  <h3 className="text-4xl font-black max-w-lg leading-tight uppercase italic underline decoration-[#FFE66D] underline-offset-4">Tabuada dos Animais: O Desafio da Floresta</h3>
                  <div className="flex items-center gap-8 pt-4">
                    <button className="w-20 h-20 bg-[#FFF176] rounded-full border-b-8 border-[#FBC02D] flex items-center justify-center shadow-2xl group hover:scale-110 transition-transform">
                      <PlayCircle className="w-12 h-12 text-[#1A535C] fill-[#1A535C]" />
                    </button>
                    <div>
                      <p className="font-black text-lg text-cyan-200">Próxima Aula: Multiplicação por 5</p>
                      <p className="text-sm font-bold opacity-60">Prepare seu lápis e borracha!</p>
                    </div>
                  </div>
               </div>
               <BookOpen className="w-80 h-80 absolute -right-20 -bottom-20 opacity-10 rotate-12" />
            </div>

            {/* Course List */}
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-[#01579B] flex items-center gap-3">
                 <span className="text-3xl">📂</span> Meus Caminhos de Magia
              </h3>
              {courses.map(course => (
                <div key={course.id} className="bg-white p-6 rounded-[40px] shadow-xl border-4 border-[#E1F5FE] flex gap-6 hover:translate-y-[-4px] transition-all">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-inner flex-shrink-0 border-4 border-[#FFF176]">
                    <img src={course.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-xl font-black text-[#5D4037] mb-1">{course.title}</h4>
                     <p className="text-xs text-[#78909C] font-black uppercase tracking-wider">{course.completed}/{course.lessons} aulas concluídas</p>
                     <div className="mt-6 space-y-3">
                        <div className="w-full h-4 bg-[#E1F5FE] rounded-full overflow-hidden border-2 border-white shadow-inner">
                           <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            className="h-full bg-[#81C784] rounded-full border-r-4 border-white" 
                           />
                        </div>
                        <div className="flex justify-between items-center">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${course.progress === 100 ? 'text-[#388E3C]' : 'text-[#78909C]'}`}>
                             {course.progress}% Concluído {course.progress === 100 && '🏆'}
                           </span>
                           <button className="text-[#0288D1] font-black text-sm hover:underline">COMEÇAR →</button>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activities and Files */}
            <div className="bg-white p-10 rounded-[56px] shadow-2xl border-4 border-[#FF8A65]">
               <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl">📝</span>
                  <h3 className="text-2xl font-black text-[#D84315]">Missões da Semana</h3>
               </div>
               <div className="space-y-5">
                  {[
                    { title: 'Desenho: Minha Família', type: 'Entrega', deadline: 'Hoje', color: '#FF8A65', icon: '🎨' },
                    { title: 'Podcast: Sons da Natureza', type: 'Escuta', deadline: 'Amanhã', color: '#4FC3F7', icon: '🎧' },
                    { title: 'Quiz: Sistema Solar', type: 'Online', deadline: '15 Out', color: '#FFF176', icon: '⭐' },
                  ].map((act, i) => (
                    <div key={i} className="p-5 rounded-[32px] bg-gray-50 flex items-center gap-5 hover:bg-[#E1F5FE]/20 hover:shadow-inner transition-all group border-2 border-transparent hover:border-[#4FC3F7]">
                       <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-white border-2 border-gray-100">
                         {act.icon}
                       </div>
                       <div className="flex-1">
                         <p className="font-black text-lg text-[#5D4037]">{act.title}</p>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{act.type}</span>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PRAZO</p>
                          <p className="text-sm font-black italic uppercase" style={{ color: act.color }}>{act.deadline}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-10 py-5 bg-[#D84315] text-white rounded-3xl font-black text-lg border-b-8 border-black/20 shadow-xl hover:brightness-110 active:translate-y-1 transition-all">VER TODAS AS MISSÕES</button>
            </div>
          </motion.div>
        )}

        {activeTab === 'finance' && (
          <motion.div 
            key="finance"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[56px] border-8 border-[#FFF176] shadow-2xl overflow-hidden">
               <div className="bg-[#FFFDE7] p-10 border-b-8 border-[#FFF176] flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                  <div className="space-y-2">
                     <p className="text-sm font-black text-[#F57F17] uppercase tracking-widest">Saldo Selecionado para Pagamento</p>
                     <h3 className="text-6xl font-black text-[#5D4037]">R$ {selectedTotal.toFixed(2)}</h3>
                     <p className="text-xs font-bold text-gray-400">{selectedInvoices.length} mensalidades marcadas</p>
                  </div>
                  <button 
                    disabled={selectedInvoices.length === 0}
                    className={`px-12 py-6 rounded-[32px] font-black text-xl border-b-8 shadow-2xl flex items-center gap-4 transition-all ${
                      selectedInvoices.length > 0 
                        ? 'bg-[#81C784] text-white border-[#388E3C] hover:scale-105 active:translate-y-2' 
                        : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <CreditCard className="w-8 h-8" /> PAGAR SELECIONADOS
                  </button>
               </div>

               <div className="p-10 space-y-8">
                  <h4 className="text-2xl font-black text-[#5D4037] flex items-center gap-3">
                    <Calendar className="text-[#FBC02D]" /> Mensalidades do Ano
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentRecords.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((rec, i) => (
                      <div 
                        key={rec.id}
                        onClick={() => rec.status !== 'paid' && toggleInvoice(rec.id)}
                        className={`p-6 rounded-[40px] border-4 transition-all cursor-pointer relative group ${
                          rec.status === 'paid' 
                            ? 'bg-gray-50 border-gray-200 opacity-60' 
                            : selectedInvoices.includes(rec.id)
                              ? 'bg-[#E8F5E9] border-[#81C784] scale-105 shadow-xl'
                              : 'bg-white border-[#FFF176] hover:border-[#FBC02D] shadow-lg'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                            rec.status === 'paid' ? 'bg-gray-200' : 'bg-[#FFFDE7]'
                          }`}>
                            {rec.status === 'paid' ? '✅' : '📄'}
                          </div>
                          {rec.status !== 'paid' && (
                            <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${
                              selectedInvoices.includes(rec.id) ? 'bg-[#81C784] border-[#81C784] text-white' : 'bg-white border-[#FFF176]'
                            }`}>
                              {selectedInvoices.includes(rec.id) && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h5 className="font-black text-[#5D4037] text-lg uppercase tracking-tight">{i + 1}ª Mensalidade</h5>
                          <p className="text-xs font-bold text-gray-400">Vencimento: {new Date(rec.dueDate).toLocaleDateString('pt-BR')}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t-4 border-dashed border-gray-100 flex justify-between items-end">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase">Valor Líquido</p>
                              <p className="text-2xl font-black text-[#5D4037]">R$ {(rec.amount - (rec.discount || 0)).toFixed(2)}</p>
                              {rec.discount && <p className="text-[10px] text-red-400 font-bold">Desconto aplicado: R$ {rec.discount.toFixed(2)}</p>}
                           </div>
                           {rec.status === 'paid' && (
                             <button className="p-3 bg-white text-[#78909C] rounded-2xl border-2 border-gray-100 hover:bg-[#4FC3F7] hover:text-white transition-all shadow-sm">
                               <Printer className="w-5 h-5" />
                             </button>
                           )}
                        </div>

                        {rec.status === 'paid' && (
                          <div className="absolute top-2 right-2 rotate-12 bg-[#81C784] text-white px-4 py-1 rounded-full font-black text-[10px] shadow-lg border-2 border-white">QUITADO</div>
                        )}
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
