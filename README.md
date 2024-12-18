# Exemplo de Servidor SSE (Server-Sent Events)

Este projeto demonstra como implementar um servidor SSE (Server-Sent Events) simples usando **Node.js** e **Express**. O servidor permite enviar mensagens em tempo real para os clientes conectados através de uma conexão persistente, e também permite publicar mensagens para clientes específicos ou para todos os clientes conectados.

## Estrutura de Pastas

```
.
├── server
│   └── index.ts       # Código do servidor Express
└── web
    └── index.html     # Front-end HTML para visualizar as mensagens SSE
```

## Tecnologias

- **Node.js**
- **Express**
- **SSE (Server-Sent Events)**
- **HTML e JavaScript**

## Como Executar o Projeto

### 1. Clonar o repositório

Primeiro, clone o repositório para sua máquina local:

```bash
git clone <url>
cd event-source.poc
```

### 2. Instalar Dependências

Dentro da pasta do projeto, instale as dependências do servidor com o Yarn (ou npm):

```bash
yarn install
```

Ou, se estiver usando o npm:

```bash
npm install
```

### 3. Executar o Servidor

Com as dependências instaladas, você pode iniciar o servidor:

```bash
yarn start
```

Ou, se estiver usando o npm:

```bash
npm start
```

O servidor estará rodando na porta `3000` por padrão.

### 4. Acessar a Interface Web

Abra o arquivo `web/index.html` no seu navegador. Ele irá se conectar automaticamente ao servidor SSE e começar a exibir as mensagens enviadas pelo servidor.

## Rotas do Servidor

### 1. `/stream/:id`

- **Método**: `GET`
- **Descrição**: Esta rota estabelece uma conexão SSE para o cliente com o `id` fornecido na URL. O servidor envia eventos em tempo real para este cliente.
- **Exemplo**: `http://localhost:3000/stream/<client_id>`
  
  O cliente precisa passar um `id` exclusivo, que será usado para identificar a conexão. Esse `id` pode ser gerado no front-end utilizando a função `crypto.randomUUID()`.

### 2. `/clients`

- **Método**: `GET`
- **Descrição**: Retorna uma lista de todos os `clientId` de clientes conectados.
- **Exemplo**: `http://localhost:3000/clients`
  
  Essa rota permite verificar quais clientes estão conectados no servidor.

### 3. `/publish/:clientId/status/:status`

- **Método**: `GET`
- **Descrição**: Envia um evento para um cliente específico, identificado pelo `clientId`, com o `status` fornecido.
- **Exemplo**: `http://localhost:3000/publish/1234/status/active`

  Esta rota permite enviar uma mensagem personalizada para um cliente específico. O `status` pode ser qualquer valor que você queira que o cliente receba (por exemplo, `active`, `inactive`, etc.).

### 4. `/publish/status/:status`

- **Método**: `GET`
- **Descrição**: Envia um evento com o `status` para **todos os clientes** conectados.
- **Exemplo**: `http://localhost:3000/publish/status/maintenance`

  Com essa rota, você pode publicar uma mensagem para todos os clientes conectados simultaneamente.

## Curl

```bash
# 1. Conectar um cliente para receber SSE
curl -N http://localhost:3000/stream/1234

# 2. Obter a lista de clientes conectados
curl http://localhost:3000/clients

# 3. Publicar um status para um cliente específico
curl http://localhost:3000/publish/1234/status/active

# 4. Publicar um status para todos os clientes
curl http://localhost:3000/publish/status/maintenance
```

## Como Funciona

### Servidor:

- **Conexões SSE**: O servidor mantém uma conexão persistente com cada cliente conectado. Ele envia dados de forma contínua para os clientes por meio da rota `/stream/:id`.
- **Publicação de Status**: A rota `/publish/:clientId/status/:status` permite enviar um evento específico para um cliente, enquanto a rota `/publish/status/:status` envia um evento para todos os clientes conectados.

### Front-end:

- O **front-end** em `web/index.html` usa a API `EventSource` para se conectar ao servidor e exibir as mensagens recebidas em tempo real. As mensagens são exibidas em uma lista `<ul>`, e a rolagem automática para o final da lista é feita conforme novas mensagens são recebidas.

## Exemplo de Mensagens no Front-End

O front-end exibirá as mensagens recebidas na interface da seguinte maneira:

```plaintext
Status: active
Status: maintenance
```

## Considerações

- Este exemplo é adequado para um cenário de teste ou aprendizado. Para um ambiente de produção, considere adicionar **segurança**, **gerenciamento de erros** e **escalabilidade**, como Redis para gerenciar múltiplas instâncias de servidores.
- Este projeto pode ser expandido para incluir funcionalidades como **autenticação**, **validação de dados** e **logs detalhados**.

## Licença

Este projeto está licenciado sob a MIT License - consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

```