import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data Store
  const db = {
    students: [
      // G 3 - Matutino
      { id: '1', name: 'Cecília Santana Santos', grade: 'G 3', turma: 'Matutino' },
      { id: '2', name: 'Agatha Sofia de Moraes Gundim', grade: 'G 3', turma: 'Matutino' },
      { id: '3', name: 'Zoe Santana Gonçalves', grade: 'G 3', turma: 'Matutino' },
      // G 4
      { id: '4', name: 'Thael Breno Santos Silva', grade: 'G 4', turma: 'Geral' },
      // G 5 - Matutino
      { id: '5', name: 'Lorena da Silva de Jesus', grade: 'G 5', turma: 'Matutino' },
      { id: '6', name: 'Apolo de Jesus dos Santos Rios', grade: 'G 5', turma: 'Matutino' },
      { id: '7', name: 'Bernardo Muniz Barreto Pereira', grade: 'G 5', turma: 'Matutino' },
      { id: '8', name: 'Miguel Barreto de Jesus', grade: 'G 5', turma: 'Matutino' },
      { id: '9', name: 'Rodrigo Sodré dos Santos', grade: 'G 5', turma: 'Matutino' },
      // 1º Ano
      { id: '10', name: 'Kennedy Luiz de Jesus Santos', grade: '1º Ano', turma: 'A' },
      { id: '11', name: 'Elisa Menezes Andrade', grade: '1º Ano', turma: 'A' },
      { id: '12', name: 'Sophia Luiz de Jesus Santos', grade: '1º Ano', turma: 'A' },
      { id: '13', name: 'Eloáh Carvalho dos Santos de Jesus', grade: '1º Ano', turma: 'A' },
      { id: '14', name: 'José Neto de Jesus Lopes', grade: '1º Ano', turma: 'A' },
      { id: '15', name: 'Ícaro Farias Brito', grade: '1º Ano', turma: 'A' },
      { id: '16', name: 'Maria Luiza Rocha Souza', grade: '1º Ano', turma: 'A' },
      { id: '17', name: 'Tarciele Santana da Silva', grade: '1º Ano', turma: 'A' },
      // 2º Ano
      { id: '18', name: 'Theo Santos Silva', grade: '2º Ano', turma: 'A' },
      { id: '19', name: 'Ruan Gabriel Farias Dantas', grade: '2º Ano', turma: 'A' },
      { id: '20', name: 'Alice Barreto Conceição dos Santos', grade: '2º Ano', turma: 'A' },
      { id: '21', name: 'Tyler Quadros Lima', grade: '2º Ano', turma: 'A' },
      { id: '22', name: 'Ryan Victor Santos Moura', grade: '2º Ano', turma: 'A' },
      { id: '23', name: 'Sophia Rafelly Ferreira de Barros', grade: '2º Ano', turma: 'A' },
      { id: '24', name: 'Arthur Benjamim Pascoal Almeida', grade: '2º Ano', turma: 'A' },
      // 4º Ano
      { id: '25', name: 'Heloísa Fagundes de Santana', grade: '4º Ano', turma: 'A' },
      { id: '26', name: 'Cecília M. Souza Guerreiro', grade: '4º Ano', turma: 'A' },
      { id: '27', name: 'Laís Rodrigues Damasceno', grade: '4º Ano', turma: 'A' },
      { id: '28', name: 'Hanna Luiz dos Santos Pereira', grade: '4º Ano', turma: 'A' },
      { id: '29', name: 'Pedro Henrique Andrade de Melo', grade: '4º Ano', turma: 'A' },
      { id: '30', name: 'Ravi dos Santos Soares', grade: '4º Ano', turma: 'A' },
      { id: '31', name: 'Pedro Damasceno Costa', grade: '4º Ano', turma: 'A' },
      // 5º Ano
      { id: '32', name: 'Nicolle de Oliveira Freitas', grade: '5º Ano', turma: 'A' },
      { id: '33', name: 'Guilherme dos Santos Silva', grade: '5º Ano', turma: 'A' },
      { id: '34', name: 'Maria Esther da Silva Santos', grade: '5º Ano', turma: 'A' },
      { id: '35', name: 'Kauê Barreto Reis', grade: '5º Ano', turma: 'A' },
      { id: '36', name: 'Hadassa Neves Pinho Silva', grade: '5º Ano', turma: 'A' },
      { id: '37', name: 'Bruno Bento Santos Brasileiro', grade: '5º Ano', turma: 'A' },
      { id: '38', name: 'Gabriel Victor Paixão Fagundes Vieira', grade: '5º Ano', turma: 'A' },
      { id: '39', name: 'Levi Rocha Lins', grade: '5º Ano', turma: 'A' },
      { id: '40', name: 'Renan Ruas Pinto dos Santos', grade: '5º Ano', turma: 'A' },
      { id: '41', name: 'Evellin Vitória de Almeida Xavier', grade: '5º Ano', turma: 'A' },
      { id: '42', name: 'Keizzy Keira Silva de Jesus', grade: '5º Ano', turma: 'A' },
      { id: '43', name: 'Agathe Sophia Souza dos Santos', grade: '5º Ano', turma: 'A' },
      { id: '44', name: 'Davi Oliveira dos Santos', grade: '5º Ano', turma: 'A' },
      { id: '45', name: 'Thaís Ivanilde Tavares dos Santos', grade: '5º Ano', turma: 'A' },
      { id: '46', name: 'Anthony Santos Souza', grade: '5º Ano', turma: 'A' },
    ],
    teachers: [
      { id: 't1', name: 'Prof. Márcia', subject: 'Português', classes: ['1º Ano A', '2º Ano B'] },
      { id: 't2', name: 'Prof. Ricardo', subject: 'Matemática', classes: ['3º Ano A', '4º Ano B'] },
    ],
    announcements: [
      { id: 'a1', title: 'Festa da Primavera', content: 'Não percam nossa festa no próximo sábado!', date: '2024-09-10', target: 'all' },
    ],
    attendance: [],
    grades: [],
    books: [
      { id: 'b1', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', category: 'Infantil', available: true },
    ],
    inventory: [
      { id: 'i1', name: 'Papel A4', quantity: 50, category: 'Papelaria' },
    ],
    financial: []
  };

  // API Routes
  app.get("/api/students", (req, res) => res.json(db.students));
  app.post("/api/students", (req, res) => {
    const student = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    db.students.push(student);
    res.status(201).json(student);
  });

  app.get("/api/teachers", (req, res) => res.json(db.teachers));
  
  app.get("/api/attendance", (req, res) => res.json(db.attendance));
  app.post("/api/attendance", (req, res) => {
    const records = req.body; // Expecting array of { studentId, date, present }
    db.attendance.push(...records);
    res.status(201).json({ message: 'Chamada realizada com sucesso!' });
  });

  app.get("/api/announcements", (req, res) => res.json(db.announcements));
  
  app.get("/api/library", (req, res) => res.json(db.books));
  app.get("/api/inventory", (req, res) => res.json(db.inventory));

  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
