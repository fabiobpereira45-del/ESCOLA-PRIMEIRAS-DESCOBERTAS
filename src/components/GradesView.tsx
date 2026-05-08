import { CheckCircle2, TrendingUp, Award, Clock, FileText, Download } from 'lucide-react';

export default function GradesView() {
  const subjects = [
    { name: 'Português', grade: 9.5, status: 'approved' },
    { name: 'Matemática', grade: 8.0, status: 'approved' },
    { name: 'Ciências', grade: 7.5, status: 'approved' },
    { name: 'História', grade: 9.0, status: 'approved' },
    { name: 'Geografia', grade: 6.5, status: 'attention' },
    { name: 'Artes', grade: 10, status: 'approved' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Boletim Mágico 📝</h2>
          <p className="text-[#546E7A] font-bold">Veja como você está indo nas aulas!</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white text-[#01579B] rounded-[24px] font-black border-4 border-[#E1F5FE] shadow-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            PDF
          </button>
          <button className="px-8 py-4 bg-[#FF5252] text-white rounded-[24px] font-black border-b-8 border-[#D50000] shadow-xl flex items-center gap-2">
            <FileText className="w-5 h-5" />
            IMPRIMIR
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[56px] shadow-2xl border-8 border-[#4FC3F7]">
        <div className="flex items-center justify-between mb-10 pb-6 border-b-4 border-dashed border-[#E1F5FE]">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#E1F5FE] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-4xl">👦</div>
            <div>
              <h3 className="text-2xl font-black text-[#01579B]">Joãozinho Silva</h3>
              <p className="text-sm font-black text-[#4FC3F7] uppercase tracking-widest">2º Ano A • 2024</p>
            </div>
          </div>
          <div className="text-right bg-[#E1F5FE] p-6 rounded-3xl border-b-8 border-[#4FC3F7]">
            <p className="text-[10px] text-[#0277BD] font-black uppercase mb-1 tracking-widest">MÉDIA GERAL</p>
            <p className="text-5xl font-black text-[#01579B]">8.4</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub, i) => (
            <div key={i} className="p-8 rounded-[40px] bg-[#F5FBFF] border-4 border-[#E1F5FE] group hover:bg-white hover:border-[#4FC3F7] transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-black text-[#5D4037]">{sub.name}</h4>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 ${sub.status === 'approved' ? 'bg-[#E8F5E9] border-[#81C784] text-[#2E7D32]' : 'bg-[#FFF9C4] border-[#FBC02D] text-[#F57C00]'}`}>
                  {sub.status === 'approved' ? '✅' : '⏳'}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#78909C] uppercase mb-1">Nota</p>
                  <p className={`text-4xl font-black ${sub.grade >= 7 ? 'text-[#01579B]' : 'text-[#D84315]'}`}>{sub.grade.toFixed(1)}</p>
                </div>
                <div className="w-24 h-3 bg-[#E1F5FE] rounded-full overflow-hidden border border-white">
                  <div className={`h-full rounded-full ${sub.grade >= 7 ? 'bg-[#4FC3F7]' : 'bg-[#FF8A65]'}`} style={{ width: `${sub.grade * 10}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-10 bg-[#E1F5FE] rounded-[56px] border-4 border-[#4FC3F7] border-dashed flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8 text-center md:text-left">
            <div className="w-24 h-24 bg-white rounded-full shadow-2xl border-4 border-[#FFF176] flex items-center justify-center text-5xl shrink-0 animate-bounce">
              🏆
            </div>
            <div>
              <h4 className="text-3xl font-black text-[#01579B] mb-2">Parabéns, Campeão! 🎉</h4>
              <p className="text-[#0277BD] font-bold text-lg max-w-lg">Suas notas mostram que você está aprendendo muitas coisas novas e divertidas!</p>
            </div>
          </div>
          <button className="px-10 py-5 bg-[#4FC3F7] text-white rounded-[24px] font-black border-b-8 border-[#0288D1] shadow-2xl text-xl hover:scale-105 active:scale-95 transition-all">VER MEUS PRÊMIOS</button>
        </div>
      </div>
    </div>
  );
}
