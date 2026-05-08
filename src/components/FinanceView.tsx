import { useState } from 'react';
import { DollarSign, FileText, Download, CheckCircle2, AlertCircle, Clock, Printer, X } from 'lucide-react';
import { FinancialRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function FinanceView({ records, setRecords }: { records: FinancialRecord[], setRecords: (r: FinancialRecord[]) => void }) {
  const [selectedDoc, setSelectedDoc] = useState<{ type: string; record: FinancialRecord } | null>(null);

  const markAsPaid = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'paid' } : r));
    alert('Pagamento registrado e salvo com sucesso! 💰');
  };

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] border-8 border-[#4FC3F7] p-10 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedDoc(null)}
                className="absolute top-6 right-6 p-2 bg-[#E1F5FE] text-[#0288D1] rounded-full hover:rotate-90 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[#E1F5FE] rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-inner">
                  {selectedDoc.type === 'boleto' ? '📄' : '✅'}
                </div>
                <h3 className="text-3xl font-black text-[#01579B] uppercase italic">
                  {selectedDoc.type === 'boleto' ? 'Boleto Bancário' : 'Comprovante'}
                </h3>
                
                <div className="bg-[#F5FBFF] p-6 rounded-[32px] border-4 border-[#E1F5FE] text-left space-y-4">
                  <div className="flex justify-between border-b-2 border-dashed border-[#E1F5FE] pb-2">
                    <span className="font-bold text-gray-400">PAGADOR</span>
                    <span className="font-black text-[#01579B]">ALUNO #{selectedDoc.record.studentId}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-dashed border-[#E1F5FE] pb-2">
                    <span className="font-bold text-gray-400">VALOR</span>
                    <span className="font-black text-[#01579B]">R$ {selectedDoc.record.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-400">VENCIMENTO</span>
                    <span className="font-black text-[#01579B]">{selectedDoc.record.dueDate}</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button className="flex-1 py-4 bg-gray-100 text-[#78909C] rounded-[24px] font-black border-b-6 border-gray-300">FECHAR</button>
                  <button className="flex-1 py-4 bg-[#81C784] text-white rounded-[24px] font-black border-b-6 border-[#388E3C] shadow-lg flex items-center justify-center gap-2">
                    <Printer className="w-5 h-5" /> IMPRIMIR
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Gestão Financeira 💰</h2>
          <p className="text-[#546E7A] font-bold">Controle de porquinho e mensalidades.</p>
        </div>
        <button className="px-8 py-4 bg-[#FF8A65] text-white rounded-[32px] font-black border-b-8 border-[#D84315] shadow-xl flex items-center gap-2">
          <Download className="w-6 h-6" />
          <span>RELATÓRIO GERAL</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#81C784] p-8 rounded-[40px] border-4 border-[#388E3C] shadow-lg text-white">
          <p className="text-white/80 text-xs font-black uppercase tracking-wider">Recebido este mês</p>
          <p className="text-4xl font-black mt-2 drop-shadow-md">R$ 12.450</p>
        </div>
        <div className="bg-[#FFF176] p-8 rounded-[40px] border-4 border-[#FBC02D] shadow-lg text-[#5D4037]">
          <p className="text-[#8D6E63] text-xs font-black uppercase tracking-wider">Pendente</p>
          <p className="text-4xl font-black mt-2 drop-shadow-sm">R$ 3.200</p>
        </div>
        <div className="bg-[#FF8A65] p-8 rounded-[40px] border-4 border-[#D84315] shadow-lg text-white">
          <p className="text-white/80 text-xs font-black uppercase tracking-wider">Atrasado</p>
          <p className="text-4xl font-black mt-2 drop-shadow-md">R$ 850</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border-8 border-[#4FC3F7] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#E1F5FE] text-[#0277BD] text-xs uppercase font-black tracking-widest border-b-4 border-[#4FC3F7]">
                <th className="px-10 py-6">Estudante</th>
                <th className="px-10 py-6">O que é?</th>
                <th className="px-10 py-6">Valor</th>
                <th className="px-10 py-6">Dia</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-[#E1F5FE]">
              {records.map(rec => (
                <tr key={rec.id} className="hover:bg-[#F5FBFF] transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E1F5FE] rounded-full flex items-center justify-center text-xl shadow-inner">👤</div>
                      <span className="font-black text-[#01579B]">Aluno #{rec.studentId}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-gray-500 font-bold capitalize">{rec.type === 'tuition' ? 'Mensalidade' : 'Taxa'}</td>
                  <td className="px-10 py-6 font-black text-lg">R$ {rec.amount.toFixed(2)}</td>
                  <td className="px-10 py-6 text-sm font-bold text-gray-400">{rec.dueDate}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border-2 flex items-center w-fit gap-1 ${
                      rec.status === 'paid' ? 'bg-[#81C784]/20 text-[#2E7D32] border-[#81C784]' :
                      rec.status === 'pending' ? 'bg-[#FFF176]/20 text-[#F57C00] border-[#FFF176]' :
                      'bg-[#FF8A65]/20 text-[#D84315] border-[#FF8A65]'
                    }`}>
                      {rec.status === 'paid' ? 'PAGO ✅' : rec.status === 'pending' ? 'PENDENTE ⏳' : 'ATRASADO ⚠️'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right space-x-3">
                    {rec.status !== 'paid' ? (
                      <button 
                        onClick={() => markAsPaid(rec.id)}
                        className="p-3 bg-[#81C784] hover:brightness-110 text-white rounded-2xl border-2 border-white transition-all font-black text-xs shadow-md"
                      >
                        BAIXAR PAGAMENTO ✅
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedDoc({ type: 'comprovante', record: rec })}
                        className="p-3 bg-gray-50 hover:bg-[#4FC3F7] hover:text-white rounded-2xl text-gray-400 border-2 border-gray-100 transition-all font-black text-xs shadow-sm"
                      >
                        RECIBO
                      </button>
                    )}
                    <button className="p-3 bg-gray-50 hover:bg-[#81C784] hover:text-white rounded-2xl text-gray-400 border-2 border-gray-100 transition-all font-black text-xs shadow-sm">PIX</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
