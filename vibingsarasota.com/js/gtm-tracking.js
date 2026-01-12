// VibingSarasota.com - Google Tag Manager Tracking Module
// Comprehensive event tracking for all user interactions across the platform

class GTMTracker {
  constructor() {
    this.dataLayer = window.dataLayer || [];
    this.isInitialized = false;
    this.sectionObserver = null;
    this.currentPage = this.getCurrentPageType();
    this.currentCategory = this.getCurrentCategory();
    this.redditPixelId = 'a2_hat79ffpmyao';
    
    // Initialize tracking when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  // Initialize all tracking functionality
  init() {
    if (this.isInitialized) return;

    try {
      this.initializeRedditPixel();
      this.trackPageView();
      this.setupSectionViewTracking();
      this.setupBusinessCardTracking();
      this.setupNavigationTracking();
      this.setupFilterTracking();
      this.setupMobileInteractionTracking();
      this.setupVibeButtonTracking();
      this.setupPerformanceTracking();
      
      this.isInitialized = true;
      console.log('GTM Tracker initialized successfully');
    } catch (error) {
      console.error('GTM Tracker initialization failed:', error);
    }
  }

  // Helper method to push events to dataLayer with GA4 compatibility
  pushEvent(eventName, eventData = {}) {
    // Check consent status before tracking
    if (!this.hasAnalyticsConsent() && this.isAnalyticsEvent(eventName)) {
      console.log('Analytics event blocked due to consent:', eventName);
      return;
    }

    const event = {
      event: eventName,
      page_type: this.currentPage,
      category: this.currentCategory,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    this.dataLayer.push(event);
    console.log('GTM Event:', event);

    // Also send to GA4 directly if gtag is available (fallback)
    if (typeof gtag !== 'undefined') {
      this.sendToGA4(eventName, eventData);
    }
  }

  // Check if user has given analytics consent
  hasAnalyticsConsent() {
    try {
      const consent = localStorage.getItem('vibing_sarasota_consent');
      if (consent) {
        const parsed = JSON.parse(consent);
        return parsed.analytics === true;
      }
    } catch (error) {
      console.warn('Error checking consent status:', error);
    }
    return false;
  }

  // Check if event requires analytics consent
  isAnalyticsEvent(eventName) {
    const analyticsEvents = [
      'page_view',
      'section_view',
      'category_card_click',
      'business_card_click',
      'navigation_click',
      'footer_link_click',
      'mobile_menu_toggle',
      'filter_applied',
      'mobile_touch_interaction',
      'orientation_change',
      'vibe_button_click',
      'page_performance',
      'scroll_depth'
    ];

    return analyticsEvents.includes(eventName);
  }

  // Send events directly to GA4 (fallback method)
  sendToGA4(eventName, eventData = {}) {
    try {
      // Convert custom events to GA4 format
      const ga4EventData = {
        page_type: this.currentPage,
        category: this.currentCategory,
        timestamp: new Date().toISOString(),
        ...eventData
      };

      gtag('event', eventName, ga4EventData);
      console.log('GA4 Event sent:', eventName, ga4EventData);
    } catch (error) {
      console.warn('GA4 direct tracking failed:', error);
    }
  }

  // Initialize Reddit Pixel tracking
  initializeRedditPixel() {
    try {
      // Check if Reddit Pixel should be loaded based on consent
      if (!this.hasAnalyticsConsent()) {
        console.log('Reddit Pixel blocked due to consent');
        return;
      }

      // Initialize Reddit Pixel if not already loaded
      if (typeof rdt === 'undefined') {
        // Load Reddit Pixel script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.redditstatic.com/ads/pixel.js';
        document.head.appendChild(script);

        // Initialize Reddit Pixel
        window.rdt = window.rdt || function() {
          (window.rdt.sendEvent = window.rdt.sendEvent || function() {
            (window.rdt.callQueue = window.rdt.callQueue || []).push(arguments);
          });
        };

        // Configure Reddit Pixel
        rdt('init', this.redditPixelId, {
          optOut: false,
          useDecimalCurrencyValues: true
        });

        // Track page view
        rdt('track', 'PageVisit');

        console.log('Reddit Pixel initialized:', this.redditPixelId);
      }
    } catch (error) {
      console.warn('Reddit Pixel initialization failed:', error);
    }
  }

  // Send events to Reddit Pixel
  sendToRedditPixel(eventType, eventData = {}) {
    try {
      if (!this.hasAnalyticsConsent()) {
        console.log('Reddit Pixel event blocked due to consent:', eventType);
        return;
      }

      if (typeof rdt !== 'undefined') {
        rdt('track', eventType, eventData);
        console.log('Reddit Pixel Event sent:', eventType, eventData);
      }
    } catch (error) {
      console.warn('Reddit Pixel tracking failed:', error);
    }
  }

  // Get current page type
  getCurrentPageType() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/' || path === '') {
      return 'hub';
    }
    return 'category';
  }

  // Get current category from page
  getCurrentCategory() {
    const bodyCategory = document.body.getAttribute('data-category');
    if (bodyCategory) return bodyCategory;
    
    const metaCategory = document.querySelector('meta[name="category"]');
    if (metaCategory) return metaCategory.getAttribute('content');
    
    const path = window.location.pathname;
    const categoryMatch = path.match(/([^\/]+)\.html$/);
    return categoryMatch ? categoryMatch[1] : 'unknown';
  }

  // Track page views
  trackPageView() {
    this.pushEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }

  // Setup section view tracking using Intersection Observer
  setupSectionViewTracking() {
    if (!window.IntersectionObserver) return;

    const sections = document.querySelectorAll([
      '.hero-section',
      '.category-grid-container',
      '.category-header',
      '.business-grid-container',
      '.related-categories',
      '.site-footer'
    ].join(','));

    if (sections.length === 0) return;

    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const sectionName = this.getSectionName(entry.target);
          this.pushEvent('section_view', {
            section_name: sectionName,
            visibility_ratio: Math.round(entry.intersectionRatio * 100)
          });
        }
      });
    }, {
      threshold: [0.5],
      rootMargin: '0px'
    });

    sections.forEach(section => {
      this.sectionObserver.observe(section);
    });
  }

  // Get section name for tracking
  getSectionName(element) {
    if (element.classList.contains('hero-section')) return 'hero';
    if (element.classList.contains('category-grid-container')) return 'category_grid';
    if (element.classList.contains('category-header')) return 'category_header';
    if (element.classList.contains('business-grid-container')) return 'business_grid';
    if (element.classList.contains('related-categories')) return 'related_categories';
    if (element.classList.contains('site-footer')) return 'footer';
    return 'unknown_section';
  }

  // Setup business card interaction tracking
  setupBusinessCardTracking() {
    // Track category card clicks on hub page
    document.addEventListener('click', (e) => {
      const categoryCard = e.target.closest('.category-card');
      if (categoryCard) {
        const categoryName = categoryCard.getAttribute('data-category') || 
                           categoryCard.querySelector('.category-title')?.textContent || 'unknown';
        
        this.pushEvent('category_card_click', {
          category_name: categoryName,
          card_position: this.getElementPosition(categoryCard)
        });
      }

      // Track business card clicks on category pages
      const businessCard = e.target.closest('.business-card');
      if (businessCard) {
        const businessName = businessCard.querySelector('.business-name')?.textContent ||
                           businessCard.querySelector('h3')?.textContent || 'unknown';

        const eventData = {
          business_name: businessName,
          card_position: this.getElementPosition(businessCard)
        };

        // Send to GTM/GA4
        this.pushEvent('business_card_click', eventData);

        // Send to Reddit Pixel as a view content event
        this.sendToRedditPixel('ViewContent', {
          customEventName: 'BusinessCardView',
          value: 1,
          currency: 'USD',
          business_name: businessName
        });
      }
    });
  }

  // Setup navigation tracking
  setupNavigationTracking() {
    // Track main navigation clicks
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('.mobile-nav-link, .brand-link, .breadcrumb-link');
      if (navLink) {
        const linkText = navLink.textContent.trim();
        const linkHref = navLink.getAttribute('href') || '';
        
        this.pushEvent('navigation_click', {
          link_text: linkText,
          link_url: linkHref,
          navigation_type: this.getNavigationType(navLink)
        });
      }

      // Track footer links
      const footerLink = e.target.closest('.footer-links a');
      if (footerLink) {
        this.pushEvent('footer_link_click', {
          link_text: footerLink.textContent.trim(),
          link_url: footerLink.getAttribute('href') || ''
        });
      }
    });

    // Track mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        this.pushEvent('mobile_menu_toggle', {
          action: 'open'
        });
      });
    }
  }

  // Get navigation type
  getNavigationType(element) {
    if (element.classList.contains('brand-link')) return 'brand';
    if (element.classList.contains('mobile-nav-link')) return 'mobile_menu';
    if (element.classList.contains('breadcrumb-link')) return 'breadcrumb';
    return 'unknown';
  }

  // Setup filter tracking
  setupFilterTracking() {
    const filterSelects = document.querySelectorAll('#category, #location, #price');
    
    filterSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        this.pushEvent('filter_applied', {
          filter_type: e.target.id,
          filter_value: e.target.value,
          filter_text: e.target.options[e.target.selectedIndex]?.text || e.target.value
        });
      });
    });
  }

  // Setup mobile-specific interaction tracking
  setupMobileInteractionTracking() {
    // Track touch events on mobile
    if ('ontouchstart' in window) {
      let touchStartTime = 0;
      
      document.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
      });

      document.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        const target = e.target.closest('.category-card, .business-card, .mobile-nav-link');
        
        if (target && touchDuration > 100) { // Avoid accidental touches
          this.pushEvent('mobile_touch_interaction', {
            element_type: this.getElementType(target),
            touch_duration: touchDuration
          });
        }
      });
    }

    // Track orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.pushEvent('orientation_change', {
          orientation: window.orientation || screen.orientation?.angle || 0,
          screen_width: window.innerWidth,
          screen_height: window.innerHeight
        });
      }, 100);
    });
  }

  // Setup vibe button tracking
  setupVibeButtonTracking() {
    document.addEventListener('click', (e) => {
      const vibeButton = e.target.closest('.vibe-button, [class*="vibe"]');
      if (vibeButton) {
        const businessCard = vibeButton.closest('.business-card');
        const businessName = businessCard?.querySelector('.business-name')?.textContent ||
                           businessCard?.querySelector('h3')?.textContent || 'unknown';

        const eventData = {
          business_name: businessName,
          button_position: this.getElementPosition(vibeButton)
        };

        // Send to GTM/GA4
        this.pushEvent('vibe_button_click', eventData);

        // Send to Reddit Pixel as a custom conversion event
        this.sendToRedditPixel('Custom', {
          customEventName: 'VibingButtonClick',
          value: 1,
          currency: 'USD',
          business_name: businessName
        });
      }
    });
  }

  // Setup performance tracking
  setupPerformanceTracking() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        if ('performance' in window) {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            this.pushEvent('page_performance', {
              load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
              first_paint: this.getFirstPaint(),
              connection_type: this.getConnectionType()
            });
          }
        }
      }, 0);
    });

    // Track scroll depth
    this.setupScrollDepthTracking();
  }

  // Setup scroll depth tracking
  setupScrollDepthTracking() {
    let maxScrollDepth = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set();

    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        scrollThresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
            trackedThresholds.add(threshold);
            this.pushEvent('scroll_depth', {
              scroll_depth: threshold,
              max_scroll: maxScrollDepth
            });
          }
        });
      }
    };

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollDepth, 100);
    });
  }

  // Helper methods
  getElementPosition(element) {
    const siblings = Array.from(element.parentNode.children);
    return siblings.indexOf(element) + 1;
  }

  getElementType(element) {
    if (element.classList.contains('category-card')) return 'category_card';
    if (element.classList.contains('business-card')) return 'business_card';
    if (element.classList.contains('mobile-nav-link')) return 'mobile_nav_link';
    return 'unknown';
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : null;
  }

  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // Cleanup method
  destroy() {
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    this.isInitialized = false;
  }
}

// Initialize GTM Tracker
window.gtmTracker = new GTMTracker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GTMTracker;
}
