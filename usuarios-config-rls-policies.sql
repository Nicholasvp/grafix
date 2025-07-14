-- Políticas RLS para a tabela usuarios_config

-- Habilitar RLS na tabela
ALTER TABLE public.usuarios_config ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários só podem ver seu próprio registro
CREATE POLICY "Usuários podem ver apenas seu próprio registro de configuração"
ON public.usuarios_config
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para INSERT: apenas administradores podem criar novos registros
-- (assumindo que existe uma coluna 'role' ou similar para identificar admins)
CREATE POLICY "Apenas administradores podem criar configurações de usuário"
ON public.usuarios_config
FOR INSERT
TO authenticated
WITH CHECK (false); -- Nenhum usuário pode inserir via aplicação

-- Política para UPDATE: apenas administradores podem atualizar
CREATE POLICY "Apenas administradores podem atualizar configurações de usuário"
ON public.usuarios_config
FOR UPDATE
TO authenticated
USING (false); -- Nenhum usuário pode atualizar via aplicação

-- Política para DELETE: apenas administradores podem deletar
CREATE POLICY "Apenas administradores podem deletar configurações de usuário"
ON public.usuarios_config
FOR DELETE
TO authenticated
USING (false); -- Nenhum usuário pode deletar via aplicação

-- Função para verificar se usuário está ativo (pode ser usada em outras tabelas)
CREATE OR REPLACE FUNCTION public.usuario_esta_ativo()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_config 
    WHERE id = auth.uid() AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo de como usar a função em outras tabelas (clientes, por exemplo)
-- Adicionar esta condição às políticas das outras tabelas:
-- AND public.usuario_esta_ativo() = true
