const path = require('path');
const fs = require('fs');
const TemplateEngine = require('./TemplateEngine'); // Importe a classe TemplateEngine

// Função para formatar a data no formato desejado: 15/12/24 18:00
function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses começam do 0
    const ano = String(data.getFullYear()).slice(2); // Pegando os dois últimos dígitos do ano
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

async function gerarHTML() {
    const templateEngine = new TemplateEngine(); // Instancia a TemplateEngine

    // Caminhos para os arquivos de template e dados
    const templatePath = path.join(__dirname, 'templates', 'mensagem.html');
    const dadosPath = path.join(__dirname, 'data', 'user.json');
    const outputPath = path.join(__dirname, 'output', 'output.html');

    // Ler os dados do arquivo JSON
    const dados = JSON.parse(await fs.promises.readFile(dadosPath, 'utf-8'));

    // Verificar e formatar a data
    if (dados.ultimoAgendaento) {
        dados.ultimoAgendaento = formatarData(new Date(dados.ultimoAgendaento)); // Formatar a data
    }

    // Gera o HTML processado
    await templateEngine.processar(templatePath, dados, outputPath);

    console.log('Template processado com sucesso!');
}

gerarHTML().catch(console.error);
