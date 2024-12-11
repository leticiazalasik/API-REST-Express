const express = require('express');
const app = express();

// Middleware para processar JSON
app.use(express.json());

// Middleware para log de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Nosso "banco de dados"
let books = [
    { 
        id: 1, 
        title: 'O Senhor dos Anéis', 
        author: 'J.R.R. Tolkien',
        year: 1954,
        available: true
    }
];

// Função auxiliar para validar livro
function validateBook(book) {
    const errors = [];
    
    if (!book.title) {
        errors.push('Título é obrigatório');
    }
    
    if (!book.author) {
        errors.push('Autor é obrigatório');
    }
    
    return errors;
}

// Rotas da API
app.get('/books', (req, res) => {
    // Suporta filtro por disponibilidade
    const available = req.query.available;
    
    if (available !== undefined) {
        const filtered = books.filter(b => b.available === (available === 'true'));
        return res.json(filtered);
    }
    
    res.json(books);
});

app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    
    if (!book) {
        return res.status(404).json({ 
            message: 'Livro não encontrado' 
        });
    }
    
    res.json(book);
});

app.post('/books', (req, res) => {
    const errors = validateBook(req.body);
    
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    
    const newBook = {
        id: books.length + 1,
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        available: true,
        createdAt: new Date()
    };
    
    books.push(newBook);
    res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    
    if (!book) {
        return res.status(404).json({ 
            message: 'Livro não encontrado' 
        });
    }
    
    const errors = validateBook(req.body);
    
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    
    book.title = req.body.title;
    book.author = req.body.author;
    book.year = req.body.year;
    book.updatedAt = new Date();
    
    res.json(book);
});

app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    
    if (bookIndex === -1) {
        return res.status(404).json({ 
            message: 'Livro não encontrado' 
        });
    }
    
    books.splice(bookIndex, 1);
    res.status(204).send();
});

// Iniciando o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});