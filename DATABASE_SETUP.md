# Configuração do Banco de Dados - Multi-tenant

## Estrutura das Tabelas

### 1. Tabela `clientes`
```sql
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR,
  telefone VARCHAR,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Tabela `itens`
```sql
CREATE TABLE itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Tabela `pedidos`
```sql
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  data_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Tabela `pedido_itens`
```sql
CREATE TABLE pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES itens(id) ON DELETE CASCADE NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuração de Segurança

### 1. Executar as políticas RLS
Execute o arquivo `supabase-rls-policies.sql` no SQL Editor do Supabase para configurar as políticas de segurança.

### 2. Verificar autenticação
- Desabilite o registro público se não precisar
- Configure apenas login com email/senha
- Certifique-se de que todos os usuários têm acesso apenas aos seus próprios dados

## Recursos Implementados

### ✅ Autenticação e Autorização
- Login apenas (sem auto-registro)
- Proteção de rotas
- Verificação de usuário em todas as operações

### ✅ Multi-tenant
- Coluna `usuario_id` em todas as tabelas
- Filtros por usuário em todas as consultas
- Políticas RLS para segurança no banco

### ✅ CRUD Completo
- **Clientes**: Criar, listar, excluir (com verificação de usuário)
- **Itens**: Criar, listar, excluir (com verificação de usuário)
- **Pedidos**: Criar, listar, alterar status, excluir (com verificação de usuário)

### ✅ Interface Moderna
- Design responsivo com Tailwind CSS
- Kanban e lista para pedidos
- Formulários acessíveis
- Estados de loading e erro

### ✅ Funcionalidades Avançadas
- Dashboard com estatísticas
- Navegação intuitiva
- Filtros por status nos pedidos
- Visualizações múltiplas (lista/kanban)

## Próximos Passos

1. **Executar as políticas RLS** no Supabase
2. **Testar a aplicação** com múltiplos usuários
3. **Configurar domínio customizado** (opcional)
4. **Adicionar mais funcionalidades** conforme necessário

## Segurança Implementada

### Nível de Aplicação
- Verificação de usuário em todas as operações
- Filtros por `usuario_id` em todas as consultas
- Proteção de rotas com ProtectedRoute

### Nível de Banco de Dados
- Row Level Security (RLS) habilitado
- Políticas que garantem acesso apenas aos dados do usuário
- Foreign keys para manter integridade referencial

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Estilo**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Autenticação**: Supabase Auth
- **Segurança**: RLS + Verificações no app
