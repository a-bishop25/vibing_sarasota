// VibingSarasota.com - Shared JavaScript Module
// Common functionality used across all category pages

class VibingSarasotaApp {
  constructor(categoryConfig) {
    this.categoryConfig = categoryConfig;
    this.businesses = [];
    this.categories = [];
    this.locations = [];
    this.priceRanges = [];
    this.currentFilters = {
      category: 'all',
      location: 'all',
      price: 'all'
    };
  }

  // Initialize the application
  async init() {
    try {
      await this.loadData();
      this.setupNavigation();
      this.populateFilters();
      this.renderBusinesses();
      this.attachEventListeners();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showErrorState();
    }
  }

  // Load data for the current category
  async loadData() {
    try {
      this.showLoadingState();
      
      const response = await fetch(`data/${this.categoryConfig.dataFile}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.businesses = data.businesses || [];
      this.categories = data.categories || [];
      this.locations = data.locations || [];
      this.priceRanges = data.priceRanges || [];
      
      this.hideLoadingState();
    } catch (error) {
      console.error('Error loading data:', error);
      this.hideLoadingState();
      this.showErrorState();
      throw error;
    }
  }

  // Setup navigation elements
  setupNavigation() {
    // Update page title and breadcrumbs
    document.title = `${this.categoryConfig.title} - Vibing Sarasota`;
    
    // Update breadcrumb if exists
    const breadcrumb = document.querySelector('.breadcrumb-category');
    if (breadcrumb) {
      breadcrumb.textContent = this.categoryConfig.name;
    }

    // Update page header
    const pageHeader = document.querySelector('.category-header h1');
    if (pageHeader) {
      pageHeader.textContent = this.categoryConfig.name;
    }

    const pageDescription = document.querySelector('.category-header .category-description');
    if (pageDescription) {
      pageDescription.textContent = this.categoryConfig.description;
    }
  }

  // Populate filter dropdowns
  populateFilters() {
    // Category filter
    const categorySelect = document.getElementById("category");
    if (categorySelect && this.categories.length > 0) {
      categorySelect.innerHTML = '<option value="all">All Categories</option>';
      this.categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }

    // Location filter
    const locationSelect = document.getElementById("location");
    if (locationSelect && this.locations.length > 0) {
      locationSelect.innerHTML = '<option value="all">All Locations</option>';
      this.locations.forEach(location => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
      });
    }

    // Price range filter
    const priceSelect = document.getElementById("price");
    if (priceSelect && this.priceRanges.length > 0) {
      priceSelect.innerHTML = '<option value="all">All Price Ranges</option>';
      this.priceRanges.forEach(price => {
        const option = document.createElement("option");
        option.value = price.id;
        option.textContent = `${price.label} (${price.range})`;
        priceSelect.appendChild(option);
      });
    }
  }

  // Render businesses based on current filters
  renderBusinesses(filterCategory = "all", filterLocation = "all", filterPrice = "all") {
    const grid = document.getElementById("business-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // Enhanced filtering logic
    const filteredBusinesses = this.businesses.filter(business => {
      const matchesCategory = filterCategory === "all" || business.category === filterCategory;
      const matchesLocation = filterLocation === "all" || 
        business.location.toLowerCase().includes(filterLocation.toLowerCase()) ||
        filterLocation === "all";
      
      // Improved price matching
      let matchesPrice = filterPrice === "all";
      if (filterPrice !== "all") {
        const selectedPriceRange = this.priceRanges.find(price => price.id === filterPrice);
        if (selectedPriceRange) {
          // Extract price numbers for comparison
          const businessPriceMatch = business.priceRange.match(/\$(\d+)/);
          const rangePriceMatch = selectedPriceRange.range.match(/\$(\d+)/);
          if (businessPriceMatch && rangePriceMatch) {
            const businessPrice = parseInt(businessPriceMatch[1]);
            const rangePrice = parseInt(rangePriceMatch[1]);
            matchesPrice = Math.abs(businessPrice - rangePrice) <= 10; // Allow some flexibility
          }
        }
      }
      
      return matchesCategory && matchesLocation && matchesPrice;
    });

    // Show no results message if needed
    if (filteredBusinesses.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <h3>No businesses found</h3>
          <p>Try adjusting your filters to see more results.</p>
          <button class="button" onclick="window.vibingSarasota.resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    // Render business cards
    filteredBusinesses.forEach((business, index) => {
      const card = this.createBusinessCard(business, index);
      grid.appendChild(card);
    });

    // Update structured data
    this.updateStructuredData(filteredBusinesses);

    // Re-attach smooth scroll for related questions
    this.attachScrollListeners();
  }

  // Create a business card element
  createBusinessCard(business, index) {
    const card = document.createElement("article");
    card.className = "business-card";
    card.id = business.id;
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      <h3 class="question">${this.escapeHtml(business.question)}</h3>
      <div class="business-card-header">
        <span class="logo" role="img" aria-label="Business logo">${business.logo}</span>
        <h3 class="name">${this.escapeHtml(business.name)}</h3>
      </div>
      <div class="tagline">${this.escapeHtml(business.tagline)}</div>
      <div class="rating" role="img" aria-label="Rating ${business.rating} out of 5 stars">
        Rating: ${business.rating} ${'★'.repeat(Math.floor(business.rating))}${'☆'.repeat(5 - Math.floor(business.rating))}
      </div>
      <p class="description">${this.escapeHtml(business.description)}</p>
      <div class="vibe-section">
        <button class="vibe-button" data-business-id="${business.id}" aria-label="I'm vibing it">
          <span class="button-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </span>
          <span class="button-text">I'm vibing it</span>
        </button>
        <div class="vibe-score">
          <span class="vibe-index" data-business-id="${business.id}">--</span>
          <span class="vibe-label">vibe index</span>
        </div>
      </div>
      <div class="contact">
        ${this.renderContactLinks(business)}
      </div>
      <div class="tags" role="list" aria-label="Business categories">
        ${business.tags.map(tag => `<span role="listitem">${this.escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="related-questions">
        <h4>Related Questions</h4>
        <ul>
          ${this.renderRelatedQuestions(business)}
        </ul>
      </div>
    `;
    
    // Add touch event listeners
    this.addTouchInteractions(card);

    // Initialize vibe functionality
    this.initializeVibeButton(card, business);

    return card;
  }

  // Render contact links for a business
  renderContactLinks(business) {
    const links = [];
    
    if (business.contact.website) {
      links.push(`<a href="${business.contact.website}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${business.name} website">Website</a>`);
    }
    
    if (business.contact.phone) {
      links.push(`<a href="tel:${business.contact.phone}" aria-label="Call ${business.name}">${business.contact.phone}</a>`);
    }
    
    if (business.socialMedia?.instagram) {
      links.push(`<a href="${business.socialMedia.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Follow ${business.name} on Instagram">Instagram</a>`);
    }
    
    if (business.socialMedia?.facebook) {
      links.push(`<a href="${business.socialMedia.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Follow ${business.name} on Facebook">Facebook</a>`);
    }
    
    if (business.reviews?.featured) {
      links.push(`<a href="${business.reviews.featured}" target="_blank" rel="noopener noreferrer" aria-label="Read featured review of ${business.name}">Featured Review</a>`);
    }
    
    if (business.reviews?.bbb) {
      links.push(`<a href="${business.reviews.bbb}" target="_blank" rel="noopener noreferrer" aria-label="View ${business.name} BBB rating">BBB Review</a>`);
    }
    
    if (business.reviews?.portfolio) {
      links.push(`<a href="${business.reviews.portfolio}" target="_blank" rel="noopener noreferrer" aria-label="View ${business.name} portfolio">Portfolio</a>`);
    }
    
    return links.join('');
  }

  // Render related questions with cross-category linking
  renderRelatedQuestions(business) {
    return business.relatedQuestions.map(q => {
      const relatedBusiness = this.businesses.find(b => b.question === q);
      if (relatedBusiness) {
        return `<li><a href="#${relatedBusiness.id}" aria-label="View business that answers: ${q}">${this.escapeHtml(q)}</a></li>`;
      }
      // For cross-category questions, we'll handle this in Phase 3
      return `<li><span class="cross-category-question">${this.escapeHtml(q)}</span></li>`;
    }).join("");
  }

  // Attach event listeners
  attachEventListeners() {
    // Enhanced filter event listeners with debouncing
    let filterTimeout;
    const debounceFilters = () => {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        this.renderBusinesses(
          document.getElementById("category")?.value || "all",
          document.getElementById("location")?.value || "all",
          document.getElementById("price")?.value || "all"
        );
      }, 150);
    };

    const categorySelect = document.getElementById("category");
    const locationSelect = document.getElementById("location");
    const priceSelect = document.getElementById("price");

    if (categorySelect) categorySelect.addEventListener("change", debounceFilters);
    if (locationSelect) locationSelect.addEventListener("change", debounceFilters);
    if (priceSelect) priceSelect.addEventListener("change", debounceFilters);

    // Load and initialize vibe widget component
    this.loadVibeWidget();

    // Initialize legacy vibe submission widget (for backward compatibility)
    this.initVibeSubmission();
  }

  // Attach smooth scroll listeners for related questions
  attachScrollListeners() {
    document.querySelectorAll(".business-card a[href^='#']").forEach(anchor => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offset = window.innerWidth <= 768 ? 20 : 0;
          const elementPosition = targetElement.offsetTop - offset;

          window.scrollTo({
            top: elementPosition,
            behavior: "smooth"
          });

          // Add visual highlight
          targetElement.classList.add('highlighted');
          setTimeout(() => {
            targetElement.classList.remove('highlighted');
          }, 2000);
        }
      });
    });
  }

  // Loading state management
  showLoadingState() {
    const grid = document.getElementById("business-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading ${this.categoryConfig.name.toLowerCase()}...</p>
        </div>
      `;
    }
  }

  hideLoadingState() {
    const loadingState = document.querySelector('.loading-state');
    if (loadingState) {
      loadingState.remove();
    }
  }

  showErrorState() {
    const grid = document.getElementById("business-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="error-state">
          <p>Sorry, we couldn't load the ${this.categoryConfig.name.toLowerCase()} data. Please try refreshing the page.</p>
          <button class="button" onclick="location.reload()">Refresh Page</button>
        </div>
      `;
    }
  }

  // Reset all filters
  resetFilters() {
    const categorySelect = document.getElementById("category");
    const locationSelect = document.getElementById("location");
    const priceSelect = document.getElementById("price");

    if (categorySelect) categorySelect.value = "all";
    if (locationSelect) locationSelect.value = "all";
    if (priceSelect) priceSelect.value = "all";

    this.renderBusinesses();
  }

  // Update structured data for SEO
  updateStructuredData(filteredBusinesses) {
    // Update FAQPage schema
    const faqSchema = document.getElementById("faq-schema");
    if (faqSchema) {
      faqSchema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": filteredBusinesses.map(business => ({
          "@type": "Question",
          "name": business.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Recommended: ${business.name}. ${business.description}`
          }
        }))
      });
    }

    // Update ItemList schema
    let itemListSchema = document.getElementById("item-list-schema");
    if (itemListSchema) {
      itemListSchema.remove();
    }

    itemListSchema = document.createElement("script");
    itemListSchema.type = "application/ld+json";
    itemListSchema.id = "item-list-schema";
    itemListSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": filteredBusinesses.map((business, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "LocalBusiness",
          "name": business.name,
          "description": business.description,
          "url": business.contact.website || "",
          "telephone": business.contact.phone || "",
          "address": business.contact.address ? {
            "@type": "PostalAddress",
            "streetAddress": business.contact.address
          } : {},
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": business.rating,
            "reviewCount": 1
          },
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Question Answered",
            "value": business.question
          }
        }
      }))
    });
    document.body.appendChild(itemListSchema);
  }

  // Touch interaction enhancements
  addTouchInteractions(card) {
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

      if (touchDuration < 200 && touchDistance < 10) {
        this.createRippleEffect(card, e.changedTouches[0]);
      }
    }, { passive: true });

    card.addEventListener('touchcancel', () => {
      card.classList.remove('touch-active');
    }, { passive: true });
  }

  // Create ripple effect for touch feedback
  createRippleEffect(element, touch) {
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

  // Utility function for HTML escaping
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Initialize vibe button functionality
  initializeVibeButton(card, business) {
    const vibeButton = card.querySelector('.vibe-button');
    const vibeIndex = card.querySelector('.vibe-index');

    if (!vibeButton || !vibeIndex) return;

    // Load initial vibe score
    this.loadVibeScore(business.id, vibeIndex);

    // Add click handler
    vibeButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleVibeClick(vibeButton, business.id);
    });
  }

  // Handle vibe button click
  async handleVibeClick(button, businessId) {
    // Prevent multiple clicks
    if (button.disabled) return;

    button.disabled = true;

    // Add loading state
    const originalText = button.innerHTML;
    button.innerHTML = `
      <span class="button-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
      </span>
      <span class="button-text">Vibing...</span>
    `;
    button.classList.add('loading');

    try {
      // Send vote to API
      const success = await this.submitVote(businessId);

      if (success) {
        // Add success visual feedback
        button.classList.add('vibed');
        button.innerHTML = `
          <span class="button-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
          </span>
          <span class="button-text">Vibed!</span>
        `;

        // Update local storage for user feedback
        this.updateLocalVibe(businessId);

        // Refresh the vibe score display
        const vibeIndexElement = button.closest('.business-card').querySelector('.vibe-index');
        if (vibeIndexElement) {
          this.loadVibeScore(businessId, vibeIndexElement, true); // Force refresh
        }

        // Show success message
        this.showVibeMessage('Thanks for vibing! Your vote has been recorded.', 'success');

      } else {
        // Show error state
        button.innerHTML = `
          <span class="button-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </span>
          <span class="button-text">Try Again</span>
        `;
        this.showVibeMessage('Oops! Something went wrong. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Vote submission failed:', error);
      button.innerHTML = `
        <span class="button-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </span>
        <span class="button-text">Try Again</span>
      `;

      if (error.message.includes('Rate limited')) {
        this.showVibeMessage('You can only vote once per business per day. Thanks for your enthusiasm!', 'info');
      } else {
        this.showVibeMessage('Network error. Please check your connection and try again.', 'error');
      }
    }

    // Re-enable button and restore original state after delay
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove('vibed', 'loading');
      button.innerHTML = originalText;
    }, 3000);
  }

  // Load vibe score for a business
  async loadVibeScore(businessId, vibeIndexElement, forceRefresh = false) {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedScore = this.getVibeFromCache(businessId);
        if (cachedScore !== null) {
          vibeIndexElement.textContent = cachedScore;
          return;
        }
      }

      // Show loading state
      vibeIndexElement.textContent = '...';

      // Try to fetch from API
      const scoreData = await this.fetchVibeScore(businessId);
      if (scoreData && scoreData.score !== null) {
        vibeIndexElement.textContent = scoreData.score;
        this.setVibeCache(businessId, scoreData.score);

        // Add tooltip with additional info
        vibeIndexElement.title = `Score: ${scoreData.score} | Votes: ${scoreData.vote_count || 0} | Source: ${scoreData.source || 'unknown'}`;
      } else {
        // Fallback to simulated score
        const fallbackScore = this.generateFallbackScore(businessId);
        vibeIndexElement.textContent = fallbackScore;
        vibeIndexElement.title = `Score: ${fallbackScore} | Source: generated`;
        this.setVibeCache(businessId, fallbackScore);
      }
    } catch (error) {
      console.warn('Failed to load vibe score:', error);
      // Use fallback
      const fallbackScore = this.generateFallbackScore(businessId);
      vibeIndexElement.textContent = fallbackScore;
      vibeIndexElement.title = `Score: ${fallbackScore} | Source: fallback`;
    }
  }

  // Fetch vibe score from API
  async fetchVibeScore(businessId) {
    try {
      const response = await fetch(`https://vibing-sarasota-api.azurewebsites.net/api/vibe-score?businessId=${encodeURIComponent(businessId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Vibe score data:', data); // Debug logging
        return data;
      } else {
        console.warn('API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('Vibe score API call failed:', error);
    }
    return null;
  }

  // Submit vote to API
  async submitVote(businessId) {
    try {
      const response = await fetch('https://vibing-sarasota-api.azurewebsites.net/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          location: this.getCurrentLocation()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Vote submitted successfully:', data);
        return true;
      } else if (response.status === 429) {
        // Rate limited
        const errorData = await response.json();
        throw new Error('Rate limited: ' + errorData.message);
      } else {
        console.warn('Vote submission failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      throw error;
    }
  }

  // Generate fallback score based on business characteristics
  generateFallbackScore(businessId) {
    // Create a deterministic but varied score based on business ID
    let hash = 0;
    for (let i = 0; i < businessId.length; i++) {
      const char = businessId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Generate score between 45-95 to seem realistic
    const score = 45 + Math.abs(hash % 51);
    return score;
  }

  // Cache management
  getVibeFromCache(businessId) {
    try {
      const cache = JSON.parse(localStorage.getItem('vibeCache') || '{}');
      const entry = cache[businessId];

      if (entry && Date.now() - entry.timestamp < 3600000) { // 1 hour cache
        return entry.score;
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  }

  setVibeCache(businessId, score) {
    try {
      const cache = JSON.parse(localStorage.getItem('vibeCache') || '{}');
      cache[businessId] = {
        score: score,
        timestamp: Date.now()
      };
      localStorage.setItem('vibeCache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  // Track user vibes locally
  updateLocalVibe(businessId) {
    try {
      const userVibes = JSON.parse(localStorage.getItem('userVibes') || '{}');
      userVibes[businessId] = (userVibes[businessId] || 0) + 1;
      userVibes[businessId + '_timestamp'] = new Date().toISOString();
      localStorage.setItem('userVibes', JSON.stringify(userVibes));
    } catch (error) {
      console.warn('Failed to update user vibes:', error);
    }
  }

  // Get current location for analytics (optional)
  getCurrentLocation() {
    try {
      // Try to get location from various sources
      const urlParams = new URLSearchParams(window.location.search);
      const locationParam = urlParams.get('location');
      if (locationParam) return locationParam;

      // Get from page category
      const bodyCategory = document.body.getAttribute('data-category');
      if (bodyCategory) return bodyCategory;

      // Get from page title
      const pageTitle = document.title;
      if (pageTitle.includes('Sarasota')) return 'sarasota';

      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  // Show vibe message to user
  showVibeMessage(message, type = 'info') {
    // Remove any existing message
    const existingMessage = document.querySelector('.vibe-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `vibe-message vibe-message-${type}`;
    messageEl.innerHTML = `
      <div class="vibe-message-content">
        <span class="vibe-message-text">${message}</span>
        <button class="vibe-message-close" aria-label="Close message">&times;</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(messageEl);

    // Add close handler
    const closeBtn = messageEl.querySelector('.vibe-message-close');
    closeBtn.addEventListener('click', () => {
      messageEl.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);

    // Animate in
    setTimeout(() => {
      messageEl.classList.add('show');
    }, 100);
  }

  // Load vibe widget component
  async loadVibeWidget() {
    const vibeWidgetContainer = document.getElementById('vibe-widget-container');
    if (!vibeWidgetContainer) return;

    try {
      const response = await fetch('/includes/vibe-widget.html');
      if (response.ok) {
        const html = await response.text();
        vibeWidgetContainer.innerHTML = html;

        // Initialize the widget directly instead of loading external script
        this.initVibeWidgetComponent();
      }
    } catch (error) {
      console.error('Failed to load vibe widget:', error);
    }
  }

  // Initialize vibe widget component functionality
  initVibeWidgetComponent() {
    const widget = document.querySelector('.whats-your-vibe-widget');
    if (!widget) return;

    const header = document.getElementById('vibeWidgetHeader');
    const content = document.getElementById('vibeWidgetContent');
    const expandIcon = document.getElementById('vibeExpandIcon');
    const form = document.getElementById('vibeSubmissionForm');

    let isExpanded = false;

    // Set initial collapsed state
    if (content) {
      content.style.maxHeight = '0';
      content.style.overflow = 'hidden';
      content.style.opacity = '0';
      content.style.padding = '0 var(--spacing-lg)';
      content.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Header click handler
    if (header) {
      header.addEventListener('click', () => {
        if (isExpanded) {
          // Collapse
          content.style.maxHeight = '0';
          content.style.overflow = 'hidden';
          content.style.opacity = '0';
          content.style.padding = '0 var(--spacing-lg)';
          if (expandIcon) expandIcon.style.transform = 'rotate(0deg)';
          isExpanded = false;
        } else {
          // Expand
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.overflow = 'visible';
          content.style.opacity = '1';
          content.style.padding = 'var(--spacing-lg)';
          if (expandIcon) expandIcon.style.transform = 'rotate(180deg)';
          isExpanded = true;
        }
      });

      // Hover effects
      header.addEventListener('mouseenter', () => {
        header.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      });

      header.addEventListener('mouseleave', () => {
        header.style.backgroundColor = '';
      });
    }

    // Initialize form functionality
    this.initVibeWidgetForm();
  }

  // Initialize vibe widget form functionality
  initVibeWidgetForm() {
    // Initialize persona buttons
    const personaGroups = document.querySelectorAll('.persona-buttons');
    personaGroups.forEach(group => {
      const buttons = group.querySelectorAll('.persona-btn');
      const groupType = group.getAttribute('data-group');
      const hiddenInput = document.getElementById(`persona-${groupType}`);

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          buttons.forEach(btn => btn.classList.remove('selected'));
          button.classList.add('selected');
          if (hiddenInput) {
            hiddenInput.value = button.getAttribute('data-value');
          }
        });
      });
    });

    // Initialize vibe prompt buttons
    const promptButtons = document.querySelectorAll('.vibe-prompt-btn');
    const promptText = document.getElementById('vibePromptText');
    const vibeTextarea = document.getElementById('vibe-text');

    promptButtons.forEach(button => {
      button.addEventListener('click', () => {
        promptButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const prompt = button.getAttribute('data-prompt');
        if (promptText) promptText.textContent = prompt;

        if (vibeTextarea) {
          if (prompt.includes('love vibing at')) {
            vibeTextarea.placeholder = 'the coffee shop on Main Street with amazing vibes...';
          } else {
            vibeTextarea.placeholder = 'has live music and great cocktails...';
          }
        }
      });
    });

    // Character counter
    if (vibeTextarea) {
      const charCount = document.getElementById('char-count');
      vibeTextarea.addEventListener('input', () => {
        const count = vibeTextarea.value.length;
        if (charCount) {
          charCount.textContent = count;
          if (count > 80) {
            charCount.style.color = 'var(--accent-orange)';
          } else if (count > 95) {
            charCount.style.color = '#ef4444';
          } else {
            charCount.style.color = 'var(--neutral-gray)';
          }
        }
      });
    }

    // Form submission
    const form = document.getElementById('vibeSubmissionForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitVibeWidget();
      });
    }
  }

  // Submit vibe widget form
  async submitVibeWidget() {
    const submitBtn = document.getElementById('vibeSubmitBtn');
    const messageDiv = document.getElementById('vibeMessage');

    try {
      // Get form data
      const vibeText = document.getElementById('vibe-text').value;
      const personaDemographic = document.getElementById('persona-demographic').value;
      const personaActivity = document.getElementById('persona-activity').value;
      const personaStyle = document.getElementById('persona-style').value;

      // Get the selected prompt
      const activePromptBtn = document.querySelector('.vibe-prompt-btn.active');
      const vibePrompt = activePromptBtn ? activePromptBtn.getAttribute('data-prompt') : 'I love vibing at';

      // Combine prompt with user text
      const fullVibeText = `${vibePrompt} ${vibeText}`;

      const vibeData = {
        vibe_text: fullVibeText,
        persona_demographic: personaDemographic || 'Local Explorer',
        persona_activity: personaActivity || 'Solo Adventure',
        persona_style: personaStyle || 'Casual & Relaxed',
        category: this.getCurrentLocation()
      };

      // Validate
      if (!vibeData.vibe_text || vibeData.vibe_text.trim() === '') {
        this.showVibeMessage('Please describe your vibe', 'error', messageDiv);
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      // Submit to API
      const response = await fetch('https://vibing-sarasota-api.azurewebsites.net/api/vibes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vibeData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.showVibeMessage('🎉 Your vibe has been submitted! We update our recommendations weekly, so check back soon to see new spots that match your vibe.', 'success', messageDiv);
        this.resetVibeForm();
      } else if (response.status === 429) {
        this.showVibeMessage(result.message || 'You can only submit one vibe per hour. Try again later!', 'error', messageDiv);
      } else {
        this.showVibeMessage(result.error || 'Something went wrong. Please try again!', 'error', messageDiv);
      }

    } catch (error) {
      console.error('Vibe submission error:', error);
      this.showVibeMessage('Network error. Please check your connection and try again.', 'error', messageDiv);
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  }

  // Reset vibe form
  resetVibeForm() {
    const form = document.getElementById('vibeSubmissionForm');
    if (form) form.reset();

    const charCount = document.getElementById('char-count');
    if (charCount) charCount.textContent = '0';

    document.querySelectorAll('.persona-btn.selected').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('#persona-demographic, #persona-activity, #persona-style').forEach(input => input.value = '');

    document.querySelectorAll('.vibe-prompt-btn').forEach(btn => btn.classList.remove('active'));
    const defaultPrompt = document.querySelector('.vibe-prompt-btn[data-prompt="I love vibing at"]');
    if (defaultPrompt) defaultPrompt.classList.add('active');

    const promptText = document.getElementById('vibePromptText');
    if (promptText) promptText.textContent = 'I love vibing at';
  }

  // Initialize vibe submission widget (legacy)
  initVibeSubmission() {
    const vibeForm = document.getElementById('vibeSubmissionForm');
    const vibeTextarea = document.getElementById('vibe-text');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('vibeSubmitBtn');
    const messageDiv = document.getElementById('vibeMessage');

    if (!vibeForm) return; // Widget not present on this page

    // Initialize persona button selection
    this.initPersonaButtons();

    // Initialize vibe prompt buttons
    this.initVibePromptButtons();

    // Character counter
    if (vibeTextarea && charCount) {
      vibeTextarea.addEventListener('input', () => {
        const count = vibeTextarea.value.length;
        charCount.textContent = count;

        // Change color as approaching limit
        if (count > 80) {
          charCount.style.color = 'var(--accent-orange)';
        } else if (count > 95) {
          charCount.style.color = '#ef4444';
        } else {
          charCount.style.color = 'var(--neutral-gray)';
        }
      });
    }

    // Form submission
    if (vibeForm) {
      console.log('Vibe form found, adding submit listener');
      vibeForm.addEventListener('submit', async (e) => {
        console.log('Form submit event triggered');
        e.preventDefault();
        await this.submitVibe(vibeForm, submitBtn, messageDiv);
      });
    } else {
      console.error('Vibe form not found!');
    }
  }

  // Initialize persona button selection
  initPersonaButtons() {
    const personaGroups = document.querySelectorAll('.persona-buttons');

    personaGroups.forEach(group => {
      const buttons = group.querySelectorAll('.persona-btn');
      const groupType = group.getAttribute('data-group');
      const hiddenInput = document.getElementById(`persona-${groupType}`);

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          console.log('Button clicked:', button.getAttribute('data-value'), 'Group:', groupType);

          // Remove selected class from all buttons in this group
          buttons.forEach(btn => btn.classList.remove('selected'));

          // Add selected class to clicked button
          button.classList.add('selected');

          // Update hidden input value
          if (hiddenInput) {
            hiddenInput.value = button.getAttribute('data-value');
            console.log('Updated hidden input:', hiddenInput.id, 'Value:', hiddenInput.value);
          } else {
            console.error('Hidden input not found for group:', groupType);
          }
        });
      });
    });
  }

  // Initialize vibe prompt buttons
  initVibePromptButtons() {
    const promptButtons = document.querySelectorAll('.vibe-prompt-btn');
    const promptText = document.getElementById('vibePromptText');
    const vibeTextarea = document.getElementById('vibe-text');

    promptButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        promptButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Update prompt text
        const prompt = button.getAttribute('data-prompt');
        if (promptText) {
          promptText.textContent = prompt;
        }

        // Update textarea placeholder
        if (vibeTextarea) {
          if (prompt.includes('love vibing at')) {
            vibeTextarea.placeholder = 'the coffee shop on Main Street with amazing vibes...';
          } else {
            vibeTextarea.placeholder = 'has live music and great cocktails...';
          }
        }
      });
    });
  }

  // Submit vibe to API
  async submitVibe(form, submitBtn, messageDiv) {
    try {
      // Get form data from hidden inputs (populated by button selections)
      const vibeText = document.getElementById('vibe-text').value;
      const personaDemographic = document.getElementById('persona-demographic').value;
      const personaActivity = document.getElementById('persona-activity').value;
      const personaStyle = document.getElementById('persona-style').value;

      // Get the selected prompt
      const activePromptBtn = document.querySelector('.vibe-prompt-btn.active');
      const vibePrompt = activePromptBtn ? activePromptBtn.getAttribute('data-prompt') : 'I love vibing at';

      // Combine prompt with user text
      const fullVibeText = `${vibePrompt} ${vibeText}`;

      const vibeData = {
        vibe_text: fullVibeText,
        persona_demographic: personaDemographic,
        persona_activity: personaActivity,
        persona_style: personaStyle,
        category: this.getCurrentLocation()
      };

      // Validate required fields
      if (!vibeData.vibe_text || vibeData.vibe_text.trim() === '') {
        this.showVibeMessage('Please describe your vibe', 'error', messageDiv);
        return;
      }

      // Set default values if persona fields are empty
      if (!vibeData.persona_demographic) vibeData.persona_demographic = 'Local Explorer';
      if (!vibeData.persona_activity) vibeData.persona_activity = 'Solo Adventure';
      if (!vibeData.persona_style) vibeData.persona_style = 'Casual & Relaxed';

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      // Submit to API
      const response = await fetch('https://vibing-sarasota-api.azurewebsites.net/api/vibes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vibeData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success - show updated message about weekly updates
        this.showVibeMessage('🎉 Your vibe has been submitted! We update our recommendations weekly, so check back soon to see new spots that match your vibe.', 'success', messageDiv);

        // Reset form
        form.reset();
        document.getElementById('char-count').textContent = '0';

        // Reset button selections
        document.querySelectorAll('.persona-btn.selected').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('#persona-demographic, #persona-activity, #persona-style').forEach(input => input.value = '');

        // Reset prompt to default
        document.querySelectorAll('.vibe-prompt-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.vibe-prompt-btn[data-prompt="I love vibing at"]').classList.add('active');
        document.getElementById('vibePromptText').textContent = 'I love vibing at';
        document.getElementById('vibe-text').placeholder = 'the coffee shop on Main Street with amazing vibes...';

      } else if (response.status === 429) {
        // Rate limited
        this.showVibeMessage(result.message || 'You can only submit one vibe per hour. Try again later!', 'error', messageDiv);
      } else {
        // Other error
        this.showVibeMessage(result.error || 'Something went wrong. Please try again!', 'error', messageDiv);
      }

    } catch (error) {
      console.error('Vibe submission error:', error);
      this.showVibeMessage('Network error. Please check your connection and try again.', 'error', messageDiv);
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  }

  // Show vibe submission message
  showVibeMessage(message, type, messageDiv) {
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `vibe-message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// Global utility functions
window.VibingSarasotaApp = VibingSarasotaApp;
