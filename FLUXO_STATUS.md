# Fluxo de Status dos Pedidos

## 🔄 Funcionalidade de Voltar Status

### Fluxo Normal dos Status
```
Pendente → Em Andamento → Concluído
    ↓
Cancelado
```

### Fluxo de Reversão
```
Pendente ← Em Andamento ← Concluído
    ↑
Cancelado
```

## 🎯 Regras de Negócio

### Status Disponíveis
- **Pendente**: Status inicial do pedido
- **Em Andamento**: Pedido sendo processado
- **Concluído**: Pedido finalizado
- **Cancelado**: Pedido cancelado

### Transições Permitidas

#### Avançar Status
- **Pendente** → **Em Andamento** (Botão Play ▶️)
- **Em Andamento** → **Concluído** (Botão CheckCircle ✅)
- **Qualquer Status** → **Cancelado** (Botão XCircle ❌)

#### Voltar Status
- **Em Andamento** → **Pendente** (Botão RotateCcw ↩️)
- **Concluído** → **Em Andamento** (Botão RotateCcw ↩️)
- **Cancelado** → **Pendente** (Botão RotateCcw ↩️)

#### Restrições
- **Pendente**: Não pode voltar (é o status inicial)
- Todas as transições exigem confirmação do usuário

## 🎨 Interface Visual

### Ícones dos Botões
| Ação | Ícone | Cor | Tooltip |
|------|-------|-----|---------|
| Iniciar | ▶️ `Play` | Azul | "Iniciar pedido" |
| Concluir | ✅ `CheckCircle` | Verde | "Concluir pedido" |
| Cancelar | ❌ `XCircle` | Laranja | "Cancelar pedido" |
| Voltar | ↩️ `RotateCcw` | Cinza | "Voltar status" |
| Excluir | 🗑️ `Trash2` | Vermelho | "Excluir pedido" |

### Comportamento Visual
- Botões redondos com hover effects
- Tamanhos diferentes para Lista vs Kanban
- Animação de escala no hover
- Tooltips informativos

## 💡 Casos de Uso

### 1. Correção de Erro
**Cenário**: Pedido foi marcado como "Concluído" por engano
**Ação**: Clicar no botão "Voltar" para retornar para "Em Andamento"

### 2. Reativação de Pedido
**Cenário**: Pedido foi cancelado, mas o cliente quer reativar
**Ação**: Clicar no botão "Voltar" para retornar para "Pendente"

### 3. Ajuste de Fluxo
**Cenário**: Pedido em andamento precisa voltar para revisão
**Ação**: Clicar no botão "Voltar" para retornar para "Pendente"

## 🔒 Segurança

### Validações
- ✅ Verificação de usuário autenticado
- ✅ Verificação de propriedade do pedido (usuario_id)
- ✅ Confirmação antes de alterar status
- ✅ Validação de transições permitidas

### Auditoria
- Todas as mudanças são registradas no banco
- Histórico de alterações mantido
- Operações vinculadas ao usuário

## 📱 Experiência do Usuário

### Feedback Visual
- Confirmação antes de mudanças
- Mensagens de erro claras
- Estados de loading durante operações
- Atualização instantânea da UI

### Responsividade
- Botões adaptativos para diferentes tamanhos
- Layout otimizado para mobile
- Tooltips para orientação do usuário
