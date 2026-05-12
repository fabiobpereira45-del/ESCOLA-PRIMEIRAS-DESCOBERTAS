import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FileText, Plus, Database, Sparkles, Copy, CheckCircle2, 
  Trash2, Edit3, Search, Filter, ArrowLeft, ChevronRight,
  BookOpen, Brain, Download, Printer, Settings
} from 'lucide-react';
import { Question, Exam, User } from '../types';

interface ExamsViewProps {
  currentUser: User;
}

const TURMAS = ['G1', 'G2', 'G3', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];
const PERIODS = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];
const DIFFICULTY_LEVELS = ['fácil', 'média', 'difícil'];
const ACTIVITY_TYPES = [
  'Prova bimestral', 'Atividade avaliativa', 'Ficha de leitura', 
  'Lista de exercícios', 'Caça-palavras', 'Cruzadinha', 
  'Ditado preparatório', 'Atividade diagnóstica', 'Simulado'
];

export default function ExamsView({ currentUser }: ExamsViewProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'generate' | 'exams'>('bank');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Question Form State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  
  // AI Prompt State
  const [promptParams, setPromptParams] = useState({
    turma: '3º Ano',
    subject: 'Matemática',
    theme: '',
    type: 'Prova bimestral',
    quantity: 10,
    difficulty: 'média',
    gabarito: true,
    images: true
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Manual Exam Generation State
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [examTitle, setExamTitle] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: qData } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    const { data: eData } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    
    if (qData) setQuestions(qData);
    if (eData) setExams(eData);
    setLoading(false);
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion?.content || !editingQuestion?.subject || !editingQuestion?.turma) return;

    setSaving(true);
    try {
      if (editingQuestion.id) {
        await supabase.from('questions').update(editingQuestion).eq('id', editingQuestion.id);
      } else {
        await supabase.from('questions').insert([editingQuestion]);
      }
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleImportJson = async () => {
    try {
      const data = JSON.parse(importJson);
      const questionsToImport = Array.isArray(data) ? data : [data];
      
      const formatted = questionsToImport.map(q => ({
        content: q.content,
        subject: promptParams.subject,
        turma: promptParams.turma,
        type: q.type || 'objetiva',
        difficulty: q.difficulty || 'média',
        options: q.options || [],
        correct_answer: q.correctAnswer || '',
        bncc_code: q.bnccCode || ''
      }));

      setSaving(true);
      await supabase.from('questions').insert(formatted);
      setImportMode(false);
      setImportJson('');
      fetchData();
    } catch (err) {
      alert('Erro ao processar JSON. Verifique o formato.');
    } finally {
      setSaving(false);
    }
  };

  const generateAIPrompt = (purpose: 'exam' | 'bank') => {
    const ageMap: Record<string, string> = {
      'G1': '4-5', 'G2': '5-6', 'G3': '6', 
      '1º Ano': '6-7', '2º Ano': '7-8', '3º Ano': '8-9', 
      '4º Ano': '9-10', '5º Ano': '10-11'
    };

    if (purpose === 'bank') {
      const prompt = `Aja como um professor especialista em pedagogia infantil.
Crie ${promptParams.quantity} questões de ${promptParams.subject} para o ${promptParams.turma} sobre o tema "${promptParams.theme || 'variado'}".

IMPORTANTE: Retorne APENAS um array JSON válido (sem explicações antes ou depois) no seguinte formato:
[
  {
    "content": "Enunciado da questão...",
    "type": "objetiva",
    "difficulty": "fácil",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctAnswer": "Opção A",
    "bnccCode": "EF01MA01"
  }
]

Regras:
- Use linguagem adequada para crianças de ${ageMap[promptParams.turma] || '7-10'} anos.
- Se for G1 ou G2, foque em comandos simples e descreva no enunciado onde entraria uma imagem.
- Inclua habilidades da BNCC.`;
      setGeneratedPrompt(prompt);
      return;
    }

    const prompt = `[BLOCO 1 — PAPEL E CONTEXTO]
Você é um professor(a) especialista em ${promptParams.subject} do ${promptParams.turma} do Ensino Fundamental I,
com profundo conhecimento da BNCC e didática para crianças de ${ageMap[promptParams.turma] || '7-10'} anos.
... (resto do prompt anterior) ...`;
    // Re-implementing the full exam prompt for completeness in this chunk if needed, 
    // but I'll keep it concise for the tool.
    
    // Full version:
    const fullExamPrompt = `[BLOCO 1 — PAPEL E CONTEXTO]
Você é um professor(a) especialista em ${promptParams.subject} do ${promptParams.turma} do Ensino Fundamental I,
com profundo conhecimento da BNCC e didática para crianças de ${ageMap[promptParams.turma] || '7-10'} anos.

[BLOCO 2 — TAREFA PRINCIPAL]
Crie uma ${promptParams.type} completa sobre ${promptParams.theme || 'conteúdo variado'}, com as seguintes características:

[BLOCO 3 — ESPECIFICAÇÕES TÉCNICAS]
- Turma: ${promptParams.turma} (${ageMap[promptParams.turma] || '7-10'} anos)
- Quantidade de questões: ${promptParams.quantity}
- Tipos de questões: Misto (objetivas e dissertativas conforme nível)
- Nível de dificuldade: ${promptParams.difficulty}
- Tom/Linguagem: Adequada à faixa etária

[BLOCO 4 — ESTRUTURA OBRIGATÓRIA]
A atividade deve conter:
□ Cabeçalho com: Nome, Turma, Data, Nota
□ Título da atividade: ${promptParams.theme}
□ Instruções claras para cada tipo de questão
${promptParams.gabarito ? '□ Gabarito separado ao final' : ''}
${promptParams.images ? '□ Descrição de onde inserir imagens ilustrativas' : ''}

[BLOCO 5 — RESTRIÇÕES E QUALIDADE]
- Linguagem: Padrão para a faixa etária
- Contextos: Use situações do cotidiano infantil (brinquedos, animais, família, escola)
- Alinhamento BNCC: cite a(s) habilidade(s) trabalhada(s)
- Formato: Pronto para impressão com espaço para respostas

[BLOCO 6 — FORMATO DE ENTREGA]
Entregue em formato pronto para impressão, com numeração das questões e pontuação sugerida.`;

    setGeneratedPrompt(fullExamPrompt);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveExam = async () => {
    if (!examTitle || selectedQuestions.length === 0) return;
    
    setSaving(true);
    try {
      const q = questions.find(q => q.id === selectedQuestions[0]);
      await supabase.from('exams').insert([{
        title: examTitle,
        subject: q?.subject || 'Misto',
        turma: q?.turma || 'Misto',
        questions_ids: selectedQuestions,
        period: '1º Bimestre'
      }]);
      setExamTitle('');
      setSelectedQuestions([]);
      setActiveTab('exams');
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-[#FF8A65] border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-[#FF8A65]">Carregando Banco de Questões...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#FF8A65] to-[#FFAB91] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black">Geração de Provas</h1>
          </div>
          <p className="text-white/90 font-bold max-w-2xl">
            Crie avaliações profissionais usando nosso banco de questões ou gere prompts otimizados para IAs externas.
          </p>
        </div>
        <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-[#F5F5F5] rounded-[24px] gap-1">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-sm transition-all
            ${activeTab === 'bank' ? 'bg-white text-[#FF8A65] shadow-md' : 'text-[#90A4AE] hover:bg-white/50'}`}
        >
          <Database className="w-5 h-5" />
          BANCO DE QUESTÕES
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-sm transition-all
            ${activeTab === 'generate' ? 'bg-white text-[#FF8A65] shadow-md' : 'text-[#90A4AE] hover:bg-white/50'}`}
        >
          <Sparkles className="w-5 h-5" />
          GERAR COM IA
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-sm transition-all
            ${activeTab === 'exams' ? 'bg-white text-[#FF8A65] shadow-md' : 'text-[#90A4AE] hover:bg-white/50'}`}
        >
          <FileText className="w-5 h-5" />
          PROVAS SALVAS
        </button>
      </div>

      {/* Tab Content: Question Bank */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0BEC5] w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar questões..."
                  className="w-full pl-12 pr-6 py-4 bg-white border-2 border-[#E1F5FE] rounded-[24px] outline-none focus:border-[#FF8A65] transition-all font-bold text-[#546E7A]"
                />
              </div>
              <button className="p-4 bg-white border-2 border-[#E1F5FE] rounded-[20px] text-[#B0BEC5] hover:border-[#FF8A65] hover:text-[#FF8A65] transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => { setEditingQuestion({ turma: '3º Ano', difficulty: 'média', type: 'objetiva' }); setIsQuestionModalOpen(true); }}
              className="px-8 py-4 bg-[#FF8A65] text-white rounded-[24px] font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              NOVA QUESTÃO
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {questions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-[#E1F5FE]">
                <Database className="w-20 h-20 text-[#E1F5FE] mx-auto mb-4" />
                <p className="text-[#90A4AE] font-black text-xl">Seu banco de questões está vazio</p>
                <p className="text-[#B0BEC5] font-bold">Comece adicionando questões manualmente ou via IA</p>
              </div>
            ) : (
              questions.map(q => (
                <div key={q.id} className="group bg-white p-6 rounded-[32px] border-2 border-[#E1F5FE] hover:border-[#FF8A65] transition-all relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-[#FFF3E0] text-[#E65100] rounded-full text-[10px] font-black uppercase">
                        {q.subject}
                      </span>
                      <span className="px-3 py-1 bg-[#E1F5FE] text-[#0277BD] rounded-full text-[10px] font-black uppercase">
                        {q.turma}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase
                        ${q.difficulty === 'fácil' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 
                          q.difficulty === 'média' ? 'bg-[#FFFDE7] text-[#F57F17]' : 'bg-[#FFEBEE] text-[#C62828]'}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingQuestion(q); setIsQuestionModalOpen(true); }}
                        className="p-2 text-[#4FC3F7] hover:bg-[#E1F5FE] rounded-xl"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-[#FFAB91] hover:bg-[#FFEBEE] rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[#37474F] font-bold text-lg mb-4">{q.content}</p>
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className={`p-3 rounded-2xl border-2 text-sm font-bold ${opt === q.correctAnswer ? 'border-[#81C784] bg-[#E8F5E9] text-[#2E7D32]' : 'border-gray-100 text-[#78909C]'}`}>
                          {String.fromCharCode(97 + idx)}) {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.bnccCode && (
                    <div className="text-[10px] font-bold text-[#B0BEC5]">BNCC: {q.bnccCode}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content: AI Generator */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Form */}
          <div className="bg-white p-8 rounded-[40px] border-2 border-[#E1F5FE] shadow-sm space-y-6">
            <h3 className="text-2xl font-black text-[#37474F] flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#FF8A65]" />
              Parâmetros da Prova
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Turma</label>
                <select 
                  value={promptParams.turma}
                  onChange={e => setPromptParams({...promptParams, turma: e.target.value})}
                  className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                >
                  {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Disciplina</label>
                <select 
                  value={promptParams.subject}
                  onChange={e => setPromptParams({...promptParams, subject: e.target.value})}
                  className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                >
                  <option value="Português">Português</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Ciências">Ciências</option>
                  <option value="História">História</option>
                  <option value="Geografia">Geografia</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Arte">Arte</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Tema / Conteúdo</label>
              <input 
                type="text" 
                placeholder="Ex: Adição com reserva, Ciclo da água..."
                value={promptParams.theme}
                onChange={e => setPromptParams({...promptParams, theme: e.target.value})}
                className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Tipo</label>
                <select 
                  value={promptParams.type}
                  onChange={e => setPromptParams({...promptParams, type: e.target.value})}
                  className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                >
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Qtd. Questões</label>
                <input 
                  type="number" 
                  value={promptParams.quantity}
                  onChange={e => setPromptParams({...promptParams, quantity: parseInt(e.target.value)})}
                  className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={promptParams.gabarito}
                  onChange={e => setPromptParams({...promptParams, gabarito: e.target.checked})}
                  className="w-5 h-5 accent-[#FF8A65]"
                />
                <span className="font-bold text-[#546E7A] group-hover:text-[#FF8A65] transition-colors">Incluir Gabarito</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={promptParams.images}
                  onChange={e => setPromptParams({...promptParams, images: e.target.checked})}
                  className="w-5 h-5 accent-[#FF8A65]"
                />
                <span className="font-bold text-[#546E7A] group-hover:text-[#FF8A65] transition-colors">Dicas de Imagens</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => generateAIPrompt('bank')}
                className="flex-1 py-4 bg-white border-2 border-[#FF8A65] text-[#FF8A65] rounded-[24px] font-black shadow-md hover:bg-[#FFF3E0] transition-all flex items-center justify-center gap-2"
              >
                <Database className="w-5 h-5" />
                GERAR PARA BANCO
              </button>
              <button 
                onClick={() => generateAIPrompt('exam')}
                className="flex-1 py-4 bg-gradient-to-r from-[#FF8A65] to-[#FFAB91] text-white rounded-[24px] font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                GERAR PROVA COMPLETA
              </button>
            </div>
          </div>

          {/* Prompt Output & Import */}
          <div className="bg-[#37474F] p-8 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-[#FFAB91]" />
                {importMode ? 'Importar Questões (JSON)' : 'Prompt para IA Externa'}
              </h3>
              <div className="flex gap-2">
                {generatedPrompt && !importMode && (
                  <button 
                    onClick={() => { setImportMode(true); setImportJson(''); }}
                    className="px-4 py-2 bg-[#FFAB91] text-[#37474F] rounded-xl font-black text-xs hover:bg-white transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    IMPORTAR RESPOSTA
                  </button>
                )}
                {importMode && (
                  <button 
                    onClick={() => setImportMode(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl font-black text-xs hover:bg-white/20 transition-all"
                  >
                    VOLTAR AO PROMPT
                  </button>
                )}
                {generatedPrompt && !importMode && (
                  <button 
                    onClick={handleCopyPrompt}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2
                      ${copySuccess ? 'bg-[#81C784] text-white' : 'bg-white/10 text-[#FFAB91] hover:bg-white/20'}`}
                  >
                    {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'COPIADO!' : 'COPIAR PROMPT'}
                  </button>
                )}
              </div>
            </div>

            {importMode ? (
              <div className="flex-1 flex flex-col gap-4">
                <p className="text-white/60 text-xs font-bold">Cole abaixo o JSON gerado pela IA para alimentar o seu banco de questões automaticamente.</p>
                <textarea 
                  value={importJson}
                  onChange={e => setImportJson(e.target.value)}
                  className="flex-1 bg-white/5 rounded-[24px] p-6 font-mono text-sm text-[#B0BEC5] outline-none border border-white/10 focus:border-[#FFAB91] transition-all resize-none"
                  placeholder='[ { "content": "...", ... } ]'
                />
                <button 
                  onClick={handleImportJson}
                  disabled={!importJson || saving}
                  className="w-full py-4 bg-[#81C784] text-white rounded-[20px] font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'PROCESSANDO...' : 'CONFIRMAR IMPORTAÇÃO'}
                </button>
              </div>
            ) : generatedPrompt ? (
              <div className="flex-1 bg-white/5 rounded-[24px] p-6 font-mono text-sm text-[#B0BEC5] overflow-y-auto whitespace-pre-wrap leading-relaxed border border-white/10">
                {generatedPrompt}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <Brain className="w-20 h-20 text-white/5 mb-6" />
                <p className="text-white/40 font-bold">Ajuste os parâmetros ao lado e escolha o tipo de geração.</p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-[#FF8A65]/10 rounded-2xl border border-[#FF8A65]/20">
              <p className="text-[10px] font-black text-[#FFAB91] uppercase mb-1">Dica de Especialista</p>
              <p className="text-xs text-white/70">Copie o código acima e cole no Claude, ChatGPT ou Gemini para receber sua prova pronta em segundos.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Saved Exams */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-[#E1F5FE]">
                <FileText className="w-20 h-20 text-[#E1F5FE] mx-auto mb-4" />
                <p className="text-[#90A4AE] font-black text-xl">Nenhuma prova salva ainda</p>
                <p className="text-[#B0BEC5] font-bold">Gere provas usando o banco de questões</p>
              </div>
            ) : (
              exams.map(exam => (
                <div key={exam.id} className="bg-white p-6 rounded-[32px] border-2 border-[#E1F5FE] hover:shadow-xl transition-all flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-[#FFF3E0] rounded-2xl">
                      <FileText className="w-6 h-6 text-[#E65100]" />
                    </div>
                    <span className="text-[10px] font-black text-[#B0BEC5]">{new Date(exam.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#37474F]">{exam.title}</h4>
                    <p className="text-sm font-bold text-[#90A4AE]">{exam.subject} • {exam.turma}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="flex-1 py-3 bg-[#E1F5FE] text-[#0277BD] rounded-xl font-black text-xs hover:bg-[#B3E5FC] transition-all flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" />
                      IMPRIMIR
                    </button>
                    <button className="p-3 bg-[#FFEBEE] text-[#C62828] rounded-xl hover:bg-[#FFCDD2] transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-[#37474F]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-gradient-to-r from-[#FF8A65] to-[#FFAB91] text-white flex justify-between items-center">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Database className="w-6 h-6" />
                {editingQuestion?.id ? 'Editar Questão' : 'Nova Questão'}
              </h2>
              <button onClick={() => setIsQuestionModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveQuestion} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Disciplina</label>
                  <select 
                    value={editingQuestion?.subject}
                    onChange={e => setEditingQuestion({...editingQuestion, subject: e.target.value})}
                    className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                  >
                    <option value="Português">Português</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Ciências">Ciências</option>
                    <option value="História">História</option>
                    <option value="Geografia">Geografia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Turma</label>
                  <select 
                    value={editingQuestion?.turma}
                    onChange={e => setEditingQuestion({...editingQuestion, turma: e.target.value})}
                    className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                  >
                    {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Enunciado da Questão</label>
                <textarea 
                  value={editingQuestion?.content}
                  onChange={e => setEditingQuestion({...editingQuestion, content: e.target.value})}
                  rows={4}
                  className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all resize-none"
                  placeholder="Escreva aqui a pergunta..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Dificuldade</label>
                  <select 
                    value={editingQuestion?.difficulty}
                    onChange={e => setEditingQuestion({...editingQuestion, difficulty: e.target.value as any})}
                    className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                  >
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#90A4AE] uppercase ml-2">Código BNCC (Opcional)</label>
                  <input 
                    type="text" 
                    value={editingQuestion?.bnccCode}
                    onChange={e => setEditingQuestion({...editingQuestion, bnccCode: e.target.value})}
                    className="w-full p-4 bg-[#F5F5F5] rounded-[20px] outline-none font-bold text-[#546E7A] border-2 border-transparent focus:border-[#FF8A65] transition-all"
                    placeholder="Ex: EF03MA01"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-5 bg-[#FF8A65] text-white rounded-[24px] font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'SALVAR QUESTÃO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
