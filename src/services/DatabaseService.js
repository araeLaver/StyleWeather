import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config/config';

class DatabaseService {
  constructor() {
    this.supabase = createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY
    );
  }

  // ========================================
  // USER MANAGEMENT
  // ========================================

  async createUser(userData) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUser(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // RECOMMENDATIONS
  // ========================================

  async saveRecommendation(recommendationData) {
    try {
      const { data, error } = await this.supabase
        .from('recommendations')
        .insert([recommendationData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save recommendation error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserRecommendations(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get user recommendations error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateRecommendationFeedback(recommendationId, feedback) {
    try {
      const { data, error } = await this.supabase
        .from('recommendations')
        .update(feedback)
        .eq('id', recommendationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update recommendation feedback error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // USER FEEDBACK
  // ========================================

  async saveFeedback(feedbackData) {
    try {
      const { data, error } = await this.supabase
        .from('user_feedback')
        .insert([feedbackData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save feedback error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserFeedbackHistory(userId, limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from('user_feedback')
        .select(`
          *,
          recommendations (
            recommended_outfit,
            weather_data,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get user feedback history error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // STYLE LEARNING
  // ========================================

  async updateStyleLearning(userId, learningData) {
    try {
      const { data, error } = await this.supabase
        .from('style_learning')
        .upsert([
          {
            user_id: userId,
            ...learningData,
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update style learning error:', error);
      return { success: false, error: error.message };
    }
  }

  async getStyleLearning(userId) {
    try {
      const { data, error } = await this.supabase
        .from('style_learning')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return { success: true, data: data || null };
    } catch (error) {
      console.error('Get style learning error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // WEATHER CACHE
  // ========================================

  async getCachedWeather(latitude, longitude) {
    try {
      const { data, error } = await this.supabase
        .from('weather_cache')
        .select('*')
        .eq('latitude', latitude)
        .eq('longitude', longitude)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: data || null };
    } catch (error) {
      console.error('Get cached weather error:', error);
      return { success: false, error: error.message };
    }
  }

  async cacheWeather(latitude, longitude, weatherData, cityName = null) {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10분 후 만료

      const { data, error } = await this.supabase
        .from('weather_cache')
        .upsert([
          {
            latitude,
            longitude,
            city_name: cityName,
            weather_data: weatherData,
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Cache weather error:', error);
      return { success: false, error: error.message };
    }
  }

  async cleanupExpiredWeatherCache() {
    try {
      const { error } = await this.supabase
        .from('weather_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Cleanup weather cache error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // ANALYTICS
  // ========================================

  async logAnalytics(analyticsData) {
    try {
      const { data, error } = await this.supabase
        .from('usage_analytics')
        .insert([analyticsData]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      // Analytics logging failures shouldn't break the app
      console.warn('Analytics logging failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserAnalytics(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get user analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  async getUserRecommendationSummary(userId) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_recommendation_summary', {
          p_user_id: userId
        });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get recommendation summary error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) throw error;
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get database health info
  async getHealthInfo() {
    try {
      const [
        usersCount,
        recommendationsCount,
        feedbackCount,
        cacheEntries
      ] = await Promise.all([
        this.supabase.from('users').select('id', { count: 'exact', head: true }),
        this.supabase.from('recommendations').select('id', { count: 'exact', head: true }),
        this.supabase.from('user_feedback').select('id', { count: 'exact', head: true }),
        this.supabase.from('weather_cache').select('id', { count: 'exact', head: true })
      ]);

      return {
        success: true,
        data: {
          users: usersCount.count,
          recommendations: recommendationsCount.count,
          feedback: feedbackCount.count,
          weatherCache: cacheEntries.count,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get health info error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new DatabaseService();