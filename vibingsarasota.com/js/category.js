// VibingSarasota.com - Category-specific JavaScript
// Handles initialization and configuration for individual category pages

// Category configurations
const CATEGORY_CONFIGS = {
    'party-vibe': {
    name: 'Party Vibe',
    title: 'Party Vibe Restaurants & Bars - Lively Dining & Nightlife in Sarasota',
    description: 'Discover Sarasota\'s best restaurants and bars with lively atmospheres. Find rooftop bars, live music venues, sports bars, and trendy spots perfect for groups and celebrations.',
    dataFile: 'party-vibe.json',
    icon: '🎉'
  },
  'food-services': {
    name: 'Food Services',
    title: 'Food Services - Meal Prep, Delivery & Personal Chefs in Sarasota',
    description: 'Discover Sarasota\'s best meal prep services, food delivery, and personal chefs. From fitness-focused meal prep to luxury private dining experiences.',
    dataFile: 'food-services.json',
    icon: '🥗'
  },
  'fine-dining': {
    name: 'Fine Dining',
    title: 'Fine Dining Restaurants - Upscale Dining & Special Occasions in Sarasota',
    description: 'Discover Sarasota\'s best fine dining restaurants for special occasions. From romantic waterfront dining to award-winning chef-driven cuisine and premium steakhouses.',
    dataFile: 'fine-dining.json',
    icon: '✨'
  },

  'med-spas': {
    name: 'Med Spas',
    title: 'Med Spas - Medical Aesthetic Treatments & Wellness in Sarasota',
    description: 'Discover Sarasota\'s best med spas and wellness centers. From luxury aesthetic treatments to advanced wellness services and expert injectors.',
    dataFile: 'med-spas.json',
    icon: '💆‍♀️'
  },
  'golf-courses': {
    name: 'Golf Courses',
    title: 'Golf Courses & Country Clubs in Sarasota',
    description: 'Discover Sarasota\'s best golf courses and country clubs. From championship courses to beginner-friendly layouts, find the perfect golf experience.',
    dataFile: 'golf.json',
    icon: '⛳'
  },
  'movie-theaters': {
    name: 'Movie Theaters',
    title: 'Movie Theaters - Cinema Entertainment & IMAX in Sarasota',
    description: 'Discover Sarasota\'s best movie theaters and cinemas. From luxury theaters with reclining seats to IMAX experiences and independent film venues.',
    dataFile: 'movie-theaters.json',
    icon: '🎬'
  },
  'family-activities': {
    name: 'Family Activities',
    title: 'Family Activities - Kid-Friendly Attractions & Entertainment in Sarasota',
    description: 'Discover Sarasota\'s best family-friendly attractions, from aquariums and animal parks to adventure courses and educational museums perfect for kids of all ages.',
    dataFile: 'family-activities.json',
    icon: '👨‍👩‍👧‍👦'
  },
  'st-armands': {
    name: 'St. Armands Circle',
    title: 'St. Armands Circle - Shopping, Dining & Attractions',
    description: 'Discover the best of St. Armands Circle - upscale shopping, fine dining, and unique attractions in this iconic Sarasota destination.',
    dataFile: 'starmands.json',
    icon: '🛍️'
  },
  'beaches': {
    name: 'Beaches',
    title: 'Sarasota Beaches - Access, Amenities & Activities',
    description: 'Explore Sarasota\'s world-famous beaches. Find the best beach access, amenities, activities, and hidden gems along the coast.',
    dataFile: 'beaches.json',
    icon: '🏖️'
  },
  'family-activities': {
    name: 'Family Activities',
    title: 'Family Activities & Kid-Friendly Attractions in Sarasota',
    description: 'Discover the best family-friendly activities, attractions, and entertainment in Sarasota. Perfect for kids and parents alike.',
    dataFile: 'family-activities.json',
    icon: '👨‍👩‍👧‍👦'
  },
  'meet-people': {
    name: 'Meet People',
    title: 'Meet People - Social Activities & Networking in Sarasota',
    description: 'Discover the best places to meet people in Sarasota. From solo-friendly venues and sports leagues to networking events, art classes, and community activities for making new connections.',
    dataFile: 'meet-people.json',
    icon: '🤝'
  }
};

// Initialize category page
function initializeCategoryPage() {
  // Determine current category from URL or page data
  const currentCategory = getCurrentCategory();
  
  if (!currentCategory || !CATEGORY_CONFIGS[currentCategory]) {
    console.error('Unknown category:', currentCategory);
    return;
  }

  // Get category configuration
  const categoryConfig = CATEGORY_CONFIGS[currentCategory];
  
  // Initialize the app with category-specific configuration
  window.vibingSarasota = new VibingSarasotaApp(categoryConfig);
  window.vibingSarasota.init();
}

// Determine current category from various sources
function getCurrentCategory() {
  // Method 1: Check for data attribute on body
  const bodyCategory = document.body.getAttribute('data-category');
  if (bodyCategory) return bodyCategory;
  
  // Method 2: Extract from filename
  const pathname = window.location.pathname;
  const filename = pathname.split('/').pop();
  const categoryFromFile = filename.replace('.html', '');
  
  if (CATEGORY_CONFIGS[categoryFromFile]) {
    return categoryFromFile;
  }
  
  // Method 3: Check for meta tag
  const metaCategory = document.querySelector('meta[name="category"]');
  if (metaCategory) {
    return metaCategory.getAttribute('content');
  }
  
  // Default fallback
  return 'food-services';
}

// Navigation utilities
function setupCategoryNavigation() {
  // Setup mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
    });
  }

  // Setup category navigation links
  const categoryLinks = document.querySelectorAll('.category-nav-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Add loading state for navigation
      link.classList.add('loading');
    });
  });

  // Setup back to home button
  const backToHomeBtn = document.querySelector('.back-to-home');
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
}

// Cross-category question linking
function setupCrossCategoryLinking() {
  // This will be enhanced in Phase 3 when we have multiple categories
  const crossCategoryQuestions = document.querySelectorAll('.cross-category-question');
  crossCategoryQuestions.forEach(question => {
    question.addEventListener('click', () => {
      // For now, show a message that this will link to other categories
      console.log('Cross-category linking will be implemented in Phase 3');
    });
  });
}

// Enhanced SEO and meta tag management
function updatePageMeta(categoryConfig) {
  // Update page title
  document.title = categoryConfig.title;
  
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', categoryConfig.description);
  
  // Update Open Graph tags
  updateOpenGraphTags(categoryConfig);
  
  // Update structured data
  updateWebsiteStructuredData(categoryConfig);
}

function updateOpenGraphTags(categoryConfig) {
  const ogTags = [
    { property: 'og:title', content: categoryConfig.title },
    { property: 'og:description', content: categoryConfig.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: window.location.href },
    { property: 'og:site_name', content: 'Vibing Sarasota' }
  ];

  ogTags.forEach(tag => {
    let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
    if (!ogTag) {
      ogTag = document.createElement('meta');
      ogTag.setAttribute('property', tag.property);
      document.head.appendChild(ogTag);
    }
    ogTag.setAttribute('content', tag.content);
  });
}

function updateWebsiteStructuredData(categoryConfig) {
  let websiteSchema = document.getElementById('website-schema');
  if (!websiteSchema) {
    websiteSchema = document.createElement('script');
    websiteSchema.type = 'application/ld+json';
    websiteSchema.id = 'website-schema';
    document.head.appendChild(websiteSchema);
  }

  websiteSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vibing Sarasota",
    "url": "https://vibingsarasota.com",
    "description": categoryConfig.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `https://vibingsarasota.com/${getCurrentCategory()}.html?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });
}

// Performance monitoring
function trackPagePerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
      }, 0);
    });
  }
}

// Mobile Filter Manager - Simplified for CSS-based toggle
class MobileFilterManager {
  constructor() {
    this.filtersSection = document.querySelector('.filters');
    this.isExpanded = false;
  }

  init() {
    if (!this.filtersSection) return;

    // Add click listener to the filters section for mobile toggle
    this.filtersSection.addEventListener('click', (e) => {
      // Only handle clicks on mobile (when ::before pseudo-element is visible)
      if (window.innerWidth <= 767) {
        this.toggleFilter();
      }
    });

    // Handle window resize to reset state
    window.addEventListener('resize', () => {
      if (window.innerWidth > 767) {
        this.filtersSection.classList.remove('expanded');
        this.isExpanded = false;
      }
    });
  }

  toggleFilter() {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      this.filtersSection.classList.add('expanded');
    } else {
      this.filtersSection.classList.remove('expanded');
    }
  }

  // Legacy methods for compatibility
  openFilter() {
    if (window.innerWidth <= 767) {
      this.isExpanded = true;
      this.filtersSection.classList.add('expanded');
    }
  }

  closeFilter() {
    this.isExpanded = false;
    this.filtersSection.classList.remove('expanded');
  }

  syncFilters() {
    // No sync needed for simplified implementation
    // All filter elements are the same on mobile and desktop
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const currentCategory = getCurrentCategory();
  const categoryConfig = CATEGORY_CONFIGS[currentCategory];

  if (categoryConfig) {
    updatePageMeta(categoryConfig);
  }

  setupCategoryNavigation();
  setupCrossCategoryLinking();
  trackPagePerformance();

  // Initialize the main app
  initializeCategoryPage();

  // Initialize mobile filter manager
  const mobileFilterManager = new MobileFilterManager();
  mobileFilterManager.init();
});

// Export for global access
window.CATEGORY_CONFIGS = CATEGORY_CONFIGS;
window.initializeCategoryPage = initializeCategoryPage;
