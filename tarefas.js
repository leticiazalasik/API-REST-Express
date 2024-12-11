const express = require('express');
const app = express();

// Middleware para processar JSON
app.use(express.json());

// Middleware para log de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
})

// "Banco de dados"
let tarefas = [
    {
        id: 1,
        titulo: 'Estudar Express',
        descricao: 'Estudar API-REST com uso de Express.',
        status: 'pendente',
        dataCriacao: new Date(),
        dataConclusao: new Date('2024-12-18T10:00:00Z')
    }
];

// Função auxiliar para validar tarefa
function validarTarefa(tarefa) {
    const errors = [];

    if (!tarefa.titulo) { // Corrigido para 'titulo' (não 'title')
        errors.push('Título é obrigatório.');
    }

    const status = tarefa.status.toLowerCase(); // Converte o status para minúsculas

    if (status !== "pendente" && status !== "concluida") {
        errors.push('O status da tarefa deve ser pendente ou concluído.');
    }

    return errors;
}

// ROTAS

// GET - todas
app.get('/tarefas', (req, res) => {
    res.json(tarefas);
});

// GET - por id
app.get('/tarefas/:id', (req, res) => {
    const tarefa = tarefas.find(t => t.id === parseInt(req.params.id));

    if (!tarefa) {
        return res.status(404).json({
            message: 'Tarefa não encontrada.'
        });
    }
    res.json(tarefa);
});

// POST - cadastro de nova tarefa
app.post('/tarefas', (req, res) => {
    const errors = validarTarefa(req.body);

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const novaTarefa = {
        id: tarefas.length + 1,
        titulo: req.body.titulo, // Corrigido para 'titulo'
        descricao: req.body.descricao,
        status: req.body.status.toLowerCase(), 
        dataCriacao: new Date(),
        dataConclusao: req.body.dataConclusao
    }

    tarefas.push(novaTarefa);
    res.status(201).json(novaTarefa);
});

// PUT - atualizar
app.put('/tarefas/:id', (req, res) => {
    const tarefa = tarefas.find(t => t.id === parseInt(req.params.id));

    if (!tarefa) {
        return res.status(404).json({
            message: 'Tarefa não encontrada.'
        });
    }

    // Atualizar os campos que foram enviados no body da requisição

    if (req.body.status) {
        tarefa.status = req.body.status.toLowerCase(); // Converte para minúsculas
    }

    if (req.body.titulo) { // Corrigido para 'titulo'
        tarefa.titulo = req.body.titulo;
    }

    if (req.body.descricao) {
        tarefa.descricao = req.body.descricao;
    }

    if (req.body.dataCriacao) {
        tarefa.dataCriacao = req.body.dataCriacao;
    }

    if (req.body.dataConclusao) {
        tarefa.dataConclusao = req.body.dataConclusao;
    }

    res.json(tarefa);
});

// DELETE
app.delete('/tarefas/:id', (req, res) => {
    const tarefaIndex = tarefas.findIndex(t => t.id === parseInt(req.params.id));

    if (tarefaIndex === -1) {
        return res.status(404).json({
            message: 'Tarefa não encontrada'
        });
    }
    tarefas.splice(tarefaIndex, 1);
    res.status(204).send();
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
