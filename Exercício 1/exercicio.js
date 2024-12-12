const fs = require('fs');
const path = require('path'); // Importa o módulo path para manipulação de caminhos de arquivos e diretórios

class BackupSystem {
  // Construtor que inicializa a pasta de origem, pasta de backup, arquivo de log e lista de arquivos processados
  constructor(pastaOrigem, pastaBackup) {
    this.pastaOrigem = pastaOrigem; // Define o diretório de origem
    this.pastaBackup = pastaBackup; // Define o diretório de backup
    this.logFile = path.join(pastaBackup, "backup.log"); // Define o caminho do arquivo de log dentro da pasta de backup
    this.arquivosProcessados = []; // Inicializa um array para armazenar informações sobre os arquivos processados

    // Cria a pasta de backup caso ela não exista
    if (!fs.existsSync(pastaBackup)) {
      fs.mkdirSync(pastaBackup, { recursive: true }); // Cria a pasta de backup recursivamente se necessário
    }
  }

  // Função que inicia o monitoramento da pasta de origem
  iniciar() {
    console.log(`Monitorando a pasta: ${this.pastaOrigem}`);

    const debounce = new Set(); // Usado para evitar duplicação de eventos de mudança de arquivos (debounce)

    // Inicia o monitoramento recursivo das pastas
    this.watchRecursive(this.pastaOrigem, debounce);
  }

  // Função recursiva para monitorar mudanças em arquivos e subpastas
  watchRecursive(pasta, debounce) {
    // Monitora eventos de alteração de arquivos
    fs.watch(pasta, (evento, arquivo) => {
      if (debounce.has(arquivo)) return; // Ignora eventos duplicados

      debounce.add(arquivo); // Adiciona o arquivo ao conjunto para debounce
      setTimeout(() => debounce.delete(arquivo), 300); // Remove após 300ms

      if (arquivo.startsWith(".")) return; // Ignora arquivos ocultos

      // Chama a função de backup ao detectar alterações
      this.realizarBackup(path.join(pasta, arquivo));
    });

    // Monitoramento recursivo de subpastas
    fs.readdirSync(pasta).forEach(item => {
      const caminho = path.join(pasta, item);
      if (fs.statSync(caminho).isDirectory()) {
        // Recursivamente chama a função para pastas
        this.watchRecursive(caminho, debounce);
      }
    });
  }

  // Função que realiza o backup de um arquivo
  async realizarBackup(arquivo) {
    const origem = arquivo; // Caminho do arquivo de origem
    const destino = path.join(this.pastaBackup, path.relative(this.pastaOrigem, arquivo)); // Caminho de destino

    if (fs.existsSync(origem)) {
      try {
        let tentativas = 0;
        const MAX_TENTATIVAS = 5;
        let sucesso = false;

        // Tenta realizar a cópia do arquivo, com até 5 tentativas em caso de erro
        while (tentativas < MAX_TENTATIVAS && !sucesso) {
          try {
            fs.copyFileSync(origem, destino); // Tenta copiar o arquivo
            sucesso = true; // Se a cópia for bem-sucedida, sai do loop
          } catch (erro) {
            if (erro.code === "EBUSY") {
              tentativas++; // Tenta novamente se o arquivo estiver ocupado
              console.log(`Arquivo ocupado, tentativa ${tentativas} de ${MAX_TENTATIVAS}`);
              await this.delay(500); // Delay de 500ms
            } else {
              throw erro; // Lança erro se não for "EBUSY"
            }
          }
        }

        // Se a cópia for bem-sucedida
        if (sucesso) {
          const data = new Date().toISOString();
          const logMessage = `[${data}] Backup realizado: ${arquivo}\n`; // Formatação da mensagem de log
          fs.appendFileSync(this.logFile, logMessage); // Adiciona o log no arquivo
          console.log(`Backup realizado: ${arquivo}`);
          
          // Registra o arquivo como processado no relatório
          this.arquivosProcessados.push({
            arquivo: path.relative(this.pastaOrigem, arquivo), // Nome relativo do arquivo
            status: 'sucesso', // Status de sucesso
            dataBackup: new Date().toISOString() // Data do backup
          });

          // Gera o relatório após o backup
          this.gerarRelatorio();
        } else {
          console.error(`Falha ao fazer backup de ${arquivo} após várias tentativas.`);
        }
      } catch (erro) {
        console.error(`Erro ao fazer backup de ${arquivo}:`, erro);
      }
    }
  }

  // Função para gerar o relatório em formato JSON
  gerarRelatorio() {
    // Criação do relatório com dados sobre os arquivos processados
    const relatorio = {
      timestamp: new Date().toISOString(), // Data e hora do relatório
      arquivosProcessados: this.arquivosProcessados, // Lista dos arquivos processados
      sucessos: this.arquivosProcessados.filter(a => a.status === 'sucesso').length, // Contagem dos sucessos
      falhas: this.arquivosProcessados.filter(a => a.status === 'falha').length, // Contagem das falhas
      tamanhoTotal: this.calcularTamanhoPasta(this.pastaBackup) // Calcula o tamanho total da pasta de backup
    };

    // Caminho para salvar o relatório em JSON
    const relatorioPath = path.join(this.pastaBackup, 'relatorio_backup.json');
    fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2)); // Salva o arquivo JSON formatado
    console.log('Relatório de backup gerado em: ', relatorioPath);
  }

  // Função para calcular o tamanho total da pasta de backup
  calcularTamanhoPasta(pasta) {
    let tamanhoTotal = 0; // Inicializa o tamanho total

    // Lê os arquivos dentro da pasta de backup
    const arquivos = fs.readdirSync(pasta);
    arquivos.forEach(arquivo => {
      const caminhoCompleto = path.join(pasta, arquivo); // Caminho completo do arquivo

      const stats = fs.statSync(caminhoCompleto); // Obtém informações sobre o arquivo
      if (stats.isFile()) {
        tamanhoTotal += stats.size; // Soma o tamanho dos arquivos
      }
    });

    return tamanhoTotal; // Retorna o tamanho total da pasta
  }

  // Função que cria um delay antes de tentar novamente copiar um arquivo
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // Retorna uma Promise que resolve após o tempo especificado
  }
}

// Inicializa o sistema de backup e inicia o monitoramento
const backup = new BackupSystem("./pasta-monitorada", "./pasta-backup");
backup.iniciar(); // Inicia o monitoramento da pasta
