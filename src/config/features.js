/**
 * Feature Flags Configuration
 * Control which features/UI elements are visible in MVP (Phase 1) vs Advanced (Phase 2).
 * Set to true to re-enable advanced features without modifying underlying components.
 */
export const FEATURES = {
  // Sidebar
  SIDEBAR_CLOUD_SYNC_BADGE: false, // "Nube Sincronizada / AES-256 Activo" widget
  SIDEBAR_COLLAPSE_BUTTON: false,  // Dock to right collapse toggle button
  
  // Header
  HEADER_SEARCH_BAR: false,        // Command+K global quick search
  HEADER_THEME_TOGGLE: false,      // Dark/Light mode switcher toggle
  HEADER_NOTIFICATIONS: true,      // Notification bell with alert dot and smart notifications dropdown
  
  // Navigation / Modules
  MODULE_BUDGETS: true,            // Presupuestos
  MODULE_ANALYTICS: true,          // Diagnóstico y Métricas Comparativas
  
  // Public Landing / Gateway
  PUBLIC_SSL_AUDIT_FOOTER: false,  // Links to SSL Audit/Security badges in public footer
};
