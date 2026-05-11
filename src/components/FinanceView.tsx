import { useState, useEffect } from 'react';
import { 
  DollarSign, FileText, Download, CheckCircle2, AlertCircle, Clock, 
  Printer, X, TrendingUp, TrendingDown, Wallet, Users, Package, 
  Plus, Calendar, ChevronRight, Calculator, Search, Filter, Percent
} from 'lucide-react';
import { FinancialRecord, Student, Teacher, Expense, Payroll, Class } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface FinanceViewProps {
  records: FinancialRecord[];
  setRecords: (r: FinancialRecord[]) => void;
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
}

export default function FinanceView({ records, setRecords, students, teachers, classes }: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'incomes' | 'expenses' | 'payroll' | 'student_panel'>('dashboard');
  const [selectedDoc, setSelectedDoc] = useState<{ type: string; record: any } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filtros para Painel do Aluno
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentStatement, setStudentStatement] = useState<FinancialRecord[]>([]);

  // Load additional data
  useEffect(() => {
    async function loadFinanceData() {
      const { data: expData } = await supabase.from('expenses').select('*').order('due_date', { ascending: false });
      if (expData) setExpenses(expData as any);

      const { data: payData } = await supabase.from('payroll').select('*').order('reference_month', { ascending: false });
      if (payData) setPayrolls(payData as any);
    }
    loadFinanceData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      const studentRecords = records.filter(r => r.studentId === selectedStudentId);
      setStudentStatement(studentRecords.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    } else {
      setStudentStatement([]);
    }
  }, [selectedStudentId, records]);

  const totalIncomes = records.filter(r => r.status === 'paid').reduce((acc, curr) => acc + (curr.amount - (curr.discount || 0)), 0);
  const pendingIncomes = records.filter(r => r.status !== 'paid').reduce((acc, curr) => acc + (curr.amount - (curr.discount || 0)), 0);
  const totalExpenses = expenses.filter(e => e.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const ebitda = totalIncomes - totalExpenses;

  const handleGenerateTuition = async () => {
    if (!confirm('Deseja gerar as mensalidades de todos os alunos para o próximo mês?')) return;
    
    setIsGenerating(true);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-10`;

    const newRecords = students.map(student => {
      const studentClass = classes.find(c => c.name === student.turma);
      return {
        student_id: student.id,
        type: 'tuition',
        amount: studentClass?.tuitionFee || 850.00,
        due_date: dueDate,
        status: 'pending'
      };
    });

    try {
      const { data, error } = await supabase.from('financial_records').insert(newRecords).select();
      if (error) throw error;
      if (data) {
        setRecords([...records, ...data as any]);
        alert('Mensalidades geradas com sucesso! 🚀');
      }
    } catch (error: any) {
      alert('Erro ao gerar mensalidades: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsPaid = async (id: string, table: string = 'financial_records') => {
    const { error } = await supabase.from(table).update({ status: 'paid' }).eq('id', id);
    if (!error) {
      if (table === 'financial_records') {
        setRecords(records.map(r => r.id === id ? { ...r, status: 'paid' } : r));
      } else if (table === 'expenses') {
        setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'paid' } : e));
      }
      alert('Pagamento registrado com sucesso! 💰');
    }
  };

  const applyDiscount = async (record: FinancialRecord) => {
    const discountStr = prompt(`Informe o valor do desconto para esta mensalidade (Valor atual: R$ ${record.amount.toFixed(2)}):`, "0");
    if (discountStr === null) return;
    const discount = parseFloat(discountStr);
    if (isNaN(discount)) return;

    const { error } = await supabase.from('financial_records').update({ discount }).eq('id', record.id);
    if (!error) {
      setRecords(records.map(r => r.id === record.id ? { ...r, discount } : r));
      alert('Desconto aplicado com sucesso! 🏷️');
    }
  };

  const filteredStudents = students.filter(s => !selectedTurma || s.turma === selectedTurma);

  return (
    <div className="space-y-10">
      {/* Header com Tabs */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Gestão Financeira 💰</h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {(['dashboard', 'incomes', 'expenses', 'payroll', 'student_panel'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-[#4FC3F7] text-white shadow-lg scale-105' 
                    : 'bg-white text-gray-400 hover:text-[#4FC3F7]'
                }`}
              >
                {tab === 'dashboard' ? 'Visão Geral' : 
                 tab === 'incomes' ? 'Receitas' : 
                 tab === 'expenses' ? 'Despesas' : 
                 tab === 'payroll' ? 'Folha' : 'Painel do Aluno'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleGenerateTuition}
            disabled={isGenerating}
            className="px-6 py-4 bg-[#BA68C8] text-white rounded-[24px] font-black border-b-8 border-[#7B1FA2] shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Calculator className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>GERAR MENSALIDADES</span>
          </button>
          <button className="px-6 py-4 bg-[#FF8A65] text-white rounded-[24px] font-black border-b-8 border-[#D84315] shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
            <Download className="w-5 h-5" />
            <span>RELATÓRIO PDF</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* EBITDA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-[#81C784] p-8 rounded-[40px] border-4 border-[#388E3C] shadow-lg text-white">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">📈</span>
                  <TrendingUp className="text-white/50" />
                </div>
                <p className="text-white/80 text-xs font-black uppercase tracking-wider">Receitas (Efetivadas)</p>
                <p className="text-3xl font-black mt-1">R$ {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-[#FF5252] p-8 rounded-[40px] border-4 border-[#D50000] shadow-lg text-white">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">📉</span>
                  <TrendingDown className="text-white/50" />
                </div>
                <p className="text-white/80 text-xs font-black uppercase tracking-wider">Despesas (Pagas)</p>
                <p className="text-3xl font-black mt-1">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-[#4FC3F7] p-8 rounded-[40px] border-4 border-[#0288D1] shadow-lg text-white">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">📊</span>
                  <TrendingUp className="text-white/50" />
                </div>
                <p className="text-white/80 text-xs font-black uppercase tracking-wider">EBITDA (Saldo)</p>
                <p className="text-3xl font-black mt-1">R$ {ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-[#FFF176] p-8 rounded-[40px] border-4 border-[#FBC02D] shadow-lg text-[#5D4037]">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">⏳</span>
                  <Clock className="text-[#8D6E63]/30" />
                </div>
                <p className="text-[#8D6E63] text-xs font-black uppercase tracking-wider">Inadimplência Provável</p>
                <p className="text-3xl font-black mt-1">R$ {pendingIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* EBITDA Chart Mockup */}
            <div className="bg-white p-10 rounded-[48px] border-8 border-[#E1F5FE] shadow-2xl">
              <h3 className="text-2xl font-black text-[#01579B] mb-8 flex items-center gap-3">
                <TrendingUp className="text-[#4FC3F7]" /> Projeção de Fluxo de Caixa (EBITDA)
              </h3>
              <div className="h-64 flex items-end gap-4 px-4 border-b-4 border-[#E1F5FE]">
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'].map((month, i) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-[#E1F5FE] rounded-t-2xl relative overflow-hidden" style={{ height: `${40 + (i * 10)}%` }}>
                      <div className="absolute bottom-0 w-full bg-[#4FC3F7] rounded-t-2xl transition-all group-hover:brightness-110" style={{ height: `${60 + (Math.sin(i) * 20)}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-[#78909C] uppercase">{month}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-[#90A4AE] font-bold text-center italic">Representação visual baseada nas receitas recorrentes e gastos fixos previstos.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'incomes' && (
          <motion.div 
            key="incomes"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[48px] border-8 border-[#4FC3F7] shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#E1F5FE] text-[#0277BD] text-xs uppercase font-black tracking-widest border-b-4 border-[#4FC3F7]">
                    <th className="px-10 py-6">Aluno</th>
                    <th className="px-10 py-6">Tipo</th>
                    <th className="px-10 py-6">Valor</th>
                    <th className="px-10 py-6">Vencimento</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-[#E1F5FE]">
                  {records.map(rec => {
                    const student = students.find(s => s.id === rec.studentId);
                    return (
                      <tr key={rec.id} className="hover:bg-[#F5FBFF] transition-colors">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E1F5FE] rounded-full flex items-center justify-center text-xl shadow-inner">
                              {student?.photoUrl ? <img src={student.photoUrl} className="w-full h-full rounded-full object-cover" /> : '👤'}
                            </div>
                            <span className="font-black text-[#01579B]">{student?.name || `Aluno #${rec.studentId}`}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-gray-500 font-bold capitalize">{rec.type === 'tuition' ? 'Mensalidade' : 'Taxa'}</td>
                        <td className="px-10 py-6 font-black text-lg">
                          <div className="flex flex-col">
                            <span>R$ {(rec.amount - (rec.discount || 0)).toFixed(2)}</span>
                            {rec.discount && <span className="text-[10px] text-red-400 line-through">R$ {rec.amount.toFixed(2)}</span>}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-gray-400">{rec.dueDate}</td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border-2 flex items-center w-fit gap-1 ${
                            rec.status === 'paid' ? 'bg-[#81C784]/20 text-[#2E7D32] border-[#81C784]' :
                            rec.status === 'pending' ? 'bg-[#FFF176]/20 text-[#F57C00] border-[#FFF176]' :
                            'bg-[#FF5252]/20 text-[#D50000] border-[#FF5252]'
                          }`}>
                            {rec.status === 'paid' ? 'PAGO ✅' : rec.status === 'pending' ? 'PENDENTE ⏳' : 'ATRASADO ⚠️'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right space-x-3">
                          {rec.status !== 'paid' && (
                            <button 
                              onClick={() => markAsPaid(rec.id)}
                              className="p-3 bg-[#81C784] hover:brightness-110 text-white rounded-2xl border-b-4 border-[#388E3C] transition-all font-black text-[10px] shadow-md uppercase"
                            >
                              BAIXAR
                            </button>
                          )}
                          <button className="p-3 bg-[#FFF176] hover:brightness-110 text-[#5D4037] rounded-2xl border-b-4 border-[#FBC02D] transition-all font-black text-[10px] shadow-md uppercase">PIX/ONLINE</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'student_panel' && (
          <motion.div 
            key="student_panel"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Seleção de Aluno */}
            <div className="bg-white p-8 rounded-[48px] border-8 border-[#4FC3F7] shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Selecione a Turma</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4FC3F7] w-5 h-5" />
                  <select 
                    value={selectedTurma} 
                    onChange={e => { setSelectedTurma(e.target.value); setSelectedStudentId(''); }}
                    className="w-full pl-12 pr-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-black text-[#01579B] outline-none focus:border-[#4FC3F7] appearance-none"
                  >
                    <option value="">Todas as Turmas</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Selecione o Aluno</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4FC3F7] w-5 h-5" />
                  <select 
                    value={selectedStudentId} 
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-[#F5FBFF] border-4 border-[#E1F5FE] rounded-[24px] font-black text-[#01579B] outline-none focus:border-[#4FC3F7] appearance-none"
                  >
                    <option value="">Escolha um aluno...</option>
                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {selectedStudentId && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-white rounded-[48px] border-8 border-[#4FC3F7] shadow-2xl overflow-hidden">
                  <div className="bg-[#E1F5FE] p-6 flex items-center justify-between border-b-4 border-[#4FC3F7]">
                    <h3 className="text-xl font-black text-[#01579B] flex items-center gap-2">
                      <FileText className="w-6 h-6" /> Extrato Financeiro Anual
                    </h3>
                    <div className="flex gap-3">
                      <button className="bg-[#81C784] text-white px-6 py-2 rounded-full font-black text-[10px] border-b-4 border-[#388E3C] uppercase">DAR BAIXA EM LOTE</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b-2">
                          <th className="px-10 py-4">Parcela/Vencimento</th>
                          <th className="px-10 py-4">Valor Original</th>
                          <th className="px-10 py-4">Desconto</th>
                          <th className="px-10 py-4">Valor Final</th>
                          <th className="px-10 py-4">Status</th>
                          <th className="px-10 py-4 text-right">Gerenciar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2">
                        {studentStatement.map((rec, i) => (
                          <tr key={rec.id} className="hover:bg-gray-50">
                            <td className="px-10 py-6">
                              <p className="font-black text-[#01579B]">{i + 1}ª Mensalidade</p>
                              <p className="text-xs font-bold text-gray-400">{new Date(rec.dueDate).toLocaleDateString('pt-BR')}</p>
                            </td>
                            <td className="px-10 py-6 font-bold text-gray-400 text-sm">R$ {rec.amount.toFixed(2)}</td>
                            <td className="px-10 py-6 font-black text-red-400 text-sm">
                              {rec.discount ? `- R$ ${rec.discount.toFixed(2)}` : '---'}
                            </td>
                            <td className="px-10 py-6 font-black text-lg text-[#01579B]">
                              R$ {(rec.amount - (rec.discount || 0)).toFixed(2)}
                            </td>
                            <td className="px-10 py-6">
                              <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border-2 ${
                                rec.status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                              }`}>
                                {rec.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                              </span>
                            </td>
                            <td className="px-10 py-6 text-right space-x-2">
                              {rec.status !== 'paid' && (
                                <>
                                  <button onClick={() => applyDiscount(rec)} className="p-2 bg-[#BA68C8] text-white rounded-lg border-b-4 border-[#7B1FA2] hover:scale-110 transition-all"><Percent className="w-4 h-4" /></button>
                                  <button onClick={() => markAsPaid(rec.id)} className="p-2 bg-[#81C784] text-white rounded-lg border-b-4 border-[#388E3C] hover:scale-110 transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                                </>
                              )}
                              <button className="p-2 bg-[#4FC3F7] text-white rounded-lg border-b-4 border-[#0288D1] hover:scale-110 transition-all"><Printer className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'expenses' && (
          <motion.div 
            key="expenses"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border-4 border-[#FF5252]">
               <h3 className="text-xl font-black text-[#D50000] flex items-center gap-2">
                 <Package className="w-6 h-6" /> Registro de Saídas (Compras e Serviços)
               </h3>
               <button className="bg-[#FF5252] text-white px-6 py-2 rounded-full font-black text-xs border-b-4 border-[#D50000] flex items-center gap-2">
                 <Plus className="w-4 h-4" /> LANÇAR DESPESA
               </button>
            </div>

            <div className="bg-white rounded-[48px] border-8 border-[#FFCDD2] shadow-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FFEBEE] text-[#D32F2F] text-xs uppercase font-black tracking-widest border-b-4 border-[#FFCDD2]">
                    <th className="px-10 py-6">Descrição</th>
                    <th className="px-10 py-6">Categoria</th>
                    <th className="px-10 py-6">Valor</th>
                    <th className="px-10 py-6">Vencimento</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-[#FFEBEE]">
                  {expenses.length > 0 ? expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-[#FFF5F5] transition-colors">
                      <td className="px-10 py-6 font-black text-[#D32F2F]">{exp.description}</td>
                      <td className="px-10 py-6"><span className="bg-[#FFCDD2] text-[#C62828] px-3 py-1 rounded-full text-[10px] font-black uppercase">{exp.category}</span></td>
                      <td className="px-10 py-6 font-black">R$ {exp.amount.toFixed(2)}</td>
                      <td className="px-10 py-6 text-gray-400 font-bold">{exp.due_date}</td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border-2 ${
                          exp.status === 'paid' ? 'bg-[#81C784]/20 text-[#2E7D32] border-[#81C784]' : 'bg-[#FF8A65]/20 text-[#D84315] border-[#FF8A65]'
                        }`}>
                          {exp.status === 'paid' ? 'PAGO ✅' : 'PENDENTE ⏳'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {exp.status !== 'paid' && (
                          <button onClick={() => markAsPaid(exp.id, 'expenses')} className="p-2 bg-[#81C784] text-white rounded-xl font-black text-[10px] border-b-4 border-[#388E3C]">BAIXAR</button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-10 py-20 text-center text-gray-300 font-black italic">Nenhuma despesa lançada</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'payroll' && (
          <motion.div 
            key="payroll"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border-4 border-[#BA68C8]">
               <h3 className="text-xl font-black text-[#7B1FA2] flex items-center gap-2">
                 <Users className="w-6 h-6" /> Folha de Pagamento (Professores)
               </h3>
               <button className="bg-[#BA68C8] text-white px-6 py-2 rounded-full font-black text-xs border-b-4 border-[#7B1FA2] flex items-center gap-2">
                 <Calculator className="w-4 h-4" /> GERAR FOLHA DO MÊS
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teachers.map(teacher => (
                <div key={teacher.id} className="bg-white p-8 rounded-[48px] border-4 border-[#F3E5F5] shadow-xl hover:border-[#BA68C8] transition-all group">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-[#F3E5F5] rounded-3xl border-4 border-[#BA68C8] flex items-center justify-center text-3xl shadow-inner">
                      {teacher.photoUrl ? <img src={teacher.photoUrl} className="w-full h-full rounded-3xl object-cover" /> : '👩‍🏫'}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-[#4A148C]">{teacher.name}</h4>
                      <p className="text-xs text-[#9C27B0] font-black uppercase tracking-widest">{teacher.subject}</p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-[#F9F4FB] p-6 rounded-[32px] border-2 border-dashed border-[#CE93D8]">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#7B1FA2]">Salário Base</span>
                      <span className="font-black">R$ 3.500,00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#81C784]">Bônus/Gratif.</span>
                      <span className="font-black">+ R$ 200,00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#FF5252]">Descontos</span>
                      <span className="font-black">- R$ 380,00</span>
                    </div>
                    <div className="pt-4 border-t-2 border-[#E1BEE7] flex justify-between items-center">
                      <span className="font-black text-[#4A148C] uppercase">Líquido</span>
                      <span className="text-2xl font-black text-[#7B1FA2]">R$ 3.320,00</span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => setSelectedDoc({ type: 'holerite', record: { teacher, amount: 3320 } })}
                      className="flex-1 py-4 bg-[#F3E5F5] text-[#7B1FA2] rounded-2xl font-black border-b-6 border-[#CE93D8] flex items-center justify-center gap-2 hover:bg-[#BA68C8] hover:text-white transition-all"
                    >
                      <FileText className="w-5 h-5" /> VER HOLERITE
                    </button>
                    <button className="py-4 px-6 bg-[#81C784] text-white rounded-2xl font-black border-b-6 border-[#388E3C] shadow-lg">PAGAR ✅</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Documentos */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] border-8 border-[#4FC3F7] p-10 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedDoc(null)}
                className="absolute top-6 right-6 p-2 bg-[#E1F5FE] text-[#0288D1] rounded-full hover:rotate-90 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b-4 border-[#E1F5FE] pb-6">
                  <div className="w-16 h-16 bg-[#4FC3F7] rounded-2xl flex items-center justify-center text-4xl">🏢</div>
                  <div>
                    <h3 className="text-2xl font-black text-[#01579B] uppercase">Escola Primeiras Descobertas</h3>
                    <p className="text-xs font-bold text-gray-400">CNPJ: 00.000.000/0001-00</p>
                  </div>
                </div>

                <div className="text-center py-4 bg-[#F5FBFF] rounded-[32px] border-4 border-[#E1F5FE]">
                  <h4 className="text-xl font-black text-[#01579B] uppercase tracking-widest">
                    {selectedDoc.type === 'holerite' ? 'Demonstrativo de Pagamento (Holerite)' : 'Recibo de Pagamento'}
                  </h4>
                  <p className="font-bold text-[#4FC3F7]">Mês de Referência: Maio/2026</p>
                </div>

                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div>
                    <p className="font-black text-gray-300 uppercase text-[10px]">Beneficiário</p>
                    <p className="font-black text-[#01579B] text-lg">{selectedDoc.type === 'holerite' ? selectedDoc.record.teacher.name : `Aluno #${selectedDoc.record.studentId}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-300 uppercase text-[10px]">Data de Emissão</p>
                    <p className="font-black text-[#01579B] text-lg">11/05/2026</p>
                  </div>
                </div>

                <div className="border-4 border-[#E1F5FE] rounded-[32px] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#E1F5FE] text-[#01579B] font-black">
                        <th className="p-4 text-left">Descrição</th>
                        <th className="p-4 text-right">Vencimentos</th>
                        <th className="p-4 text-right">Descontos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#E1F5FE]">
                      {selectedDoc.type === 'holerite' ? (
                        <>
                          <tr>
                            <td className="p-4 font-bold text-gray-600">Salário Base (30 dias)</td>
                            <td className="p-4 text-right font-black">3.500,00</td>
                            <td className="p-4 text-right">0,00</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-bold text-gray-600">INSS</td>
                            <td className="p-4 text-right">0,00</td>
                            <td className="p-4 text-right font-black">280,00</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-bold text-gray-600">FGTS</td>
                            <td className="p-4 text-right">0,00</td>
                            <td className="p-4 text-right font-black">100,00</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td className="p-4 font-bold text-gray-600">Mensalidade Escolar</td>
                          <td className="p-4 text-right font-black">{(selectedDoc.record.amount - (selectedDoc.record.discount || 0)).toFixed(2)}</td>
                          <td className="p-4 text-right">0,00</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#F5FBFF] font-black text-[#01579B] border-t-4 border-[#E1F5FE]">
                        <td className="p-4 uppercase">Total Líquido</td>
                        <td colSpan={2} className="p-4 text-right text-2xl font-black">
                          R$ {selectedDoc.type === 'holerite' ? '3.120,00' : (selectedDoc.record.amount - (selectedDoc.record.discount || 0)).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="pt-8 flex gap-4 no-print">
                  <button onClick={() => setSelectedDoc(null)} className="flex-1 py-4 bg-gray-100 text-[#78909C] rounded-[24px] font-black border-b-6 border-gray-300">FECHAR</button>
                  <button onClick={() => window.print()} className="flex-1 py-4 bg-[#81C784] text-white rounded-[24px] font-black border-b-6 border-[#388E3C] shadow-lg flex items-center justify-center gap-2">
                    <Printer className="w-5 h-5" /> IMPRIMIR
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
