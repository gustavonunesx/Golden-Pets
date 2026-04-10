-- ─────────────────────────────────────────────────────────────────────────
-- Execute este SQL no Supabase SQL Editor
-- APÓS ter criado a tabela admin_users com RLS ativado
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Política: admin pode se ver (necessário para o login funcionar)
CREATE POLICY "admin_can_read_own_record"
  ON admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Nenhuma outra operação é permitida pelo client
--    Inserção e deleção de admins só via service_role (painel do Supabase)
--    Isso impede que qualquer usuário se auto-promova a admin

-- 3. Inserir seu usuário como admin
--    Primeiro faça login no site e copie o UUID do usuário em
--    Supabase > Authentication > Users
--    Depois substitua o UUID abaixo e execute:

INSERT INTO admin_users (id, email, role)
VALUES (
  'COLE-AQUI-O-UUID-DO-SEU-USUARIO',  -- ex: a1b2c3d4-e5f6-...
  'seu@email.com',
  'super_admin'
);

-- ─────────────────────────────────────────────────────────────────────────
-- Políticas para as outras tabelas (execute junto)
-- ─────────────────────────────────────────────────────────────────────────

-- PRODUCTS: leitura pública de produtos ativos
CREATE POLICY "products_public_select"
  ON products FOR SELECT
  USING (active = true);

-- CATEGORIES: leitura pública
CREATE POLICY "categories_public_select"
  ON categories FOR SELECT
  USING (true);

-- PRODUCT_IMAGES: leitura pública
CREATE POLICY "product_images_public_select"
  ON product_images FOR SELECT
  USING (true);

-- ORDERS: nenhum acesso pelo client (só via service_role no servidor)
-- Sem policy = acesso zero. Isso é correto e intencional.

-- CUSTOMERS: cliente lê apenas seus próprios dados
CREATE POLICY "customers_read_own"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "customers_insert_own"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "customers_update_own"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

-- ADDRESSES: cliente lê e edita apenas seus próprios endereços
CREATE POLICY "addresses_own_data"
  ON addresses FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());