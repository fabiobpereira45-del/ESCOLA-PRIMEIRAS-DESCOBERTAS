-- ESCOLA PRIMEIRAS DESCOBERTAS - DATABASE SCHEMA
-- Execute este script no SQL Editor do seu projeto Supabase para garantir que todas as tabelas existam

-- 1. Tabela de Alunos (students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    birth_date DATE,
    registration_number TEXT UNIQUE, -- RA
    age INTEGER,
    turma TEXT, -- Vinculado ao nome da classe
    shift TEXT, -- Matutino, Vespertino, Integral
    gender TEXT, -- M, F
    guardian TEXT, -- Responsável
    address TEXT,
    phone TEXT,
    additional_phone TEXT,
    photo_url TEXT,
    
    -- Saúde
    medication BOOLEAN DEFAULT false,
    medication_details TEXT,
    neurodivergent BOOLEAN DEFAULT false,
    atipicidade TEXT,
    neurodivergent_report BOOLEAN DEFAULT false,
    allergies BOOLEAN DEFAULT false,
    allergies_details TEXT,
    surgery BOOLEAN DEFAULT false,
    surgery_details TEXT
);

-- 2. Tabela de Classes/Turmas (classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT, -- Cor HEX para UI
    border_color TEXT,
    tuition_fee NUMERIC(10,2) DEFAULT 850.00
);

-- 3. Tabela de Professores (teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    subject TEXT,
    bio TEXT,
    classes TEXT[], -- Array de nomes das turmas
    photo_url TEXT
);

-- 4. Tabela de Notas (student_grades)
CREATE TABLE IF NOT EXISTS public.student_grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    period TEXT NOT NULL, -- Ex: 1º Bimestre
    value NUMERIC(4,2), -- Ex: 7.50
    
    UNIQUE(student_id, subject, period)
);

-- 5. Tabela de Recados/Mural (announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT, -- Data formatada DD/MM/YYYY
    target TEXT DEFAULT 'all' -- all, parents, teachers, students
);

-- 6. Tabela de Disciplinas (subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    border_color TEXT
);

-- 7. Tabela de Estoque (inventory)
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    min INTEGER DEFAULT 0,
    unit TEXT,
    icon TEXT
);

-- 8. Tabela de Financeiro (financial_records)
CREATE TABLE IF NOT EXISTS public.financial_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    type TEXT, -- tuition, fee, other
    amount NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' -- pending, paid, overdue
);

-- 9. Tabela de Biblioteca (books)
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    category TEXT,
    available BOOLEAN DEFAULT true,
    loaned_to TEXT,
    due_date DATE,
    pdf_url TEXT
);

-- 10. Tabela de Diretoria (directive)
CREATE TABLE IF NOT EXISTS public.directive (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    photo_url TEXT,
    email TEXT,
    phone TEXT
);

-- 11. Tabela de Álbuns de Fotos (albums)
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT,
    cover TEXT, -- URL da capa
    count INTEGER DEFAULT 0
);

-- 12. Tabela de Ocorrências (student_occurrences)
CREATE TABLE IF NOT EXISTS public.student_occurrences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    type TEXT, -- Comportamento, Saúde, Pedagógico
    description TEXT NOT NULL
);

-- 13. Tabela de Informações da Escola (school_info)
CREATE TABLE IF NOT EXISTS public.school_info (
    id INTEGER PRIMARY KEY DEFAULT 1, -- Sempre ID 1 para configuração única
    name TEXT DEFAULT 'Escola Primeiras Descobertas',
    address TEXT,
    cnpj TEXT,
    phone TEXT,
    email TEXT,
    director TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#4FC3F7',
    passing_grade NUMERIC(3,1) DEFAULT 7.0,
    contract_template TEXT,
    
    CONSTRAINT single_row CHECK (id = 1)
);

-- 14. Tabela de Despesas (expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    category TEXT NOT NULL, -- Salários, Produtos, Serviços, Infraestrutura, Outros
    status TEXT DEFAULT 'pending' -- pending, paid
);

-- 15. Tabela de Folha de Pagamento (payroll)
CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    base_salary NUMERIC(10,2) NOT NULL,
    bonus NUMERIC(10,2) DEFAULT 0,
    deductions NUMERIC(10,2) DEFAULT 0,
    net_salary NUMERIC(10,2) NOT NULL,
    reference_month TEXT NOT NULL, -- MM/YYYY
    status TEXT DEFAULT 'draft' -- draft, paid
);

-- 16. Tabela de Questões (questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    subject TEXT NOT NULL,
    turma TEXT NOT NULL, -- G1, G2, G3, 1º, 2º, 3º, 4º, 5º ano
    content TEXT NOT NULL, -- Enunciado
    type TEXT NOT NULL, -- objetiva, dissertativa, ligar, completar, etc.
    difficulty TEXT DEFAULT 'média', -- fácil, média, difícil
    options JSONB, -- Para questões de múltipla escolha
    correct_answer TEXT,
    bncc_code TEXT, -- Habilidade BNCC
    image_description TEXT -- Descrição para onde inserir imagem
);

-- 17. Tabela de Provas Geradas (exams)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    turma TEXT NOT NULL,
    period TEXT, -- 1º Bimestre, etc.
    questions_ids UUID[], -- Array de IDs das questões selecionadas
    content_json JSONB -- Conteúdo completo caso gerado por IA ou cache
);

-- ==========================================
-- DESABILITAR RLS (Para permitir salvamento com chave anon)
-- ==========================================
-- Execute estas linhas para resolver o erro "violates row-level security policy"

ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.directive DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_occurrences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;

-- Opcional: Se preferir MANTER o RLS ativo mas permitir acesso total (menos seguro, mas funciona):
-- CREATE POLICY "Permitir tudo" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
