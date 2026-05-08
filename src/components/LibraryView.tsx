import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { LibraryBook } from '../types';

export default function LibraryView({ books, setBooks }: { books: LibraryBook[], setBooks: (b: LibraryBook[]) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLoan = (id: string) => {
    setBooks(books.map(b => {
      if (b.id === id) {
        return { 
          ...b, 
          available: !b.available, 
          loanedTo: !b.available ? 'Novo Aluno' : undefined,
          dueDate: !b.available ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : undefined
        };
      }
      return b;
    }));
    alert('Alteração salva com sucesso na Biblioteca! 📚');
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#01579B]">Biblioteca Mágica 📚</h2>
          <p className="text-[#546E7A] font-bold">Viaje pelo mundo das histórias!</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar livro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border-4 border-[#E1F5FE] rounded-[24px] w-80 shadow-inner focus:border-[#4FC3F7] transition-all outline-none font-bold"
            />
          </div>
          <button className="px-8 py-4 bg-[#4FC3F7] text-white rounded-[24px] font-black border-b-8 border-[#0288D1] shadow-xl">CATÁLOGO</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white p-8 rounded-[48px] shadow-2xl border-4 border-[#E1F5FE] relative overflow-hidden group hover:scale-[1.03] transition-all">
            <div className={`absolute top-0 right-0 w-4 h-full ${book.available ? 'bg-[#81C784]' : 'bg-[#FF8A65]'}`} />
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-3xl border-4 flex items-center justify-center text-4xl shadow-inner ${book.available ? 'bg-[#E8F5E9] border-[#81C784]' : 'bg-[#FBE9E7] border-[#FF8A65]'}`}>
                📖
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-[#5D4037] leading-tight mb-2 italic underline decoration-[#FFF176]">{book.title}</h4>
                <p className="text-sm text-[#78909C] font-black uppercase tracking-wider">{book.author}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#E1F5FE] rounded-full text-[10px] font-black uppercase text-[#0277BD] border-2 border-[#4FC3F7]">{book.category}</span>
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

            <div className="mt-8 flex gap-3">
              {book.available ? (
                <button onClick={() => toggleLoan(book.id)} className="flex-1 py-4 bg-[#81C784] text-white rounded-2xl font-black border-b-6 border-[#388E3C] shadow-lg">EMPRESTAR LIVRO</button>
              ) : (
                <button onClick={() => toggleLoan(book.id)} className="flex-1 py-4 bg-[#E1F5FE] text-[#0288D1] rounded-2xl font-black border-b-6 border-[#4FC3F7] flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5" /> DEVOLVER ✅
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
