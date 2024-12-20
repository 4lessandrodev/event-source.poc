# Chat SSE (Server-Sent Events)

Este projeto demonstra um chat em tempo real utilizando **Server-Sent Events (SSE)**. Com o SSE, os clientes podem manter uma conexão aberta com o servidor para receber atualizações assim que elas acontecem, sem a necessidade de ficar fazendo polling constante.

## Funcionalidades

- **Mensagens em tempo real:** Assim que um usuário envia uma mensagem, todos os clientes conectados recebem o conteúdo imediatamente.
- **Identificação de usuários:** Cada cliente recebe um `userId` único, armazenado no `sessionStorage`, permitindo manter a identidade do usuário entre recargas de página.
- **Notificação de entrada/saída:** Quando um usuário entra ou sai, todos os clientes recebem uma notificação em tempo real.
- **Contagem de usuários online:** A interface exibe quantos usuários estão atualmente conectados, atualizando a contagem sempre que um novo usuário entra ou sai.

## Tecnologias utilizadas

- **Backend:** Node.js com Express.
- **Frontend:** HTML, CSS e JavaScript puro.
- **SSE (Server-Sent Events):** Para comunicação em tempo real do servidor para os clientes.
- **CORS:** Para permitir acesso cruzado entre diferentes origens.

## Como executar o projeto

1. **Instalação de dependências:**
   Certifique-se de ter o Node.js instalado, então instale as dependências:
   ```bash
   npm install
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```
   Por padrão, o servidor rodará na porta `3000` (ou na porta definida em `process.env.PORT`).

3. **Acessar o frontend:**
   Abra o navegador e acesse:
   ```
   http://localhost:3000/
   ```

## Estrutura do projeto

- `server.ts` (ou `index.ts`): Arquivo principal do servidor Node.js, que configura rotas SSE, rota para enviar mensagens, listar usuários, etc.
- `index.html`: Página principal que serve como frontend do chat.  
  - Conexão SSE é estabelecida na rota `/stream/:id`.
  - Envio de mensagens usando `fetch` para `/users/:userId/publish/messages`.
  - Exibição de mensagens em tempo real, bem como notificação de quantos usuários estão online.

## Endpoints

- **GET `/stream/:id`**
  - Estabelece uma conexão SSE com o cliente identificado por `:id`.
  - Notifica todos os usuários quando alguém entra ou sai.

- **GET `/users`**
  - Retorna um array contendo o `userId` de todos os clientes conectados.

- **POST `/users/:userId/publish/messages`**
  - Recebe um objeto JSON no corpo da requisição, com a propriedade `message`.
  - Publica a mensagem para todos os usuários conectados, prefixando-a com o `userId` do remetente.

## Fluxo da aplicação

1. Ao acessar a página `index.html`, um `userId` é gerado (se ainda não existir) e armazenado em `sessionStorage`.
2. O frontend cria uma conexão SSE com o servidor (`/stream/:userId`).
3. Assim que a conexão é estabelecida, o servidor notifica todos sobre a entrada do usuário.
4. O frontend atualiza a contagem de usuários online consultando `/users`.
5. Quando o usuário envia uma mensagem, é feita uma requisição POST para `/users/:userId/publish/messages`.
6. O servidor recebe a mensagem, a transmite para todos via SSE, e todos os clientes exibem a mensagem imediatamente.
7. Ao fechar a página, a conexão SSE é encerrada, e o servidor notifica a saída do usuário.

## Estilização das mensagens

- Mensagens do próprio usuário são exibidas em azul e em negrito, diferenciando-as das mensagens enviadas por outros usuários.

## Customização

- **Alterar cor ou estilo:** Edite o CSS no `index.html`.
- **Ajustar lógica de identificação do usuário:** Edite a lógica de `userId` no script do frontend.
- **Alterar rota base ou porta:** Ajuste a variável `PORT` no servidor ou defina `process.env.PORT`.

## Contribuindo

Contribuições são bem-vindas! Sinta-se livre para criar issues, propor melhorias e enviar pull requests.

## Licença

Este projeto é fornecido sem garantias. Use, modifique e distribua conforme necessário.