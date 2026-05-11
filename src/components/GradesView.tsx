import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BookOpen, Users, CheckCircle2, AlertCircle, Clock,
  Edit3, Trash2, ChevronRight, ArrowLeft,
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

interface ClassItem {
  id: string;
  name: string;
  color?: string;
  border?: string;
  icon?: string;
  teacher?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PERIODS = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];

const DEFAULT_SUBJECTS = [
  'Português', 'Matemática', 'Ciências', 'História',
  'Geografia', 'Artes', 'Educação Física', 'Inglês',
];

const FALLBACK_COLORS = [
  { bg: '#FBE9E7', border: '#FF8A65', text: '#D84315', icon: '🐣' },
  { bg: '#E3F2FD', border: '#4FC3F7', text: '#0277BD', icon: '🐥' },
  { bg: '#FFFDE7', border: '#FBC02D', text: '#F57F17', icon: '🦁' },
  { bg: '#E8F5E9', border: '#81C784', text: '#2E7D32', icon: '🐸' },
  { bg: '#FFEBEE', border: '#FF5252', text: '#B71C1C', icon: '🐞' },
  { bg: '#F3E5F5', border: '#CE93D8', text: '#6A1B9A', icon: '🦋' },
  { bg: '#E0F2F1', border: '#4DB6AC', text: '#00695C', icon: '🦖' },
  { bg: '#FFF8E1', border: '#FFD54F', text: '#E65100', icon: '🦅' },
];

function getColor(cls: ClassItem, idx: number) {
  const fb = FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
  return {
    bg:     cls.color  ? cls.color + '22'  : fb.bg,
    border: cls.border ? cls.border        : fb.border,
    text:   cls.border ? cls.border        : fb.text,
    icon:   cls.icon   ? cls.icon          : fb.icon,
  };
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
        className="w-20 text-center font-black text-[#01579B] bg-[#E1F5FE] border-2 border-[#4FC3F7] rounded-xl px-1 py-2 outline-none"
      />
    );
  }

  return (
    <button
      onClick={open} disabled={saving}
      className={`w-20 h-10 rounded-xl font-black text-sm border-2 transition-all hover:scale-105 flex items-center justify-center gap-1
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

// ─── Step 1: Turma List ───────────────────────────────────────────────────────
function TurmaStep({ classes, students, onSelect }: {
  classes: ClassItem[];
  students: Student[];
  onSelect: (c: ClassItem) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black text-[#01579B]">Notas por Turma ⭐</h2>
        <p className="text-[#546E7A] font-bold mt-1">Selecione a turma para lançar as notas</p>
      </div>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-16 h-16 text-[#B0BEC5]" />
          <p className="font-black text-[#90A4AE] text-xl">Nenhuma turma cadastrada</p>
          <p className="text-[#B0BEC5] font-bold text-sm">Cadastre turmas no menu Turmas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, idx) => {
            const c = getColor(cls, idx);
            const count = students.filter(s => s.turma === cls.name).length;
            return (
              <button
                key={cls.id}
                onClick={() => onSelect(cls)}
                className="group rounded-[28px] border-4 p-8 shadow-lg flex items-center gap-5 hover:scale-105 transition-all text-left"
                style={{ backgroundColor: c.bg, borderColor: c.border }}
              >
                <span className="text-5xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-black" style={{ color: c.text }}>{cls.name}</h3>
                  <p className="text-sm font-bold mt-1" style={{ color: c.text + 'aa' }}>
                    {count} aluno{count !== 1 ? 's' : ''}
                    {cls.teacher ? ` • ${cls.teacher}` : ''}
                  </p>
                </div>
                <ChevronRight className="w-6 h-6" style={{ color: c.border }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Subject List ─────────────────────────────────────────────────────
function SubjectStep({ cls, idx, subjects, grades, students, onSelect, onBack }: {
  cls: ClassItem;
  idx: number;
  subjects: string[];
  grades: StudentGrade[];
  students: Student[];
  onSelect: (s: string) => void;
  onBack: () => void;
}) {
  const c = getColor(cls, idx);
  const turmaStudents = students.filter(s => s.turma === cls.name);
  const subjectIcons = ['📖', '🔢', '🔬', '🏛️', '🌍', '🎨', '⚽', '🌐', '🎵', '🖥️'];

  function pct(sub: string) {
    const total = turmaStudents.length * PERIODS.length;
    const filled = grades.filter(g =>
      g.subject === sub &&
      turmaStudents.some(s => s.id === g.student_id) &&
      g.value !== null
    ).length;
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
            <h2 className="text-3xl font-black" style={{ color: c.text }}>{cls.name}</h2>
            <span className="text-[#90A4AE] font-bold text-sm">— {turmaStudents.length} aluno{turmaStudents.length !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-[#546E7A] font-bold">Selecione a disciplina</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub, i) => {
          const p = pct(sub);
          return (
            <button
              key={sub}
              onClick={() => onSelect(sub)}
              className="group bg-white rounded-[24px] border-2 border-[#E1F5FE] p-6 shadow-md hover:border-[#4FC3F7] hover:shadow-xl hover:scale-105 transition-all text-left flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{subjectIcons[i % subjectIcons.length]}</span>
                <ChevronRight className="w-5 h-5 text-[#90A4AE] group-hover:text-[#0288D1]" />
              </div>
              <div>
                <h3 className="font-black text-[#01579B] text-lg">{sub}</h3>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${p}%`, backgroundColor: p === 100 ? '#81C784' : '#4FC3F7' }} />
                </div>
                <p className="text-xs font-bold text-[#90A4AE] mt-1">{p}% preenchido</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Grade Entry ──────────────────────────────────────────────────────
function GradeEntry({ cls, idx, subject, students, allGrades, onSave, onDelete, onBack, saving }: {
  cls: ClassItem;
  idx: number;
  subject: string;
  students: Student[];
  allGrades: StudentGrade[];
  onSave: (g: StudentGrade) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const [activePeriod, setActivePeriod] = useState(PERIODS[0]);
  const [saveMsg, setSaveMsg] = useState('');
  const c = getColor(cls, idx);
  const turmaStudents = students.filter(s => s.turma === cls.name);

  function getGrade(studentId: string, period: string) {
    return allGrades.find(g => g.student_id === studentId && g.subject === subject && g.period === period) ?? null;
  }

  async function handleChange(student: Student, value: number | null) {
    const existing = getGrade(student.id, activePeriod);
    await onSave({ id: existing?.id, student_id: student.id, subject, period: activePeriod, value });
    setSaveMsg('✅ Salvo!');
    setTimeout(() => setSaveMsg(''), 1800);
  }

  async function handleDelete(student: Student) {
    const existing = getGrade(student.id, activePeriod);
    if (existing?.id) {
      await onDelete(existing.id);
      setSaveMsg('🗑️ Removido!');
      setTimeout(() => setSaveMsg(''), 1800);
    }
  }

  const periodVals = turmaStudents.map(s => getGrade(s.id, activePeriod)?.value ?? null);
  const classAvg = avg(periodVals);

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
              <h2 className="text-2xl font-black" style={{ color: c.text }}>{cls.name}</h2>
              <span className="text-[#90A4AE]">›</span>
              <span className="text-2xl font-black text-[#01579B]">{subject}</span>
            </div>
            <p className="text-[#546E7A] font-bold text-sm">
              {turmaStudents.length} aluno{turmaStudents.length !== 1 ? 's' : ''}
              {classAvg !== null && (
                <span className="ml-2">• Média: <span className="font-black" style={{ color: classAvg >= 7 ? '#388E3C' : '#E64A19' }}>{classAvg.toFixed(1)}</span></span>
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
          <button key={p} onClick={() => setActivePeriod(p)}
            className={`px-5 py-2 rounded-2xl font-black text-sm border-2 transition-all
              ${activePeriod === p ? 'text-white shadow-lg' : 'bg-white text-[#78909C] border-[#E1F5FE] hover:border-[#4FC3F7]'}`}
            style={activePeriod === p ? { backgroundColor: c.border, borderColor: c.border } : {}}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Table */}
      {turmaStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Users className="w-16 h-16 text-[#B0BEC5]" />
          <p className="font-black text-[#90A4AE] text-xl">Nenhum aluno nesta turma</p>
          <p className="text-[#B0BEC5] text-sm font-bold">Vincule alunos à turma "{cls.name}" no cadastro de Alunos</p>
        </div>
      ) : (
        <div className="bg-white rounded-[28px] border-4 shadow-lg overflow-hidden" style={{ borderColor: c.border }}>
          <div className="p-4 flex items-center gap-3" style={{ backgroundColor: c.bg }}>
            <span className="text-2xl">{c.icon}</span>
            <span className="font-black text-lg" style={{ color: c.text }}>{activePeriod}</span>
            <span className="text-sm font-bold text-[#78909C] ml-2">— clique para editar</span>
          </div>

          <div className="divide-y divide-gray-50">
            {turmaStudents.map((student, i) => {
              const g = getGrade(student.id, activePeriod);
              const status = gradeStatus(g?.value ?? null);
              const StatusIcon = status.icon;
              return (
                <div key={student.id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-[#E1F5FE]/20 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                >
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black shrink-0 overflow-hidden"
                    style={{ borderColor: c.border, backgroundColor: c.bg, color: c.text }}>
                    {student.photo_url
                      ? <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                      : student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#37474F] truncate">{student.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StatusIcon className="w-3 h-3" style={{ color: status.color }} />
                      <span className="text-[10px] font-black uppercase" style={{ color: status.color }}>{status.label}</span>
                    </div>
                  </div>
                  <GradeCell value={g?.value ?? null} onChange={v => handleChange(student, v)} saving={saving} />
                  {g?.id && (
                    <button onClick={() => handleDelete(student)} disabled={saving}
                      className="p-2 text-[#EF9A9A] hover:text-[#B71C1C] hover:bg-[#FFEBEE] rounded-xl transition-all" title="Remover nota">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer stats */}
          <div className="px-6 py-4 border-t-2 flex flex-wrap gap-6" style={{ borderColor: c.border + '40', backgroundColor: c.bg }}>
            {[
              { label: 'Média', val: classAvg !== null ? classAvg.toFixed(1) : '—', color: classAvg !== null ? (classAvg >= 7 ? '#388E3C' : '#E64A19') : '#78909C' },
              { label: 'Preenchidos', val: `${periodVals.filter(v => v !== null).length}/${turmaStudents.length}`, color: '#0277BD' },
              { label: 'Aprovados', val: String(periodVals.filter(v => v !== null && v >= 7).length), color: '#388E3C' },
              { label: 'Em Atenção', val: String(periodVals.filter(v => v !== null && v < 7).length), color: '#E64A19' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-xs font-black uppercase text-[#78909C]">{stat.label}</p>
                <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Step = 'turma' | 'subject' | 'grades';

export default function GradesView() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [step, setStep] = useState<Step>('turma');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: cls } = await supabase.from('classes').select('*').order('name');
      if (cls) setClasses(cls as ClassItem[]);

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
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('student_grades').delete().eq('id', id);
      if (!error) setGrades(prev => prev.filter(g => g.id !== id));
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
          <button onClick={() => { setStep('turma'); setSelectedClass(null); setSelectedSubject(''); }}
            className="hover:text-[#0288D1] transition-colors">Turmas</button>
          {selectedClass && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => { setStep('subject'); setSelectedSubject(''); }}
                className="hover:text-[#0288D1] transition-colors">{selectedClass.name}</button>
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
          classes={classes}
          students={students}
          onSelect={(cls) => {
            const idx = classes.findIndex(c => c.id === cls.id);
            setSelectedClass(cls);
            setSelectedClassIdx(idx);
            setStep('subject');
          }}
        />
      )}

      {step === 'subject' && selectedClass && (
        <SubjectStep
          cls={selectedClass}
          idx={selectedClassIdx}
          subjects={subjects}
          grades={grades}
          students={students}
          onSelect={s => { setSelectedSubject(s); setStep('grades'); }}
          onBack={() => { setStep('turma'); setSelectedClass(null); }}
        />
      )}

      {step === 'grades' && selectedClass && (
        <GradeEntry
          cls={selectedClass}
          idx={selectedClassIdx}
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
