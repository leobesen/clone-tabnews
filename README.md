# clone-tabnews

Implementação do TabNews para o [curso.dev](https://curso.dev) de [Filipe Deschamps](https://github.com/filipedeschamps).

## 📋 Descrição

TabNews é uma plataforma de compartilhamento de notícias focada em conteúdo técnico. Este projeto é uma implementação educacional que busca reproduzir as funcionalidades principais da plataforma como parte do curso.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev) 18
- **Framework**: [Next.js](https://nextjs.org) 13
- **Testing**: [Jest](https://jestjs.io)
- **Code Formatting**: [Prettier](https://prettier.io)
- **License**: MIT

## 📁 Estrutura do Projeto

```
clone-tabnews/
├── models/              # Lógica de negócio
│   └── calculadora.js
├── pages/               # Páginas e rotas Next.js
│   ├── index.js         # Página inicial
│   └── api/             # Rotas de API
│       └── status.js    # Endpoint de status
├── tests/               # Testes automatizados
│   ├── unit/            # Testes unitários
│   │   └── calculadora.test.js
│   └── integration/     # Testes de integração
├── package.json
└── README.md
```

## 🚀 Começando

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Build para Produção

```bash
# Fazer build
npm run build

# Iniciar servidor de produção
npm start
```

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Faz build para produção |
| `npm start` | Inicia servidor de produção |
| `npm test` | Executa testes uma vez |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run lint:check` | Verifica formatação do código |
| `npm run lint:fix` | Corrige formatação do código |

## 🧪 Testes

### Executar Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch (observa mudanças)
npm run test:watch
```

Os testes estão organizados em:
- **unit/**: Testes unitários para funções e componentes isolados
- **integration/**: Testes de integração entre múltiplos componentes

## 📝 Formatação de Código

O projeto usa Prettier para manter consistência no código:

```bash
# Verificar formatação
npm run lint:check

# Corrigir formatação automaticamente
npm run lint:fix
```

## 🔗 API Endpoints

### GET `/api/status`

Retorna o status da aplicação.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-05T10:30:00.000Z"
}
```

## 📄 Licença

MIT - veja [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido como parte do [curso.dev](https://curso.dev) de Filipe Deschamps.
