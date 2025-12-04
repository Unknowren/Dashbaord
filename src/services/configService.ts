/**
 * Configuration Service
 * Zentrale Stelle für alle Umgebungsvariablen und Konfigurationen
 */

export interface AppConfig {
  debug: boolean;
  siteUrl: string;
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    // Vite stellt Umgebungsvariablen über import.meta.env.VITE_* zur Verfügung
    this.config = {
      debug: this.parseBoolean(import.meta.env.VITE_DEBUG || 'false'),
      siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:3000',
      apiUrl: import.meta.env.VITE_API_EXTERNAL_URL || 'http://localhost:8000',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };

    if (this.config.debug) {
      console.log('🐛 DEBUG MODE ENABLED');
      console.log('Config:', this.config);
    }
  }

  private parseBoolean(value: string): boolean {
    return value.toLowerCase() === 'true';
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  isDebugMode(): boolean {
    return this.config.debug;
  }

  getSiteUrl(): string {
    return this.config.siteUrl;
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getSupabaseUrl(): string {
    return this.config.supabaseUrl;
  }

  getSupabaseAnonKey(): string {
    return this.config.supabaseAnonKey;
  }
}

export const configService = new ConfigService();
