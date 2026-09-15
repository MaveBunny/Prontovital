# Guia de Configuração: Node.js e React

Para que o projeto React funcione, você precisará do **Node.js** instalado na sua máquina. O Node.js inclui o `npm` (Node Package Manager), que é o gerenciador de pacotes que baixa e configura todas as ferramentas e bibliotecas que o React precisa.

Neste repositório, criamos a pasta `prontovital-web`, que já contém toda a estrutura do projeto React usando uma ferramenta moderna chamada **Vite**.

## Passo 1: Instalar o Node.js
*Nota: Se você já tiver o Node.js instalado, pode pular esta etapa.*

1. Acesse o site oficial do Node.js: [https://nodejs.org/](https://nodejs.org/)
2. Baixe a versão recomendada para a maioria dos usuários (LTS - Long Term Support).
3. Execute o instalador que você baixou e siga o passo a passo (Next > Next > Install). As configurações padrão já são suficientes.

Para verificar se a instalação deu certo, abra um terminal e digite:
```bash
node -v
npm -v
```
Se ambos os comandos retornarem uma numeração (a versão), a instalação foi um sucesso!

## Passo 2: Acessar a pasta do projeto

O código do frontend (React) está dentro da pasta `prontovital-web`. Pelo terminal, navegue até ela:

```bash
cd prontovital-web
```

## Passo 3: Baixar as dependências (Pasta node_modules)

O React utiliza vários pacotes para funcionar. Estes pacotes não são enviados para o GitHub porque são pesados (eles ficam na pasta `node_modules`). Para baixá-los na sua máquina, rode o comando:

```bash
npm install
```

*(Este processo demora alguns segundos dependendo da conexão com a internet).*

## Passo 4: Rodar o projeto React

Após a instalação terminar, você já pode inicializar o servidor de desenvolvimento do React rodando:

```bash
npm run dev
```

Pronto! O terminal vai te mostrar um link local (geralmente `http://localhost:5173/`). É só segurar a tecla `Ctrl` e clicar no link (ou copiar e colar no navegador) para ver sua aplicação rodando.
