// VibingSarasota.com - GDPR Consent Manager
// Google Consent Mode v2 implementation with localStorage persistence

class ConsentManager {
  constructor() {
    this.consentKey = 'vibing_sarasota_consent';
    this.consentVersion = '1.0';
    this.defaultConsent = {
      analytics: false,
      marketing: false,
      essential: true, // Always true
      version: this.consentVersion,
      timestamp: null
    };
    
    this.init();
  }

  // Initialize consent manager
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupConsentBanner());
    } else {
      this.setupConsentBanner();
    }
  }

  // Setup consent banner and event listeners
  setupConsentBanner() {
    const existingConsent = this.getStoredConsent();
    
    // Show banner if no consent has been given
    if (!existingConsent) {
      this.showConsentBanner();
    }
    
    this.attachEventListeners();
  }

  // Get stored consent from localStorage
  getStoredConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      if (stored) {
        const consent = JSON.parse(stored);
        // Check if consent is current version
        if (consent.version === this.consentVersion) {
          return consent;
        }
      }
    } catch (error) {
      console.warn('Error reading consent preferences:', error);
    }
    return null;
  }

  // Store consent preferences
  storeConsent(consent) {
    try {
      const consentData = {
        ...consent,
        version: this.consentVersion,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(this.consentKey, JSON.stringify(consentData));
      
      // Update Google Consent Mode
      this.updateGoogleConsent(consent);
      
      // Track consent event
      this.trackConsentEvent(consent);
      
      return true;
    } catch (error) {
      console.error('Error storing consent preferences:', error);
      return false;
    }
  }

  // Update Google Consent Mode
  updateGoogleConsent(consent) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'analytics_storage': consent.analytics ? 'granted' : 'denied',
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'ad_user_data': consent.marketing ? 'granted' : 'denied',
        'ad_personalization': consent.marketing ? 'granted' : 'denied'
      });
      
      console.log('Google Consent Mode updated:', consent);
    }
  }

  // Track consent event for analytics
  trackConsentEvent(consent) {
    // Push to dataLayer for GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'consent_update',
        consent_analytics: consent.analytics,
        consent_marketing: consent.marketing,
        consent_method: consent.method || 'unknown',
        consent_timestamp: new Date().toISOString()
      });
    }
  }

  // Show consent banner
  showConsentBanner() {
    const banner = document.getElementById('consent-banner');
    if (banner) {
      // Add show class with slight delay for animation
      setTimeout(() => {
        banner.classList.add('show');
      }, 100);
    }
  }

  // Hide consent banner
  hideConsentBanner() {
    const banner = document.getElementById('consent-banner');
    if (banner) {
      banner.classList.remove('show');
    }
  }

  // Show consent modal
  showConsentModal() {
    const modal = document.getElementById('consent-modal');
    if (modal) {
      modal.classList.add('show');
      
      // Set current preferences in modal
      const existingConsent = this.getStoredConsent() || this.defaultConsent;
      document.getElementById('analytics-toggle').checked = existingConsent.analytics;
      document.getElementById('marketing-toggle').checked = existingConsent.marketing;
      
      // Focus management for accessibility
      const closeBtn = document.getElementById('consent-modal-close');
      if (closeBtn) closeBtn.focus();
    }
  }

  // Hide consent modal
  hideConsentModal() {
    const modal = document.getElementById('consent-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // Accept all cookies
  acceptAll() {
    const consent = {
      analytics: true,
      marketing: true,
      essential: true,
      method: 'accept_all'
    };
    
    if (this.storeConsent(consent)) {
      this.hideConsentBanner();
      this.hideConsentModal();
    }
  }

  // Reject all non-essential cookies
  rejectAll() {
    const consent = {
      analytics: false,
      marketing: false,
      essential: true,
      method: 'reject_all'
    };
    
    if (this.storeConsent(consent)) {
      this.hideConsentBanner();
      this.hideConsentModal();
    }
  }

  // Save custom preferences from modal
  savePreferences() {
    const analyticsToggle = document.getElementById('analytics-toggle');
    const marketingToggle = document.getElementById('marketing-toggle');
    
    const consent = {
      analytics: analyticsToggle ? analyticsToggle.checked : false,
      marketing: marketingToggle ? marketingToggle.checked : false,
      essential: true,
      method: 'custom'
    };
    
    if (this.storeConsent(consent)) {
      this.hideConsentBanner();
      this.hideConsentModal();
    }
  }

  // Attach event listeners
  attachEventListeners() {
    // Accept all button
    const acceptAllBtn = document.getElementById('consent-accept-all');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => this.acceptAll());
    }

    // Reject all button
    const rejectAllBtn = document.getElementById('consent-reject-all');
    if (rejectAllBtn) {
      rejectAllBtn.addEventListener('click', () => this.rejectAll());
    }

    // Customize button
    const customizeBtn = document.getElementById('consent-customize');
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => this.showConsentModal());
    }

    // Modal close button
    const modalCloseBtn = document.getElementById('consent-modal-close');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.hideConsentModal());
    }

    // Save preferences button
    const savePrefsBtn = document.getElementById('consent-save-preferences');
    if (savePrefsBtn) {
      savePrefsBtn.addEventListener('click', () => this.savePreferences());
    }

    // Close modal when clicking outside
    const modal = document.getElementById('consent-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideConsentModal();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideConsentModal();
      }
    });
  }

  // Public method to revoke consent (for future use)
  revokeConsent() {
    try {
      localStorage.removeItem(this.consentKey);
      
      // Reset Google Consent Mode to default (denied)
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      }
      
      // Track revocation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'consent_revoked',
          consent_timestamp: new Date().toISOString()
        });
      }
      
      // Show banner again
      this.showConsentBanner();
      
      return true;
    } catch (error) {
      console.error('Error revoking consent:', error);
      return false;
    }
  }

  // Get current consent status (for external use)
  getConsentStatus() {
    return this.getStoredConsent() || this.defaultConsent;
  }
}

// Initialize consent manager
window.consentManager = new ConsentManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConsentManager;
}
