import express, { Request, Response } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import path from 'path';

const server = express();
const clients = new Map<string, Response>();

server.use(cors({ origin: '*' }));

/**
 * Rota para conectar clientes via SSE (Server-Sent Events).
 * O cliente é identificado pelo ID e recebe eventos em tempo real.
 * 
 * @param req - Requisição recebida do cliente, contendo o parâmetro 'id'.
 * @param res - Resposta que será enviada para o cliente.
 */
server.get('/stream/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    // Configuração dos cabeçalhos para SSE (Server-Sent Events)
    res.set({
        'Content-Type': 'text/event-stream', // Tipo de resposta SSE
        'Cache-Control': 'no-cache',         // Impede cache das mensagens
        'Connection': 'keep-alive',          // Mantém a conexão aberta
        'Access-Control-Allow-Origin': '*'   // Permite acesso de qualquer origem
    });

    res.flushHeaders(); // Envia os cabeçalhos para o cliente

    // Quando o cliente fecha a conexão, removemos o cliente do mapa e finalizamos a resposta
    req.on('close', () => {
        clients.delete(id);
        res.end();
    });

    // Se ocorrer um erro na conexão, o erro será logado
    req.on('error', (err) => {
        console.error(err);
    });

    console.log(`cliente ${id} conectou`);

    // Adiciona o cliente à lista de clientes conectados
    clients.set(id, res);
});

/**
 * Rota para retornar todos os clientes conectados.
 * 
 * @param req - Requisição recebida.
 * @param res - Resposta que retorna a lista de IDs de clientes conectados.
 */
server.get('/clients', (req, res) => {
    // Retorna os IDs dos clientes conectados
    res.status(200).json(Array.from(clients.keys()));
});

/**
 * Rota para enviar uma mensagem para um cliente específico.
 * A mensagem é enviada com o status fornecido pelo parâmetro da URL.
 * 
 * @param req - Requisição que contém o 'clientId' e 'status' como parâmetros.
 * @param res - Resposta que retorna o status da operação.
 */
server.get('/publish/:clientId/status/:status', (req: Request, res: Response) => {
    const { clientId, status } = req.params;
    const client = clients.get(clientId);

    if (client) {
        try {
            // Envia o status para o cliente específico
            client.write(`data: ${status}\n\n`);
            res.status(200).end('Ok');
        } catch (error) {
            // Se ocorrer um erro, o cliente é removido e o erro é tratado
            console.error(`Erro ao enviar para o cliente ${clientId}:`, error);
            clients.delete(clientId);
            res.status(500).send('Erro ao enviar a mensagem');
        }
    } else {
        // Se o cliente não for encontrado, retorna erro 404
        console.error(`Cliente ${clientId} não encontrado`);
        res.status(404).send('Cliente não encontrado');
    }
});

/**
 * Rota para enviar uma mensagem para todos os clientes conectados.
 * A mensagem é enviada com o status fornecido pelo parâmetro da URL.
 * 
 * @param req - Requisição que contém o 'status' como parâmetro.
 * @param res - Resposta que retorna o status da operação.
 */
server.get('/publish/status/:status', (req: Request, res: Response) => {
    try {
        const { status } = req.params;

        // Envia o status para todos os clientes conectados
        clients.values().forEach((res) => res.write(`data: ${status}\n\n`));

        res.status(200).end('Ok');
    } catch (error) {
        // Se ocorrer um erro, retorna uma resposta de erro
        res.status(500).send('Erro inesperado: ' + (error as Error).message);
    }
});

/**
 * Renderiza a página html para o frontend
 */
server.get('/', (_: Request, res: Response) => {
    const html = readFileSync(path.join('index.html'), 'utf8');
    res.send(html);
});

// Inicia o servidor na porta 3000
server.listen(process.env.PORT || 3000, () => console.log('Servidor SSE rodando na porta 3000'));
