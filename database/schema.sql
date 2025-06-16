-- DomínioTech Database Schema for Neon PostgreSQL
-- Garantir extensão pgcrypto para utilizar gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ai_analyses CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS store_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- Create stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Address
    address_street VARCHAR(255) NOT NULL,
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_state CHAR(2) NOT NULL,
    address_zip_code VARCHAR(9) NOT NULL,
    address_lat DECIMAL(10, 8),
    address_lng DECIMAL(11, 8),
    
    -- Contact
    contact_phone VARCHAR(20) NOT NULL,
    contact_whatsapp VARCHAR(20),
    contact_email VARCHAR(255) NOT NULL,
    
    -- Business Info
    business_cnpj VARCHAR(18) UNIQUE,
    business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('restaurant', 'bar', 'cafe', 'bakery', 'pizzeria', 'other')),
    business_operating_hours JSONB DEFAULT '[]',
    business_tables INTEGER DEFAULT 0,
    business_capacity INTEGER DEFAULT 0,
    
    -- Settings
    settings_currency VARCHAR(3) DEFAULT 'BRL',
    settings_timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    settings_language VARCHAR(5) DEFAULT 'pt-BR',
    settings_accepts_online_orders BOOLEAN DEFAULT false,
    settings_accepts_reservations BOOLEAN DEFAULT false,
    settings_delivery_enabled BOOLEAN DEFAULT false,
    settings_delivery_radius INTEGER DEFAULT 5,
    settings_minimum_order_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Subscription
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
    subscription_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date TIMESTAMP,
    subscription_features TEXT[] DEFAULT '{}',
    
    -- Images
    images_logo VARCHAR(500),
    images_cover VARCHAR(500),
    images_gallery TEXT[] DEFAULT '{}',
    
    -- Social Media
    social_facebook VARCHAR(255),
    social_instagram VARCHAR(255),
    social_twitter VARCHAR(255),
    social_linkedin VARCHAR(255),
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'manager', 'employee')),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: only superadmin can have null store_id
    CONSTRAINT check_store_requirement CHECK (
        (role = 'superadmin' AND store_id IS NULL) OR 
        (role != 'superadmin' AND store_id IS NOT NULL)
    )
);

-- Create store_stats table
CREATE TABLE store_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    average_ticket DECIMAL(10, 2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    
    -- AI Metrics
    ai_efficiency_score DECIMAL(5, 2),
    ai_suggestions_accepted INTEGER DEFAULT 0,
    ai_suggestions_total INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(store_id, date)
);

-- Create user_sessions table for tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_messages table for chat history
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Metadata
    intent VARCHAR(100),
    confidence DECIMAL(3, 2),
    suggestions TEXT[],
    tokens_used INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_analyses table
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL CHECK (type IN ('sales', 'inventory', 'customer', 'financial', 'operational')),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    
    -- Analysis Data
    insights JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    data JSONB,
    
    -- Period analyzed
    period_start DATE,
    period_end DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Optional references
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES ai_analyses(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_active ON stores(is_active);
CREATE INDEX idx_stores_subscription ON stores(subscription_status, subscription_plan);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_store ON users(store_id);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_store_stats_store_date ON store_stats(store_id, date DESC);

CREATE INDEX idx_ai_messages_user ON ai_messages(user_id);
CREATE INDEX idx_ai_messages_store ON ai_messages(store_id);
CREATE INDEX idx_ai_messages_created ON ai_messages(created_at DESC);

CREATE INDEX idx_ai_analyses_store ON ai_analyses(store_id);
CREATE INDEX idx_ai_analyses_type ON ai_analyses(type);
CREATE INDEX idx_ai_analyses_created ON ai_analyses(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default superadmin user (password: DominioTech@2025)
-- Password is hashed with bcrypt
INSERT INTO users (name, email, password_hash, role, store_id) 
VALUES (
    'Super Admin', 
    'admin@dominiotech.com', 
    '$2a$10$X8.Z6KmJNBQKpJzVqZyJZOmRhF4cLNwEhYUX1FnCDwF5x1kqGvHSe', -- DominioTech@2025
    'superadmin', 
    NULL
); 