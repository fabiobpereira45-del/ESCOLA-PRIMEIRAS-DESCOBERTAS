import { useState } from 'react';
import { Search, RotateCcw, Upload, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { LibraryBook } from '../types';
import { supabase } from '../lib/supabase';

export default function LibraryView({ books, setBooks }: { books: LibraryBook[], setBooks: (b: LibraryBook[]) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF! 📄');
      return;
    }

    setIsUploading(true);
    const fileName = `book_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('students') // Usando bucket existente para simplicidade
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('students')
        .getPublicUrl(fileName);

      // Criar entrada no banco para o novo PDF
      const newBook = {
        title: file.name.replace('.pdf', ''),
        author: 'Autor Desconhecido',
        category: 'Digital',
        available: true,
        pdf_url: publicUrl
      };

      const { data, error } = await supabase.from('books').insert(newBook).select();

      if (error) throw error;

      if (data) {
        setBooks([...books, { ...data[0], pdfUrl: data[0].pdf_url } as any]);
        alert('Livro digital adicionado com sucesso! 📖✨');
      }
    } catch (error: any) {
      console.error('Erro no upload do PDF:', error);
      alert('Erro ao enviar PDF: ' + error.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const toggleLoan = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const updates = { 
      available: !book.available, 
      loaned_to: !book.available ? 'Novo Aluno' : null,
      due_date: !book.available ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : null
    };

    const { error } = await supabase.from('books').update(updates).eq('id', id);
    
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates, loanedTo: updates.loaned_to, dueDate: updates.due_date } : b));
      alert('Alteração salva com sucesso na Biblioteca! 📚');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Biblioteca Mágica 📚</h2>
          <p className="text-[#546E7A] font-bold">Viaje pelo mundo das histórias!</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar livro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border-4 border-[#E1F5FE] rounded-[24px] w-full md:w-80 shadow-inner focus:border-[#4FC3F7] transition-all outline-none font-bold"
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              id="pdf-upload" 
              onChange={handlePdfUpload}
              disabled={isUploading}
            />
            <label 
              htmlFor="pdf-upload"
              className={`px-6 py-4 rounded-[24px] font-black border-b-8 shadow-xl flex items-center gap-2 cursor-pointer transition-all ${isUploading ? 'bg-gray-200 border-gray-400 text-gray-500' : 'bg-[#BA68C8] border-[#7B1FA2] text-white hover:scale-105'}`}
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span>{isUploading ? 'ENVIANDO...' : 'ADICIONAR PDF'}</span>
            </label>
            <button className="px-8 py-4 bg-[#4FC3F7] text-white rounded-[24px] font-black border-b-8 border-[#0288D1] shadow-xl hover:scale-105 transition-all">CATÁLOGO</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white p-8 rounded-[48px] shadow-2xl border-4 border-[#E1F5FE] relative overflow-hidden group hover:scale-[1.03] transition-all">
            <div className={`absolute top-0 right-0 w-4 h-full ${book.available ? 'bg-[#81C784]' : 'bg-[#FF8A65]'}`} />
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-3xl border-4 flex items-center justify-center text-4xl shadow-inner ${book.available ? 'bg-[#E8F5E9] border-[#81C784]' : 'bg-[#FBE9E7] border-[#FF8A65]'}`}>
                {book.pdfUrl ? <FileText className={book.available ? 'text-[#2E7D32]' : 'text-[#D84315]'} /> : '📖'}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-[#5D4037] leading-tight mb-2 italic underline decoration-[#FFF176]">{book.title}</h4>
                <p className="text-sm text-[#78909C] font-black uppercase tracking-wider">{book.author}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#E1F5FE] rounded-full text-[10px] font-black uppercase text-[#0277BD] border-2 border-[#4FC3F7]">{book.category}</span>
                  {book.pdfUrl && <span className="px-3 py-1 bg-[#F3E5F5] rounded-full text-[10px] font-black uppercase text-[#7B1FA2] border-2 border-[#BA68C8]">Digital PDF</span>}
                </div>
              </div>
            </div>

            {!book.available && (
              <div className="mt-8 p-4 bg-[#FBE9E7] rounded-3xl border-2 border-dashed border-[#FF8A65] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-[#BF360C]">
                  <span>👤 {book.loanedTo}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#D84315] font-black italic">
                   Até {book.dueDate}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex gap-2">
                {book.available ? (
                  <button onClick={() => toggleLoan(book.id)} className="flex-1 py-4 bg-[#81C784] text-white rounded-2xl font-black border-b-6 border-[#388E3C] shadow-lg hover:brightness-110 active:translate-y-1 transition-all">EMPRESTAR</button>
                ) : (
                  <button onClick={() => toggleLoan(book.id)} className="flex-1 py-4 bg-[#E1F5FE] text-[#0288D1] rounded-2xl font-black border-b-6 border-[#4FC3F7] flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-1 transition-all">
                    <RotateCcw className="w-5 h-5" /> DEVOLVER
                  </button>
                )}
              </div>
              
              {book.pdfUrl && (
                <a 
                  href={book.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#FFF9C4] text-[#F57F17] rounded-2xl font-black border-b-6 border-[#FBC02D] flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-1 transition-all"
                >
                  <ExternalLink className="w-5 h-5" /> LER LIVRO DIGITAL
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
