# Etapa 1: Construção da aplicação
FROM node:22 AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de configuração e código da aplicação para dentro do container
COPY package.json .

# Instalar as dependências do projeto
RUN yarn install

# Copiar o restante dos arquivos da aplicação
COPY . .

# Compilar o código TypeScript
RUN yarn build

# Etapa 2: Execução da aplicação
FROM node:22

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar o código compilado da etapa anterior
COPY --from=builder /app /app

# Instalar as dependências de produção (caso você queira otimizar o tamanho da imagem)
RUN yarn install --production

# Definir a variável de ambiente PORT com um valor padrão de 3000
ENV PORT=3000

# Expor a porta configurada pela variável de ambiente
EXPOSE $PORT

# Comando para rodar o servidor
CMD ["yarn", "start"]
