-- ==============================================================================
-- FINTRACK DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Este script crea la base de datos completa con:
-- 1. Profiles (asociado a auth.users de Supabase)
-- 2. Accounts (Cuentas bancarias, tarjetas de crédito, débito, efectivo, inversiones)
-- 3. Categories (Categorías principales de Ingreso y Gasto)
-- 4. Subcategories (Subcategorías dependientes)
-- 5. Tags (Etiquetas transversales)
-- 6. Transactions (Movimientos financieros con soporte de periodo, cuenta, categoría, etc.)
-- 7. Transaction_Tags (Relación N:M para transacciones y etiquetas)
-- 8. Row Level Security (RLS) habilitado en todas las tablas para aislamiento por usuario.
-- 9. Trigger automático para inicializar categorías y subcategorías base al registrar un nuevo usuario.
-- ==============================================================================

-- 1. PROFILES (Extensión de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'MXN',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. ACCOUNTS (Cuentas y Tarjetas)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('debito', 'credito', 'inversion', 'efectivo', 'ahorro')),
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  credit_limit NUMERIC(14, 2) DEFAULT NULL,
  last4 TEXT DEFAULT NULL,
  currency TEXT DEFAULT 'MXN',
  color TEXT DEFAULT '#4338ca',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CATEGORIES (Categorías de Ingreso y Gasto)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT 'category',
  color TEXT DEFAULT '#4338ca',
  budget_monthly NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SUBCATEGORIES (Subcategorías)
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TAGS (Etiquetas para clasificar)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#006c4a',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_tag_name UNIQUE (user_id, name)
);

-- 6. TRANSACTIONS (Bitácora de Movimientos)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(14, 2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT DEFAULT '',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TRANSACTION_TAGS (N a M entre Transacciones y Etiquetas)
CREATE TABLE IF NOT EXISTS public.transaction_tags (
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Asegura que ningún usuario acceda a datos de otro usuario.
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas de Accounts
CREATE POLICY "Users can manage own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

-- Políticas de Categories
CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

-- Políticas de Subcategories
CREATE POLICY "Users can manage own subcategories" ON public.subcategories FOR ALL USING (auth.uid() = user_id);

-- Políticas de Tags
CREATE POLICY "Users can manage own tags" ON public.tags FOR ALL USING (auth.uid() = user_id);

-- Políticas de Transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Políticas de Transaction_Tags
CREATE POLICY "Users can manage own transaction tags" ON public.transaction_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = transaction_tags.transaction_id AND t.user_id = auth.uid()
  )
);

-- ==============================================================================
-- TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- Al registrarse un usuario:
-- 1. Se crea automáticamente su perfil en public.profiles
-- 2. Se le crean categorías y subcategorías base predeterminadas
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  cat_alimentacion UUID;
  cat_vivienda UUID;
  cat_transporte UUID;
  cat_servicios UUID;
  cat_entretenimiento UUID;
  cat_salario UUID;
  cat_inversiones UUID;
BEGIN
  -- Insertar perfil
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- 1. Gastos: Alimentación
  INSERT INTO public.categories (user_id, name, type, icon, color, budget_monthly)
  VALUES (NEW.id, 'Alimentación', 'expense', 'restaurant', '#f97316', 7000.00)
  RETURNING id INTO cat_alimentacion;

  INSERT INTO public.subcategories (user_id, category_id, name) VALUES
  (NEW.id, cat_alimentacion, 'Supermercado'),
  (NEW.id, cat_alimentacion, 'Restaurantes'),
  (NEW.id, cat_alimentacion, 'Cafeterías y Snacks');

  -- 2. Gastos: Vivienda
  INSERT INTO public.categories (user_id, name, type, icon, color, budget_monthly)
  VALUES (NEW.id, 'Vivienda', 'expense', 'home', '#4338ca', 12000.00)
  RETURNING id INTO cat_vivienda;

  INSERT INTO public.subcategories (user_id, category_id, name) VALUES
  (NEW.id, cat_vivienda, 'Renta / Hipoteca'),
  (NEW.id, cat_vivienda, 'Mantenimiento'),
  (NEW.id, cat_vivienda, 'Muebles y Hogar');

  -- 3. Gastos: Transporte
  INSERT INTO public.categories (user_id, name, type, icon, color, budget_monthly)
  VALUES (NEW.id, 'Transporte', 'expense', 'directions_car', '#0284c7', 3500.00)
  RETURNING id INTO cat_transporte;

  INSERT INTO public.subcategories (user_id, category_id, name) VALUES
  (NEW.id, cat_transporte, 'Gasolina'),
  (NEW.id, cat_transporte, 'Uber / Taxi'),
  (NEW.id, cat_transporte, 'Transporte Público');

  -- 4. Gastos: Servicios
  INSERT INTO public.categories (user_id, name, type, icon, color, budget_monthly)
  VALUES (NEW.id, 'Servicios', 'expense', 'bolt', '#eab308', 2500.00)
  RETURNING id INTO cat_servicios;

  INSERT INTO public.subcategories (user_id, category_id, name) VALUES
  (NEW.id, cat_servicios, 'Electricidad y Agua'),
  (NEW.id, cat_servicios, 'Internet y Telefonía'),
  (NEW.id, cat_servicios, 'Suscripciones y Streaming');

  -- 5. Gastos: Entretenimiento
  INSERT INTO public.categories (user_id, name, type, icon, color, budget_monthly)
  VALUES (NEW.id, 'Entretenimiento', 'expense', 'movie', '#a855f7', 2000.00)
  RETURNING id INTO cat_entretenimiento;

  INSERT INTO public.subcategories (user_id, category_id, name) VALUES
  (NEW.id, cat_entretenimiento, 'Cine y Eventos'),
  (NEW.id, cat_entretenimiento, 'Hobbies'),
  (NEW.id, cat_entretenimiento, 'Viajes');

  -- 6. Ingresos: Salario y Nómina
  INSERT INTO public.categories (user_id, name, type, icon, color, budget_monthly)
  VALUES (NEW.id, 'Salario y Nómina', 'income', 'payments', '#006c4a', 0.00)
  RETURNING id INTO cat_salario;

  INSERT INTO public.subcategories (user_id, category_id, name) VALUES
  (NEW.id, cat_salario, 'Sueldo Base'),
  (NEW.id, cat_salario, 'Bonos y Comisiones'),
  (NEW.id, cat_salario, 'Aguinaldo');

  -- 7. Ingresos: Rendimientos e Inversiones
  INSERT INTO public.categories (user_id, name, type, icon, color, budget_monthly)
  VALUES (NEW.id, 'Inversiones y Rendimientos', 'income', 'trending_up', '#059669', 0.00)
  RETURNING id INTO cat_inversiones;

  INSERT INTO public.subcategories (user_id, category_id, name) VALUES
  (NEW.id, cat_inversiones, 'Dividendos'),
  (NEW.id, cat_inversiones, 'Rendimientos Cuentas');

  -- Tags predeterminados
  INSERT INTO public.tags (user_id, name, color) VALUES
  (NEW.id, 'Fijo', '#4338ca'),
  (NEW.id, 'Variable', '#006c4a'),
  (NEW.id, 'Deducible', '#d97706');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador después de crear usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
