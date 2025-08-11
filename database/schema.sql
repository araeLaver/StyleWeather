-- StyleWeather Database Schema
-- Supabase PostgreSQL Database Schema

-- Enable Row Level Security (RLS)
-- This ensures users can only access their own data

-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User profile information
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Personal preferences
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    age_range VARCHAR(10) CHECK (age_range IN ('10-19', '20-29', '30-39', '40-49', '50+')),
    occupation VARCHAR(50),
    style_preference VARCHAR(20) DEFAULT 'casual',
    
    -- Settings
    notifications_enabled BOOLEAN DEFAULT true,
    weather_alerts_enabled BOOLEAN DEFAULT true,
    auto_recommendation_enabled BOOLEAN DEFAULT true,
    
    -- Location preferences
    default_city VARCHAR(100),
    default_latitude DECIMAL(10, 8),
    default_longitude DECIMAL(11, 8),
    
    -- Metadata
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMP WITH TIME ZONE
);

-- Weather cache table
CREATE TABLE weather_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Location
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    city_name VARCHAR(100),
    
    -- Weather data (JSONB for flexible storage)
    weather_data JSONB NOT NULL,
    
    -- Index for location-based queries
    UNIQUE(latitude, longitude)
);

-- Recommendations table
CREATE TABLE recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Context data
    weather_data JSONB NOT NULL,
    calendar_data JSONB DEFAULT '[]'::jsonb,
    user_preferences JSONB NOT NULL,
    
    -- AI recommendation result
    recommended_outfit JSONB NOT NULL,
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback_text TEXT,
    was_used BOOLEAN DEFAULT false,
    
    -- Metadata
    ai_model_version VARCHAR(50),
    processing_time_ms INTEGER,
    
    -- Add index for user queries
    INDEX idx_recommendations_user_created (user_id, created_at DESC)
);

-- User feedback and learning table
CREATE TABLE user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Feedback details
    feedback_type VARCHAR(20) CHECK (feedback_type IN ('like', 'dislike', 'love', 'hate')),
    specific_items JSONB, -- Which specific clothing items they liked/disliked
    improvement_suggestions TEXT,
    
    -- Context
    weather_context JSONB,
    actual_outfit_worn JSONB, -- What they actually wore
    
    INDEX idx_feedback_user_created (user_id, created_at DESC)
);

-- Style preferences learning table
CREATE TABLE style_learning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Learned preferences (JSONB for flexibility)
    preferred_colors JSONB DEFAULT '[]'::jsonb,
    preferred_brands JSONB DEFAULT '[]'::jsonb,
    preferred_styles_by_weather JSONB DEFAULT '{}'::jsonb,
    preferred_styles_by_occasion JSONB DEFAULT '{}'::jsonb,
    
    -- Statistical data
    total_recommendations INTEGER DEFAULT 0,
    positive_feedback_count INTEGER DEFAULT 0,
    negative_feedback_count INTEGER DEFAULT 0,
    
    -- AI learning weights
    learning_weights JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(user_id)
);

-- Usage analytics table
CREATE TABLE usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Session info
    session_id VARCHAR(100),
    screen_name VARCHAR(50),
    action_type VARCHAR(50), -- 'view', 'recommendation_request', 'feedback', etc.
    
    -- Context data
    weather_temp INTEGER,
    weather_condition VARCHAR(50),
    time_of_day INTEGER, -- Hour of day (0-23)
    day_of_week INTEGER, -- 1-7 (Monday=1)
    
    -- Performance metrics
    response_time_ms INTEGER,
    error_occurred BOOLEAN DEFAULT false,
    error_message TEXT,
    
    -- Device info
    device_type VARCHAR(20), -- 'ios', 'android', 'web'
    app_version VARCHAR(20),
    
    INDEX idx_analytics_user_created (user_id, created_at DESC),
    INDEX idx_analytics_created (created_at DESC)
);

-- Premium subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Subscription details
    plan_type VARCHAR(20) CHECK (plan_type IN ('basic', 'premium', 'premium_plus')),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    
    -- Billing
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    
    -- Payment info (store external payment IDs)
    stripe_subscription_id VARCHAR(100),
    google_play_purchase_token TEXT,
    app_store_transaction_id TEXT,
    
    -- Metadata
    trial_days INTEGER DEFAULT 0,
    price_paid DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    INDEX idx_subscriptions_user_status (user_id, status)
);

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for recommendations table
CREATE POLICY "Users can view own recommendations" ON recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_feedback table
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for style_learning table
CREATE POLICY "Users can view own learning data" ON style_learning
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own learning data" ON style_learning
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for usage_analytics table
CREATE POLICY "Users can insert own analytics" ON usage_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can access analytics for reporting
CREATE POLICY "Service role can view analytics" ON usage_analytics
    FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Weather cache is public (no RLS needed for caching)
-- But we should clean up old entries regularly

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_style_learning_updated_at BEFORE UPDATE ON style_learning
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired weather cache
CREATE OR REPLACE FUNCTION cleanup_expired_weather_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM weather_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to get user recommendations summary
CREATE OR REPLACE FUNCTION get_user_recommendation_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_recommendations', COUNT(*),
        'avg_rating', ROUND(AVG(user_rating)::numeric, 2),
        'recommendations_this_month', COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW())),
        'most_common_weather', (
            SELECT weather_data->>'description'
            FROM recommendations 
            WHERE user_id = p_user_id 
            GROUP BY weather_data->>'description' 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        )
    ) INTO result
    FROM recommendations
    WHERE user_id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for better performance
CREATE INDEX idx_weather_cache_location ON weather_cache USING btree (latitude, longitude);
CREATE INDEX idx_weather_cache_expires ON weather_cache USING btree (expires_at);
CREATE INDEX idx_recommendations_created ON recommendations USING btree (created_at DESC);
CREATE INDEX idx_feedback_created ON user_feedback USING btree (created_at DESC);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles and preferences';
COMMENT ON TABLE weather_cache IS 'Cached weather data to reduce API calls';
COMMENT ON TABLE recommendations IS 'AI-generated outfit recommendations';
COMMENT ON TABLE user_feedback IS 'User feedback on recommendations for learning';
COMMENT ON TABLE style_learning IS 'Machine learning data for personalization';
COMMENT ON TABLE usage_analytics IS 'App usage analytics and performance metrics';
COMMENT ON TABLE subscriptions IS 'Premium subscription management';