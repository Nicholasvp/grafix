-- Políticas de Segurança (RLS) para Supabase
-- Execute estes comandos no SQL Editor do Supabase para garantir segurança a nível de banco de dados

-- Habilitar RLS para a tabela clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios clientes
CREATE POLICY "Usuários podem ver apenas seus próprios clientes" ON clientes
  FOR SELECT USING (auth.uid() = usuario_id);

-- Política para permitir que usuários insiram clientes para si mesmos
CREATE POLICY "Usuários podem inserir clientes para si mesmos" ON clientes
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política para permitir que usuários atualizem apenas seus próprios clientes
CREATE POLICY "Usuários podem atualizar apenas seus próprios clientes" ON clientes
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Política para permitir que usuários excluam apenas seus próprios clientes
CREATE POLICY "Usuários podem excluir apenas seus próprios clientes" ON clientes
  FOR DELETE USING (auth.uid() = usuario_id);

-- Habilitar RLS para a tabela itens
ALTER TABLE itens ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios itens
CREATE POLICY "Usuários podem ver apenas seus próprios itens" ON itens
  FOR SELECT USING (auth.uid() = usuario_id);

-- Política para permitir que usuários insiram itens para si mesmos
CREATE POLICY "Usuários podem inserir itens para si mesmos" ON itens
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política para permitir que usuários atualizem apenas seus próprios itens
CREATE POLICY "Usuários podem atualizar apenas seus próprios itens" ON itens
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Política para permitir que usuários excluam apenas seus próprios itens
CREATE POLICY "Usuários podem excluir apenas seus próprios itens" ON itens
  FOR DELETE USING (auth.uid() = usuario_id);

-- Habilitar RLS para a tabela pedidos
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios pedidos
CREATE POLICY "Usuários podem ver apenas seus próprios pedidos" ON pedidos
  FOR SELECT USING (auth.uid() = usuario_id);

-- Política para permitir que usuários insiram pedidos para si mesmos
CREATE POLICY "Usuários podem inserir pedidos para si mesmos" ON pedidos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política para permitir que usuários atualizem apenas seus próprios pedidos
CREATE POLICY "Usuários podem atualizar apenas seus próprios pedidos" ON pedidos
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Política para permitir que usuários excluam apenas seus próprios pedidos
CREATE POLICY "Usuários podem excluir apenas seus próprios pedidos" ON pedidos
  FOR DELETE USING (auth.uid() = usuario_id);

-- Habilitar RLS para a tabela pedido_itens
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;

-- Política para pedido_itens - permitir operações se o pedido pertence ao usuário
CREATE POLICY "Usuários podem gerenciar itens de seus próprios pedidos" ON pedido_itens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = pedido_itens.pedido_id 
      AND pedidos.usuario_id = auth.uid()
    )
  );

-- Política para inserir itens em pedidos próprios
CREATE POLICY "Usuários podem inserir itens em seus próprios pedidos" ON pedido_itens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = pedido_itens.pedido_id 
      AND pedidos.usuario_id = auth.uid()
    )
  );

-- IMPORTANTE: Certifique-se de que todas as tabelas tenham a coluna usuario_id do tipo UUID
-- e que seja referenciada como foreign key para auth.users se necessário.

-- Exemplo de como adicionar a coluna usuario_id se não existir:
-- ALTER TABLE clientes ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE itens ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE pedidos ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
