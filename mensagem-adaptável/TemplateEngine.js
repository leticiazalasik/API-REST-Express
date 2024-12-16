const fs = require('fs'); // Importa o módulo 'fs' do Node.js para manipulação de arquivos.

// Função para formatar a data no formato desejado: 15/12/24 18:00
function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses começam do 0
    const ano = String(data.getFullYear()).slice(2); // Pegando os dois últimos dígitos do ano
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

class TemplateEngine {
    constructor() {
        // Construtor da classe TemplateEngine. Inicializa um cache para armazenar templates lidos, evitando leituras repetidas do mesmo arquivo.
        this.cache = new Map(); // Cria um mapa para armazenar os templates lidos.
    }

    // Método assíncrono que lê o conteúdo de um template a partir de um caminho de arquivo
    async lerTemplate(caminho) {
        // Verifica se o template já está armazenado no cache
        if (this.cache.has(caminho)) {
            return this.cache.get(caminho); // Se já estiver no cache, retorna o template diretamente
        }

        // Caso o template não esteja no cache, lê o arquivo do caminho especificado
        const template = await fs.promises.readFile(caminho, 'utf-8'); // Lê o arquivo de template de forma assíncrona e o retorna como string.
        this.cache.set(caminho, template); // Armazena o template no cache para evitar leitura repetida no futuro
        return template; // Retorna o conteúdo do template
    }

    // Método que processa o template, substituindo as variáveis no formato {{variavel}} pelos dados fornecidos
    processarTemplate(template, dados) {
        let resultado = template; // Inicializa o resultado como sendo o próprio template original
        // Encontrar todas as variáveis no formato {{variavel}} no template
        const variaveis = template.match(/\{\{([^}]+)\}\}/g) || []; // Usando expressão regular para capturar as variáveis.

        // Para cada variável encontrada, realiza a substituição
        variaveis.forEach(variavel => {
            const chave = variavel.replace(/\{\{|\}\}/g, ''); // Remove as chaves {{}} e obtém a chave da variável (por exemplo, 'nome')

            // Verificar se a chave é para data e formatá-la
            if (chave === 'ultimoAgendamento' && dados[chave]) {
                // Se for a data, formate-a
                dados[chave] = formatarData(new Date(dados[chave])); // Formatar a data no formato desejado
            }

            resultado = resultado.replace(variavel, dados[chave] || ''); // Substitui a variável pelo valor correspondente no objeto 'dados', ou uma string vazia caso não exista a chave.
        });

        return resultado; // Retorna o template com as variáveis substituídas pelos dados
    }

    // Método assíncrono para processar um template a partir de um caminho de arquivo e dados, e salvar o resultado em um arquivo de saída
    async processar(templatePath, dados, outputPath) {
        const template = await this.lerTemplate(templatePath); // Lê o conteúdo do template HTML a partir do caminho especificado
        const resultado = this.processarTemplate(template, dados); // Processa o template, substituindo as variáveis pelos dados fornecidos

        // Criar a pasta de saída se ela não existir
        const outputDir = require('path').dirname(outputPath); // Obtém o diretório do caminho de saída
        if (!fs.existsSync(outputDir)) { // Verifica se o diretório de saída já existe
            fs.mkdirSync(outputDir); // Se o diretório não existir, cria o diretório
        }

        // Salva o HTML processado no arquivo de saída especificado
        await fs.promises.writeFile(outputPath, resultado); // Escreve o conteúdo final (HTML com dados) no arquivo de saída
    }
}

module.exports = TemplateEngine; // Exporta a classe TemplateEngine para ser usada em outros arquivos
