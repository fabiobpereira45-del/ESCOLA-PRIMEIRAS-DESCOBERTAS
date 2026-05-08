import { useState, useEffect } from 'react';
import { 
  Printer, 
  Settings2, 
  CreditCard, 
  User, 
  Calendar, 
  Trash2, 
  Scissors, 
  Search,
  CheckCircle2,
  Info,
  LayoutDashboard,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, FinancialRecord } from '../types';

interface CarneViewProps {
  students: Student[];
  financialRecords: FinancialRecord[];
  schoolInfo: any;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const Via = ({ school, student, value, monthName, year, installmentNum, totalInstallments, dueDay, isCanhoto }: any) => (
  <div className={`flex-1 p-2 flex flex-col h-full ${isCanhoto ? 'pr-4 border-r-2 border-dashed border-gray-300' : 'pl-4'}`}>
    <div className="border border-gray-400 rounded-3xl p-3 h-full flex flex-col justify-between bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 -mr-12 -mt-12 rotate-45 z-0" />
      
      <div className="flex items-start justify-between mb-4 z-10">
        <div className="flex items-center gap-4">
          {school.logoUrl && (
            <img src={school.logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
          )}
          <div>
            <h2 className="font-black text-lg uppercase leading-tight text-gray-900">{school.name}</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{school.subtitle || 'Educação de Qualidade'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2">
            {isCanhoto ? 'Via da Escola' : 'Via do Aluno'}
          </span>
          <div className="bg-gray-950 text-white px-3 py-1 rounded-lg text-sm font-black">
            {installmentNum.toString().padStart(2, '0')}/{totalInstallments.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-800 flex-1 flex flex-col justify-center z-10">
        <div className="flex items-end gap-3">
          <span className="whitespace-nowrap font-black text-gray-400 uppercase text-[10px]">Aluno(a):</span>
          <span className="flex-1 border-b-2 border-gray-200 font-black text-gray-900 text-lg pb-1 min-h-[24px]">
            {student.name}
          </span>
        </div>

        <div className="flex items-end gap-3">
          <span className="whitespace-nowrap font-black text-gray-400 uppercase text-[10px]">Responsável:</span>
          <span className="flex-1 border-b-2 border-gray-200 font-bold text-gray-800 text-base pb-1 min-h-[24px]">
            {student.parentName || '________________________________'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="flex items-end gap-3">
            <span className="whitespace-nowrap font-black text-gray-400 uppercase text-[10px]">Turma:</span>
            <span className="flex-1 border-b-2 border-gray-200 font-bold text-gray-800 text-base pb-1 min-h-[24px]">
              {student.turma}
            </span>
          </div>
          <div className="flex items-end gap-3">
            <span className="whitespace-nowrap font-black text-gray-400 uppercase text-[10px]">ID:</span>
            <span className="flex-1 border-b-2 border-gray-200 font-bold text-gray-800 text-base pb-1 min-h-[24px]">
              {student.id}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-1">
          <div className="flex flex-col gap-1">
            <span className="font-black text-gray-400 uppercase text-[9px]">Valor R$:</span>
            <span className="border-b-2 border-gray-200 font-black text-gray-900 text-lg pb-1 min-h-[28px]">
              {value ? `R$ ${value}` : ''}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-black text-gray-400 uppercase text-[9px]">Referência:</span>
            <span className="border-b-2 border-gray-200 font-bold text-gray-900 text-base pb-1 min-h-[28px]">
              {monthName} / {year}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-black text-gray-400 uppercase text-[9px]">Vencimento:</span>
            <span className="border-b-2 border-gray-200 font-black text-red-600 text-lg pb-1 min-h-[28px] whitespace-nowrap">
              {dueDay} / {installmentNum.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-2 pt-2 border-t-2 border-gray-100">
          <div className="flex flex-col gap-1.5">
             <span className="font-black text-gray-400 uppercase text-[9px]">Pagamento:</span>
             <div className="text-gray-300 tracking-tighter text-sm font-bold">____ / ____ / ____</div>
          </div>
          <div className="flex flex-col items-end w-1/2 gap-1.5">
            <div className="border-b-2 border-gray-300 w-full mb-1"></div>
            <span className="font-black text-gray-400 uppercase text-[9px]">Assinatura Autorizada</span>
          </div>
        </div>
      </div>

      {school.address && (
        <div className="mt-3 text-[9px] text-gray-400 text-center italic border-t border-gray-50 pt-2">
          {school.address} {school.cnpj ? `| CNPJ: ${school.cnpj}` : ''}
        </div>
      )}
    </div>
  </div>
);

const CoverSheet = ({ school, student, year }: any) => (
  <div className="flex w-full h-full items-center justify-between p-2 print:p-0">
    <div className="border-4 border-[#4FC3F7] rounded-[3rem] w-full h-full flex flex-row items-center p-4 relative overflow-hidden bg-white gap-6 shadow-lg">
      <div className="absolute top-0 left-0 w-4 h-full bg-[#4FC3F7]"></div>
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-[#E1F5FE] rounded-full opacity-50"></div>
      
      {/* Left: Logo & Title */}
      <div className="flex flex-col items-center justify-center gap-4 w-[45%] z-10">
        {school.logoUrl ? (
          <div className="bg-white p-4 rounded-3xl shadow-md border border-gray-100">
             <img src={school.logoUrl} alt="Logo" className="h-20 object-contain" />
          </div>
        ) : (
          <div className="h-20 w-20 bg-[#E1F5FE] border-4 border-[#4FC3F7] border-dashed flex items-center justify-center rounded-[2rem] text-[#0288D1] text-xs shrink-0">
             <Printer className="w-10 h-10" />
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#01579B] uppercase tracking-tight leading-tight">{school.name}</h1>
          <h2 className="text-xs text-gray-500 uppercase tracking-[0.2em] font-black mt-1">{school.subtitle || 'Educação e Transformação'}</h2>
        </div>
      </div>
      
      {/* Right: Info */}
      <div className="flex-1 space-y-4 z-10 border-l-2 border-gray-100 pl-8 py-2">
        <div className="flex flex-col">
          <span className="text-xs font-black text-[#0288D1] uppercase tracking-[0.3em] leading-none mb-2">Carnê de Pagamento</span>
          <span className="text-3xl font-black text-gray-900 leading-none">ANO LETIVO {year}</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="flex flex-col border-l-4 border-[#4FC3F7] pl-4">
            <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1.5">Aluno(a)</span>
            <span className="font-black text-gray-900 text-xl uppercase truncate">{student.name || '__________________'}</span>
          </div>
          
          <div className="flex flex-col border-l-4 border-[#4FC3F7] pl-4">
            <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1.5">Grupo / Turma</span>
            <span className="font-black text-gray-900 text-xl uppercase truncate">{student.turma || '__________________'}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t-2 border-gray-50 mt-2">
          <div className="text-[10px] text-gray-400 w-full leading-tight font-bold">
            {school.address} {school.cnpj ? `| CNPJ: ${school.cnpj}` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function CarneView({ students, financialRecords, schoolInfo }: CarneViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [config, setConfig] = useState({
    value: '',
    startMonth: new Date().getMonth(),
    startYear: new Date().getFullYear(),
    totalInstallments: 12,
    dueDay: '10'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  useEffect(() => {
    if (selectedStudentId) {
      const studentRecords = financialRecords.filter(r => r.studentId === selectedStudentId && r.type === 'tuition');
      if (studentRecords.length > 0) {
        setConfig(prev => ({ ...prev, value: studentRecords[0].amount.toFixed(2) }));
      } else {
        setConfig(prev => ({ ...prev, value: '0.00' }));
      }
    }
  }, [selectedStudentId, financialRecords]);

  const getInstallments = () => {
    const installments = [];
    for (let i = 0; i < config.totalInstallments; i++) {
       const monthIdx = (config.startMonth + i) % 12;
       const yearOffset = Math.floor((config.startMonth + i) / 12);
       installments.push({
         monthName: months[monthIdx],
         year: config.startYear + yearOffset,
         num: i + 1
       });
    }
    return installments;
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-transparent print:bg-white print:p-0">
      
      {/* Editor UI - Hidden when printing */}
      <div className="print:hidden space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-black text-[#01579B]">Emissor de Carnês 🎫</h2>
            <p className="text-[#546E7A] font-bold">Gere os carnês de pagamento com o novo padrão ampliado.</p>
          </div>
          <button 
            onClick={handlePrint}
            disabled={!selectedStudentId}
            className={`px-8 py-4 rounded-[32px] font-black border-b-8 shadow-xl flex items-center gap-3 transition-all ${
              selectedStudentId 
              ? 'bg-[#FF8A65] text-white border-[#D84315] hover:scale-105 active:translate-y-1' 
              : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
          >
            <Printer className="w-6 h-6" />
            <span>IMPRIMIR CARNÊ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Selector and Config */}
          <div className="lg:col-span-4 space-y-8">
            {/* Student Selector */}
            <div className="bg-white rounded-[40px] border-4 border-[#4FC3F7] p-8 shadow-xl">
              <h3 className="text-xl font-black text-[#01579B] mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-[#4FC3F7]" /> Selecionar Aluno
              </h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Procurar aluno..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F5FBFF] border-2 border-[#E1F5FE] rounded-2xl pl-12 pr-4 py-4 font-bold outline-none focus:border-[#4FC3F7] transition-all"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      selectedStudentId === student.id 
                      ? 'bg-[#E1F5FE] border-[#4FC3F7] shadow-inner' 
                      : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-black ${selectedStudentId === student.id ? 'text-[#01579B]' : 'text-gray-700'}`}>{student.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{student.turma} • ID: {student.id}</span>
                    </div>
                    {selectedStudentId === student.id && <CheckCircle2 className="w-5 h-5 text-[#4FC3F7]" />}
                  </button>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-400 font-bold italic">Nenhum aluno encontrado</div>
                )}
              </div>
            </div>

            {/* Config Box */}
            <div className="bg-white rounded-[40px] border-4 border-[#FF8A65] p-8 shadow-xl">
              <h3 className="text-xl font-black text-[#D84315] mb-6 flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-[#FF8A65]" /> Configuração
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Valor Mensal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#D84315]">R$</span>
                    <input 
                      type="text" 
                      value={config.value}
                      onChange={e => setConfig({...config, value: e.target.value})}
                      className="w-full bg-[#FBE9E7]/50 border-2 border-[#FFCCBC] rounded-2xl pl-12 pr-4 py-4 font-black text-xl text-[#D84315] outline-none focus:border-[#FF8A65] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Dia Vcto</label>
                    <input 
                      type="text" 
                      value={config.dueDay}
                      onChange={e => setConfig({...config, dueDay: e.target.value})}
                      className="w-full bg-[#FBE9E7]/50 border-2 border-[#FFCCBC] rounded-2xl px-4 py-4 font-black text-center text-xl text-[#D84315] outline-none focus:border-[#FF8A65]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Parcelas</label>
                    <input 
                      type="number" 
                      value={config.totalInstallments}
                      onChange={e => setConfig({...config, totalInstallments: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#FBE9E7]/50 border-2 border-[#FFCCBC] rounded-2xl px-4 py-4 font-black text-center text-xl text-[#D84315] outline-none focus:border-[#FF8A65]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Início (Mês)</label>
                    <select 
                      value={config.startMonth}
                      onChange={e => setConfig({...config, startMonth: parseInt(e.target.value)})}
                      className="w-full bg-[#FBE9E7]/50 border-2 border-[#FFCCBC] rounded-2xl px-4 py-4 font-black text-sm text-[#D84315] outline-none focus:border-[#FF8A65]"
                    >
                      {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Ano</label>
                    <input 
                      type="number" 
                      value={config.startYear}
                      onChange={e => setConfig({...config, startYear: parseInt(e.target.value) || 2024})}
                      className="w-full bg-[#FBE9E7]/50 border-2 border-[#FFCCBC] rounded-2xl px-4 py-4 font-black text-center text-xl text-[#D84315] outline-none focus:border-[#FF8A65]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#01579B] rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full" />
               <h4 className="font-black text-lg mb-4 flex items-center gap-2 italic">
                 <Info className="w-5 h-5 text-[#4FC3F7]" /> Dicas de Impressão
               </h4>
               <ul className="space-y-3 text-xs font-bold text-blue-100">
                 <li className="flex gap-2">
                   <div className="w-5 h-5 bg-[#4FC3F7] rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                   <span>Use papel A4 em orientação Retrato (Vertical).</span>
                 </li>
                 <li className="flex gap-2">
                   <div className="w-5 h-5 bg-[#4FC3F7] rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                   <span>Habilite "Gráficos de segundo plano".</span>
                 </li>
                 <li className="flex gap-2">
                   <div className="w-5 h-5 bg-[#4FC3F7] rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                   <span>O novo layout de 3 por folha garante visibilidade máxima!</span>
                 </li>
               </ul>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[#546E7A] uppercase text-xs tracking-[0.3em] flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" /> Visualização em Tempo Real
              </h3>
              <div className="bg-[#81C784] text-white px-4 py-1 rounded-full text-[10px] font-black shadow-lg">PADRÃO 3 POR PÁGINA ATIVO</div>
            </div>

            {!selectedStudent ? (
              <div className="w-full aspect-[21/29.7] bg-white rounded-[3rem] border-8 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 shadow-inner">
                <Printer className="w-20 h-20 mb-4 opacity-20" />
                <p className="font-black text-xl italic uppercase tracking-widest">Aguardando seleção do aluno</p>
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded-[4rem] shadow-2xl overflow-auto max-h-[80vh] border-8 border-white">
                <div className="w-full bg-white shadow-lg mx-auto overflow-hidden rounded-[2rem]">
                  {/* Real Preview Content */}
                  <div className="flex flex-col">
                    {/* Capa */}
                    <div className="h-[98mm] w-full border-b-4 border-dashed border-[#4FC3F7]/30 flex items-center justify-center bg-white">
                      <CoverSheet 
                        school={schoolInfo} 
                        student={selectedStudent} 
                        year={config.startYear} 
                      />
                    </div>
                    
                    {/* Installments */}
                    {getInstallments().map((inst, index) => (
                      <div key={index} className="h-[98mm] w-full border-b-4 border-dashed border-[#4FC3F7]/30 flex relative bg-white">
                        <Via 
                          school={schoolInfo}
                          student={selectedStudent}
                          value={config.value} 
                          monthName={inst.monthName} 
                          year={inst.year}
                          installmentNum={inst.num}
                          totalInstallments={config.totalInstallments}
                          dueDay={config.dueDay}
                          isCanhoto={true} 
                        />
                        
                        <div className="relative flex flex-col justify-center items-center w-0 z-10">
                           <div className="border-l-4 border-gray-200 h-full absolute"></div>
                           <div className="bg-white p-2 rounded-full absolute -ml-[18px] text-gray-400 border-2 border-gray-200">
                             <Scissors className="w-4 h-4" />
                           </div>
                        </div>

                        <Via 
                          school={schoolInfo}
                          student={selectedStudent}
                          value={config.value} 
                          monthName={inst.monthName} 
                          year={inst.year}
                          installmentNum={inst.num}
                          totalInstallments={config.totalInstallments}
                          dueDay={config.dueDay}
                          isCanhoto={false} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT VIEW - Only visible when printing */}
      <div className="hidden print:block print:m-0 print:p-0">
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white !important;
            }
            .print-page {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              page-break-after: always;
              margin: 0;
              padding: 0;
              background: white;
            }
            .print-item {
              height: 99mm; 
              width: 100%;
              display: flex;
              box-sizing: border-box;
              overflow: hidden;
              border-bottom: 1px dashed #eee;
              position: relative;
            }
            .print-item:last-child {
              border-bottom: none;
            }
            .print-hidden {
              display: none !important;
            }
          }
        `}</style>
        
        {selectedStudent && (
          <>
            {/* Logic to group installments by 3 */}
            {(() => {
              const items = [
                { type: 'cover' },
                ...getInstallments().map(inst => ({ type: 'installment', inst }))
              ];
              const pages = [];
              for (let i = 0; i < items.length; i += 3) {
                pages.push(items.slice(i, i + 3));
              }
              
              return pages.map((pageItems, pageIdx) => (
                <div key={pageIdx} className="print-page">
                  {pageItems.map((item, itemIdx) => (
                    <div key={itemIdx} className="print-item">
                      {item.type === 'cover' ? (
                        <CoverSheet 
                          school={schoolInfo} 
                          student={selectedStudent} 
                          year={config.startYear} 
                        />
                      ) : (
                        <>
                          <Via 
                            school={schoolInfo}
                            student={selectedStudent}
                            value={config.value} 
                            monthName={item.inst.monthName} 
                            year={item.inst.year}
                            installmentNum={item.inst.num}
                            totalInstallments={config.totalInstallments}
                            dueDay={config.dueDay}
                            isCanhoto={true} 
                          />
                          <Via 
                            school={schoolInfo}
                            student={selectedStudent}
                            value={config.value} 
                            monthName={item.inst.monthName} 
                            year={item.inst.year}
                            installmentNum={item.inst.num}
                            totalInstallments={config.totalInstallments}
                            dueDay={config.dueDay}
                            isCanhoto={false} 
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ));
            })()}
          </>
        )}
      </div>
    </div>
  );
}
