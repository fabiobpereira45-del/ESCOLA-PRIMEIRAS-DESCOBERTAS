import { PlayCircle, FileText, CheckCircle, Clock, BookOpen, Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function EADPortal() {
  const courses = [
    { id: 1, title: 'Matemática Divertida', progress: 85, lessons: 12, completed: 10, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80' },
    { id: 2, title: 'Gramática com Histórias', progress: 40, lessons: 15, completed: 6, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80' },
    { id: 3, title: 'Experiências de Ciências', progress: 0, lessons: 8, completed: 0, image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Portal de Estudos Online 🚀</h2>
          <p className="text-[#546E7A] font-bold">Aprenda brincando em qualquer lugar!</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-[#FFF176] text-[#5D4037] rounded-[24px] font-black border-4 border-[#FBC02D] shadow-lg">
          <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
          <span>1.250 PONTOS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
      </div>
    </div>
  );
}
