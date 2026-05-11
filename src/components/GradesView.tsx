import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BookOpen, Save, Users, CheckCircle2, AlertCircle, Clock,
  Edit3, Trash2, Plus, X, ChevronRight, ArrowLeft, Star, PlusCircle
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface StudentGrade {
  id?: string;
  student_id: string;
  subject: string;
  period: string;
  value: number | null;
}

interface Student {
  id: string;
  name: string;
  turma: string;
  grade?: string;
  photo_url?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PERIODS = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];

const DEFAULT_SUBJECTS = [
  'Português', 'Matemática', 'Ciências', 'História',
  'Geografia', 'Artes', 'Educação Física', 'Inglês',
];

const CLASS_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  'G1':     { bg: '#FBE9E7', border: '#FF8A65', text: '#D84315', icon: '🐣' },
  'G2':     { bg: '#E3F2FD', border: '#4FC3F7', text: '#0277BD', icon: '🐥' },
  'G3':     { bg: '#FFFDE7', border: '#FFF176', text: '#F57F17', icon: '🦁' },
  'G4':     { bg: '#E8F5E9', border: '#81C784', text: '#2E7D32', icon: '🐸' },
  'G5':     { bg: '#FFEBEE', border: '#FF5252', text: '#B71C1C', icon: '🐞' },
  '1º Ano': { bg: '#E3F2FD', border: '#4FC3F7', text: '#0277BD', icon: '🦉' },
  '2º Ano': { bg: '#FBE9E7', border: '#FF8A65', text: '#D84315', icon: '🐘' },
  '3º Ano': { bg: '#E8F5E9', border: '#81C784', text: '#2E7D32', icon: '🦖' },
  '4º Ano': { bg: '#FFFDE7', border: '#FFF176', text: '#F57F17', icon: '🦋' },
  '5º Ano': { bg: '#FFEBEE', border: '#FF5252', text: '#B71C1C', icon: '🦅' },
};

function getClassColor(turma: string) {
  return CLASS_COLORS[turma] ?? { bg: '#F5F5F5', border: '#90A4AE', text: '#546E7A', icon: '📚' };
}

function gradeStatus(v: number | null) {
  if (v === null) return { label: 'Pendente', color: '#78909C', icon: Clock };
  if (v >= 7) return { label: 'Aprovado', color: '#388E3C', icon: CheckCircle2 };
  return { label: 'Atenção', color: '#E64A19', icon: AlertCircle };
}

function avg(grades: (number | null)[]) {
  const vals = grades.filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

// ─── GradeCell ───────────────────────────────────────────────────────────────
function GradeCell({ value, onChange, saving }: {
  value: number | null;
  onChange: (v: number | null) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const open = () => { setDraft(value !== null ? String(value) : ''); setEditing(true); };
  const commit = () => {
    const n = parseFloat(draft);
    onChange(isNaN(n) ? null : Math.min(10, Math.max(0, n)));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus type="number" min={0} max={10} step={0.1}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-20 text-center font-black text-[#01579B] bg-[#E1F5FE] border-2 border-[#4FC3F7] rounded-xl px-1 py-2 outline-none focus:ring-2 focus:ring-[#4FC3F7]"
      />
    );
  }

  return (
    <button
      onClick={open} disabled={saving}
      className={`w-20 h-10 rounded-xl font-black text-sm border-2 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1
        ${value === null
          ? 'bg-gray-100 border-gray-300 text-gray-400 hover:border-[#4FC3F7]'
          : value >= 7
            ? 'bg-[#E8F5E9] border-[#81C784] text-[#2E7D32]'
            : 'bg-[#FFEBEE] border-[#FF5252] text-[#B71C1C]'
        }`}
    >
      {value !== null ? value.toFixed(1) : <Edit3 className="w-3 h-3" />}
    </button>
  );
}

// ─── Step 1: Turma Selector ──────────────────────────────────────────────────
function TurmaStep({ turmas, onSelect }: { turmas: string[]; onSelect: (t: string) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black text-[#01579B]">Notas por Turma ⭐</h2>
        <p className="text-[#546E7A] font-bold mt-1">Selecione a turma para lançar as notas</p>
      </div>
      {turmas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-16 h-16 text-[#B0BEC5]" />
          <p className="font-black text-[#90A4AE] text-xl">Nenhuma turma encontrada</p>
          <p className="text-[#B0BEC5] font-bold text-sm">Cadastre alunos com turma para visualizar notas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map(turma => {
            const c = getClassColor(turma);
            return (
              <button
                key={turma}
                onClick={() => onSelect(turma)}
                className="group rounded-[28px] border-4 p-8 shadow-lg flex items-center gap-5 hover:scale-105 transition-all text-left"
                style={{ backgroundColor: c.bg, borderColor: c.border }}
              >
                <span className="text-5xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-black" style={{ color: c.text }}>{turma}</h3>
                  <p className="text-sm font-bold" style={{ color: c.text + '99' }}>Selecionar turma</p>
                </div>
                <ChevronRight className="w-6 h-6" style={{ color: c.text }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Subject Selector ────────────────────────────────────────────────
function SubjectStep({
  turma, subjects, grades, students, onSelect, onBack,
}: {
  turma: string;
  subjects: string[];
  grades: StudentGrade[];
  students: Student[];
  onSelect: (s: string) => void;
  onBack: () => void;
}) {
  const c = getClassColor(turma);
  const turmaStudents = students.filter(s => s.turma === turma);

  function subjectCompletion(sub: string) {
    const total = turmaStudents.length * PERIODS.length;
    const filled = grades.filter(g => g.subject === sub && turmaStudents.some(s => s.id === g.student_id) && g.value !== null).length;
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white border-2 border-[#4FC3F7] rounded-xl hover:bg-[#E1F5FE] transition">
          <ArrowLeft className="w-5 h-5 text-[#0288D1]" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{c.icon}</span>
            <h2 className="text-3xl font-black" style={{ color: c.text }}>{turma}</h2>
          </div>
          <p className="text-[#546E7A] font-bold">Selecione a disciplina para lançar notas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub, i) => {
          const pct = subjectCompletion(sub);
          const subjectIcons = ['📖', '🔢', '🔬', '🏛️', '🌍', '🎨', '⚽', '🌐'];
          const icon = subjectIcons[i % subjectIcons.length];
          return (
            <button
              key={sub}
              onClick={() => onSelect(sub)}
              className="group bg-white rounded-[24px] border-2 border-[#E1F5FE] p-6 shadow-md hover:border-[#4FC3F7] hover:shadow-xl hover:scale-105 transition-all text-left flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                <ChevronRight className="w-5 h-5 text-[#90A4AE] group-hover:text-[#0288D1] transition-colors" />
              </div>
              <div>
                <h3 className="font-black text-[#01579B] text-lg">{sub}</h3>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#81C784' : '#4FC3F7' }}
                  />
                </div>
                <p className="text-xs font-bold text-[#90A4AE] mt-1">{pct}% preenchido</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Grade Entry ─────────────────────────────────────────────────────
function GradeEntry({
  turma, subject, students, allGrades, onSave, onDelete, onBack, saving,
}: {
  turma: string;
  subject: string;
  students: Student[];
  allGrades: StudentGrade[];
  onSave: (g: StudentGrade) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  saving: boolean;
}) {
  const [activePeriod, setActivePeriod] = useState(PERIODS[0]);
  const [saveMsg, setSaveMsg] = useState('');
  const c = getClassColor(turma);

  const turmaStudents = students.filter(s => s.turma === turma);

  function getGrade(studentId: string, period: string) {
    return allGrades.find(g => g.student_id === studentId && g.subject === subject && g.period === period) ?? null;
  }

  async function handleChange(student: Student, value: number | null) {
    const existing = getGrade(student.id, activePeriod);
    await onSave({
      id: existing?.id,
      student_id: student.id,
      subject,
      period: activePeriod,
      value,
    });
    setSaveMsg('✅ Salvo!');
    setTimeout(() => setSaveMsg(''), 1800);
  }

  async function handleDelete(student: Student) {
    const existing = getGrade(student.id, activePeriod);
    if (existing?.id) {
      await onDelete(existing.id);
      setSaveMsg('🗑️ Nota removida!');
      setTimeout(() => setSaveMsg(''), 1800);
    }
  }

  const periodGrades = turmaStudents.map(s => getGrade(s.id, activePeriod)?.value ?? null);
  const classAvg = avg(periodGrades);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white border-2 border-[#4FC3F7] rounded-xl hover:bg-[#E1F5FE] transition">
            <ArrowLeft className="w-5 h-5 text-[#0288D1]" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{c.icon}</span>
              <h2 className="text-2xl font-black" style={{ color: c.text }}>{turma}</h2>
              <span className="text-[#90A4AE] font-bold">›</span>
              <span className="text-2xl font-black text-[#01579B]">{subject}</span>
            </div>
            <p className="text-[#546E7A] font-bold text-sm">
              {turmaStudents.length} aluno{turmaStudents.length !== 1 ? 's' : ''}
              {classAvg !== null && (
                <span className="ml-2">
                  • Média da turma:{' '}
                  <span className="font-black" style={{ color: classAvg >= 7 ? '#388E3C' : '#E64A19' }}>
                    {classAvg.toFixed(1)}
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>
        {saveMsg && (
          <span className="text-sm font-black px-4 py-2 bg-white rounded-2xl shadow border-2 border-[#4FC3F7] text-[#0277BD] animate-bounce">
            {saveMsg}
          </span>
        )}
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={`px-5 py-2 rounded-2xl font-black text-sm transition-all border-2 ${
              activePeriod === p
                ? 'text-white border-transparent shadow-lg'
                : 'bg-white text-[#78909C] border-[#E1F5FE] hover:border-[#4FC3F7]'
            }`}
            style={activePeriod === p ? { backgroundColor: c.border, borderColor: c.border } : {}}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Students Table */}
      {turmaStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Users className="w-16 h-16 text-[#B0BEC5]" />
          <p className="font-black text-[#90A4AE] text-xl">Nenhum aluno nesta turma</p>
        </div>
      ) : (
        <div className="bg-white rounded-[28px] border-4 shadow-lg overflow-hidden" style={{ borderColor: c.border }}>
          <div className="p-4 flex items-center gap-3" style={{ backgroundColor: c.bg }}>
            <span className="text-2xl">{c.icon}</span>
            <span className="font-black text-lg" style={{ color: c.text }}>{activePeriod}</span>
            <span className="text-sm font-bold text-[#78909C] ml-2">— clique no campo para editar a nota</span>
          </div>

          <div className="divide-y divide-gray-50">
            {turmaStudents.map((student, i) => {
              const g = getGrade(student.id, activePeriod);
              const status = gradeStatus(g?.value ?? null);
              const StatusIcon = status.icon;

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-[#E1F5FE]/20 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black shrink-0 overflow-hidden"
                    style={{ borderColor: c.border, backgroundColor: c.bg, color: c.text }}
                  >
                    {student.photo_url
                      ? <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                      : student.name.charAt(0).toUpperCase()
                    }
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#37474F] truncate">{student.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StatusIcon className="w-3 h-3" style={{ color: status.color }} />
                      <span className="text-[10px] font-black uppercase" style={{ color: status.color }}>{status.label}</span>
                    </div>
                  </div>

                  {/* Grade Cell */}
                  <GradeCell
                    value={g?.value ?? null}
                    onChange={v => handleChange(student, v)}
                    saving={saving}
                  />

                  {/* Delete */}
                  {g?.id && (
                    <button
                      onClick={() => handleDelete(student)}
                      disabled={saving}
                      className="p-2 text-[#EF9A9A] hover:text-[#B71C1C] hover:bg-[#FFEBEE] rounded-xl transition-all"
                      title="Remover nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer summary */}
          <div className="px-6 py-4 border-t-2" style={{ borderColor: c.border + '40', backgroundColor: c.bg }}>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-black uppercase text-[#78909C]">Média da Turma</p>
                <p className="text-2xl font-black" style={{ color: classAvg !== null ? (classAvg >= 7 ? '#388E3C' : '#E64A19') : '#78909C' }}>
                  {classAvg !== null ? classAvg.toFixed(1) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[#78909C]">Preenchidos</p>
                <p className="text-2xl font-black text-[#0277BD]">
                  {periodGrades.filter(v => v !== null).length}/{turmaStudents.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[#78909C]">Aprovados</p>
                <p className="text-2xl font-black text-[#388E3C]">
                  {periodGrades.filter(v => v !== null && v >= 7).length}
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[#78909C]">Em Atenção</p>
                <p className="text-2xl font-black text-[#E64A19]">
                  {periodGrades.filter(v => v !== null && v < 7).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Step = 'turma' | 'subject' | 'grades';

export default function GradesView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [step, setStep] = useState<Step>('turma');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: stu } = await supabase.from('students').select('id, name, turma, grade, photo_url').order('name');
      if (stu) setStudents(stu as Student[]);

      const { data: grd } = await supabase.from('student_grades').select('*');
      if (grd) setGrades(grd as StudentGrade[]);

      const { data: sub } = await supabase.from('subjects').select('name');
      if (sub && sub.length > 0) setSubjects(sub.map((s: any) => s.name));

      setLoading(false);
    }
    load();
  }, []);

  const turmas = Array.from(new Set(students.map(s => s.turma).filter(Boolean))).sort();

  const handleSave = async (grade: StudentGrade) => {
    setSaving(true);
    try {
      if (grade.id) {
        const { error } = await supabase.from('student_grades').update({ value: grade.value }).eq('id', grade.id);
        if (!error) setGrades(prev => prev.map(g => g.id === grade.id ? { ...g, value: grade.value } : g));
      } else {
        const { data, error } = await supabase
          .from('student_grades')
          .insert({ student_id: grade.student_id, subject: grade.subject, period: grade.period, value: grade.value })
          .select().single();
        if (!error && data) setGrades(prev => [...prev, data as StudentGrade]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('student_grades').delete().eq('id', id);
      if (!error) setGrades(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-16 h-16 border-8 border-[#4FC3F7] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#0288D1] text-lg">Carregando notas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      {step !== 'turma' && (
        <div className="flex items-center gap-2 text-sm font-bold text-[#78909C]">
          <button onClick={() => { setStep('turma'); setSelectedTurma(''); setSelectedSubject(''); }}
            className="hover:text-[#0288D1] transition-colors">Turmas</button>
          {selectedTurma && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => { setStep('subject'); setSelectedSubject(''); }}
                className="hover:text-[#0288D1] transition-colors"
              >{selectedTurma}</button>
            </>
          )}
          {selectedSubject && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#0277BD]">{selectedSubject}</span>
            </>
          )}
        </div>
      )}

      {step === 'turma' && (
        <TurmaStep
          turmas={turmas}
          onSelect={t => { setSelectedTurma(t); setStep('subject'); }}
        />
      )}

      {step === 'subject' && (
        <SubjectStep
          turma={selectedTurma}
          subjects={subjects}
          grades={grades}
          students={students}
          onSelect={s => { setSelectedSubject(s); setStep('grades'); }}
          onBack={() => { setStep('turma'); setSelectedTurma(''); }}
        />
      )}

      {step === 'grades' && (
        <GradeEntry
          turma={selectedTurma}
          subject={selectedSubject}
          students={students}
          allGrades={grades}
          onSave={handleSave}
          onDelete={handleDelete}
          onBack={() => { setStep('subject'); setSelectedSubject(''); }}
          saving={saving}
        />
      )}
    </div>
  );
}
