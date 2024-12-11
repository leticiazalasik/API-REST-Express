// routes/users.js
const express = require('express');
const router = express.Router(); // Aqui criamos um roteador, não usamos 'app' diretamente

// Definindo a rota para listar os usuários
router.get('/', (req, res) => {
    res.json({ users: ['Alice', 'Bob', 'Charlie'] });
});

// Definindo a rota para obter um usuário com id dinâmico
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Usuário ID: ${userId}`);
});

// Definindo a rota POST para criar um novo usuário
router.post('/', express.json(), (req, res) => {
    const newUser = req.body;
    res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });
});

// Exportando as rotas
module.exports = router;
