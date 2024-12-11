// index.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa o módulo 'express' para criar o servidor e as rotas
const express = require('express');

// Cria uma instância do aplicativo Express
const app = express();

// Define a porta que o servidor vai escutar, usando o valor de process.env.PORT ou 3000 como padrão
const PORT = process.env.PORT || 3000;

// Importa as rotas de usuários do arquivo 'routes/users.js'
const userRoutes = require('./routes/users'); // Importe as rotas do arquivo users.js

// Middleware para log de requisições
// Aqui, cada requisição que chega no servidor será registrada no console
app.use((req, res, next) => {
    // Exibe o método HTTP e a URL da requisição
    console.log(`${req.method} ${req.url}`);
    
    // Chama o próximo middleware ou a rota para continuar o processamento da requisição
    next();
});

// Define a rota principal ('/') para o método GET
// Quando um usuário acessar a raiz do servidor, a resposta será 'Bem-vindo ao Express.js!'
app.get('/', (req, res) => {
    res.send('Bem-vindo ao Express.js!');
});

// Usando as rotas de usuário no caminho '/users'
// Agora, todas as rotas definidas em users.js começarão com o prefixo '/users'
// Por exemplo: '/users' se torna '/users/' e '/users/:id' se torna '/users/:id'
app.use('/users', userRoutes); // Agora, todas as rotas definidas em users.js começam com '/users'

// Inicia o servidor na porta definida (3000 ou a especificada no arquivo .env)
// O servidor vai começar a escutar requisições
