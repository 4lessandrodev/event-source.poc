import express, { Request, Response } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3000;
const server = express();
server.use(express.json());

/**
 * Mapa que mantém as conexões ativas com os clientes.
 * A chave é o ID do cliente, o valor é o objeto `Response` da conexão SSE.
 */
const clients = new Map<string, Response>();

server.use(cors({ origin: '*' }));

/**
 * Função auxiliar para enviar uma mensagem a todos os clientes conectados.
 * Esta função itera sobre todas as conexões armazenadas no mapa `clients`
 * e escreve uma mensagem SSE em cada uma.
 * 
 * @param message - Mensagem a ser enviada a todos os clientes.
 */
function broadcast(message: string): void {
    for (const clientRes of clients.values()) {
        clientRes.write(`data: ${message}\n\n`);
    }
}

/**
 * Retorna a hora atual (HH:MM) no formato string, 
 * útil para registrar o momento de eventos no chat.
 */
function getCurrentTime(): string {
    const formatter = Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit'
    });
    const time = formatter.format(new Date());
    return time + 'h';
}

/**
 * Rota SSE para conectar um novo cliente.
 * 
 * Ao acessar `/stream/:id`, o cliente estabelece uma conexão SSE.
 * - Configura os headers necessários para SSE.
 * - Adiciona o novo cliente ao mapa de conexões.
 * - Notifica todos os clientes da entrada do novo usuário.
 * - Ao desconectar, remove o cliente e notifica a saída.
 */
server.get('/stream/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    // Configuração dos cabeçalhos SSE
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    res.flushHeaders();

    // Quando o cliente fecha a conexão
    req.on('close', () => {
        clients.delete(id);
        broadcast(`usuário ${id} saiu. ${getCurrentTime()}`);
        res.end();
    });

    // Caso haja erros na conexão
    req.on('error', (err) => {
        console.error(`Erro na conexão do cliente ${id}:`, err);
    });

    console.log(`cliente ${id} conectou`);
    clients.set(id, res);

    // Notifica todos da entrada do usuário
    broadcast(`usuário ${id} entrou. ${getCurrentTime()}`);
});

/**
 * Rota para obter todos os usuários conectados.
 * Retorna um array contendo todos os IDs dos clientes atualmente conectados.
 */
server.get('/users', (req: Request, res: Response) => {
    const connectedUsers = Array.from(clients.keys());
    res.status(200).json(connectedUsers);
});

/**
 * Rota para enviar uma mensagem para todos os usuários conectados,
 * originada por um usuário específico.
 * 
 * Ao acessar `/users/:userId/publish/messages/:message`:
 * - O parâmetro `message` deve estar em Base64.
 * - A mensagem é decodificada para UTF-8.
 * - Os caracteres acentuados são removidos por substituições equivalentes.
 * - A mensagem final é enviada a todos os clientes, precedida pelo `userId`.
 */
server.post('/users/:userId/publish/messages', (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const message = req.body.message;

        broadcast(`${userId} diz: ${message}. ${getCurrentTime()}`);
        res.status(200).end('Ok');
    } catch (error) {
        console.error('Erro ao publicar mensagem:', error);
        res.status(500).send('Erro inesperado: ' + (error as Error).message);
    }
});

/**
 * Rota principal que serve o arquivo `index.html`.
 * Esta página conterá o frontend do chat SSE.
 */
server.get('/', (_: Request, res: Response) => {
    try {
        const html = readFileSync(path.join('index.html'), 'utf8');
        res.type('html').send(html);
    } catch (error) {
        console.error('Erro ao ler index.html:', error);
        res.status(500).send('Não foi possível carregar a página.');
    }
});

/**
 * Inicia o servidor na porta definida em `PORT` (por padrão 3000).
 */
server.listen(PORT, () => {
    console.log('Servidor SSE rodando na porta: ' + PORT);
});
