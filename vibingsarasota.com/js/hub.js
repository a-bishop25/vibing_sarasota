// VibingSarasota.com - Hub Page JavaScript
// Handles the main category selection page functionality

document.addEventListener('DOMContentLoaded', () => {
  initializeHubPage();
});

function initializeHubPage() {
  setupMobileNavigation();
  setupCategoryCards();
  setupAnimations();
  trackPagePerformance();
}

// Setup mobile navigation
function setupMobileNavigation() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
      
      // Update ARIA attributes for accessibility
      const isExpanded = mobileMenu.classList.contains('active');
      mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Setup category card interactions
function setupCategoryCards() {
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryCards.forEach(card => {
    // Add touch interactions
    addTouchInteractions(card);
    
    // Add keyboard navigation
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = card.querySelector('.category-link');
        if (link) {
          link.click();
        }
      }
    });

    // Add hover effects for desktop
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        card.classList.add('hover');
      }
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('hover');
    });

    // Track category clicks for analytics
    const link = card.querySelector('.category-link');
    if (link) {
      link.addEventListener('click', (e) => {
        const category = card.getAttribute('data-category');
        trackCategoryClick(category);
        
        // Add loading state
        card.classList.add('loading');
      });
    }
  });
}

// Add touch interactions to category cards
function addTouchInteractions(card) {
  let touchStartY = 0;
  let touchStartTime = 0;
  
  card.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    card.classList.add('touch-active');
  }, { passive: true });
  
  card.addEventListener('touchend', (e) => {
    card.classList.remove('touch-active');
    
    const touchEndY = e.changedTouches[0].clientY;
    const touchDuration = Date.now() - touchStartTime;
    const touchDistance = Math.abs(touchEndY - touchStartY);
    
    // If it's a quick tap with minimal movement, trigger the link
    if (touchDuration < 200 && touchDistance < 10) {
      const link = card.querySelector('.category-link');
      if (link) {
        // Add visual feedback
        createRippleEffect(card, e.changedTouches[0]);
        
        // Small delay to show the ripple effect
        setTimeout(() => {
          link.click();
        }, 100);
      }
    }
  }, { passive: true });
  
  card.addEventListener('touchcancel', () => {
    card.classList.remove('touch-active');
  }, { passive: true });
}

// Create ripple effect for touch feedback
function createRippleEffect(element, touch) {
  const rect = element.getBoundingClientRect();
  const ripple = document.createElement('div');
  const size = Math.max(rect.width, rect.height);
  const x = touch.clientX - rect.left - size / 2;
  const y = touch.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 1;
  `;
  
  element.style.position = 'relative';
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Setup scroll animations
function setupAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe category cards and feature items
  const animatedElements = document.querySelectorAll('.category-card, .feature-item');
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // Add staggered animation delays
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });

  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.2}s`;
  });
}

// Track category clicks for analytics
function trackCategoryClick(category) {
  // This would integrate with your analytics platform
  console.log(`Category clicked: ${category}`);

  // GTM tracking via dataLayer
  if (window.gtmTracker) {
    window.gtmTracker.pushEvent('hub_category_click', {
      category_name: category,
      page_title: document.title,
      click_source: 'hub_page'
    });
  }

  // Legacy Google Analytics 4 support
  if (typeof gtag !== 'undefined') {
    gtag('event', 'category_click', {
      'category_name': category,
      'page_title': document.title
    });
  }
}

// Performance monitoring
function trackPagePerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

        console.log('Hub page load time:', loadTime, 'ms');

        // GTM tracking via dataLayer
        if (window.gtmTracker) {
          window.gtmTracker.pushEvent('hub_page_performance', {
            load_time: Math.round(loadTime),
            page_type: 'hub',
            performance_category: 'page_timing'
          });
        }

        // Legacy Google Analytics 4 support
        if (typeof gtag !== 'undefined') {
          gtag('event', 'page_load_time', {
            'value': Math.round(loadTime),
            'page_type': 'hub'
          });
        }
      }, 0);
    });
  }
}

// Utility function to check if device supports hover
function supportsHover() {
  return window.matchMedia('(hover: hover)').matches;
}

// Handle reduced motion preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--animation-duration', '0.01ms');
}

// Export for global access
window.hubPage = {
  trackCategoryClick,
  createRippleEffect
};
