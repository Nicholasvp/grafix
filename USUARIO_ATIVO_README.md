# Sistema de Verificação de Usuário Ativo

Este sistema implementa uma verificação automática do status de ativação do usuário na aplicação.

## Como Funciona

### 1. Tabela `usuarios_config`
- Controla se cada usuário está ativo ou inativo
- Campo `ativo` (boolean) determina o status
- Referência ao `auth.users` através do campo `id`

### 2. Verificação Automática
A verificação é feita em dois momentos principais:

#### Durante a Navegação
- O `ProtectedRoute` agora inclui o `UserActivityProvider`
- Verifica automaticamente quando o usuário acessa páginas protegidas

#### Durante Operações no Banco
- O `protectedSupabase` intercepta operações nas tabelas protegidas:
  - `clientes`
  - `itens` 
  - `pedidos`
  - `pedido_itens`

### 3. Tabelas Protegidas
As seguintes operações são interceptadas:
- `select` - consultar dados
- `insert` - inserir novos registros
- `update` - atualizar registros
- `upsert` - inserir ou atualizar
- `delete` - excluir registros

### 4. Cache Inteligente
- Verificações são cacheadas por 5 minutos para economizar recursos
- Evita múltiplas consultas desnecessárias ao banco

### 5. Interface do Usuário
Quando um usuário inativo tenta usar o sistema:
- Modal popup é exibido automaticamente
- Mensagem: "Usuário não está ativo, contate o administrador do sistema"
- Opções: Sair do sistema ou Fechar modal

## Arquivos Principais

### Hooks
- `useUserStatus.ts` - Verifica status individual do usuário
- `useUserActivity.tsx` - Gerencia contexto global e modal

### Componentes
- `InactiveUserModal.tsx` - Modal de aviso para usuário inativo
- `ProtectedRoute.tsx` - Atualizado para incluir verificação

### Biblioteca
- `protectedSupabase.ts` - Proxy que intercepta operações do Supabase

## Configuração

### 1. Criar usuário ativo (padrão)
```sql
INSERT INTO usuarios_config (id, ativo, email)
SELECT id, true, email FROM auth.users WHERE id = 'user_id';
```

### 2. Desativar usuário
```sql
UPDATE usuarios_config SET ativo = false WHERE id = 'user_id';
```

### 3. Reativar usuário
```sql
UPDATE usuarios_config SET ativo = true WHERE id = 'user_id';
```

## Eficiência

- **Cache de 5 minutos**: Evita verificações excessivas
- **Verificação sob demanda**: Só verifica quando necessário
- **Interceptação inteligente**: Apenas nas operações que importam
- **Event-driven**: Usa eventos customizados para comunicação entre componentes

## Segurança

- Verificação tanto no frontend quanto seria necessário no backend via RLS
- Usuários inativos não conseguem realizar operações mesmo se tentarem burlar o frontend
- Logout automático em caso de tentativa de uso por usuário inativo
