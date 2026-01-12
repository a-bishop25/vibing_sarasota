/**
 * Vibe Widget - Modal vibe submission component
 * Handles modal functionality and form submission
 */

class VibeWidget {
  constructor() {
    this.isOpen = false;
    this.headerButton = null;
    this.modal = null;
    this.overlay = null;
    this.closeBtn = null;
    this.form = null;

    this.init();
  }

  init() {
    console.log('VibeWidget: Initializing...');

    // Find header button
    this.headerButton = document.getElementById('vibeHeaderButton');
    console.log('VibeWidget: Header button found:', this.headerButton);

    // Create modal if header button exists
    if (this.headerButton) {
      console.log('VibeWidget: Creating modal...');
      this.createModal();
      this.attachEventListeners();
      this.initFormFunctionality();
      console.log('VibeWidget: Initialization complete');
    } else {
      console.log('VibeWidget: Header button not found!');
    }
  }

  createModal() {
    console.log('VibeWidget: Creating modal overlay...');

    // Create modal overlay with inline styles to ensure it works
    this.overlay = document.createElement('div');
    this.overlay.className = 'vibe-modal-overlay';
    this.overlay.id = 'vibeModalOverlay';
    this.overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 999999 !important;
      display: none !important;
      align-items: center !important;
      justify-content: center !important;
    `;

    // Create modal content
    this.modal = document.createElement('div');
    this.modal.className = 'vibe-modal';
    this.modal.style.cssText = `
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      padding: 24px;
    `;

    // Add modal HTML
    this.modal.innerHTML = `
      <div class="vibe-modal-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
        <h3 style="margin: 0; font-size: 18px; color: #333;">💫 Share Your Vibe</h3>
        <button type="button" class="vibe-close-btn" id="vibeCloseBtn" aria-label="Close" style="background: none; border: none; font-size: 24px; color: #666; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">×</button>
      </div>
      <form class="vibe-submission-form" id="vibeSubmissionForm">
        <div class="persona-game">
          <h4 style="font-size: 16px; margin-bottom: 8px; color: #333;">Quick Profile:</h4>
          <div class="persona-columns" style="display: flex; flex-direction: column; gap: 8px;">
            <div class="persona-column">
              <label style="font-size: 14px; font-weight: 600; margin-bottom: 4px; display: block; color: #333;">I'm a...</label>
              <div class="persona-buttons" data-group="demographic" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                <button type="button" class="persona-btn" data-value="Local" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Local</button>
                <button type="button" class="persona-btn" data-value="Tourist" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Tourist</button>
                <button type="button" class="persona-btn" data-value="New Resident" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">New Resident</button>
              </div>
              <input type="hidden" id="persona-demographic" name="persona_demographic" required>
            </div>
            <div class="persona-column">
              <label style="font-size: 14px; font-weight: 600; margin-bottom: 4px; display: block; color: #333;">Looking for...</label>
              <div class="persona-buttons" data-group="activity" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                <button type="button" class="persona-btn" data-value="Date" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Date</button>
                <button type="button" class="persona-btn" data-value="Family" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Family</button>
                <button type="button" class="persona-btn" data-value="Solo" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Solo</button>
                <button type="button" class="persona-btn" data-value="Friends" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Friends</button>
              </div>
              <input type="hidden" id="persona-activity" name="persona_activity" required>
            </div>
            <div class="persona-column">
              <label style="font-size: 14px; font-weight: 600; margin-bottom: 4px; display: block; color: #333;">Style...</label>
              <div class="persona-buttons" data-group="style" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                <button type="button" class="persona-btn" data-value="Upscale" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Upscale</button>
                <button type="button" class="persona-btn" data-value="Casual" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Casual</button>
                <button type="button" class="persona-btn" data-value="Trendy" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Trendy</button>
                <button type="button" class="persona-btn" data-value="Hidden" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">Hidden</button>
              </div>
              <input type="hidden" id="persona-style" name="persona_style" required>
            </div>
          </div>
        </div>
        <div class="vibe-description" style="margin-top: 16px;">
          <label style="font-size: 14px; font-weight: 600; margin-bottom: 4px; display: block; color: #333;">Share your vibe:</label>
          <div class="vibe-prompt-buttons" style="display: flex; gap: 4px; margin-bottom: 8px;">
            <button type="button" class="vibe-prompt-btn active" data-prompt="I love" style="padding: 4px 8px; font-size: 14px; border: 1px solid #007bff; background: #007bff; color: white; border-radius: 16px; cursor: pointer;">💕 Love</button>
            <button type="button" class="vibe-prompt-btn" data-prompt="Looking for" style="padding: 4px 8px; font-size: 14px; border: 1px solid #ccc; background: white; border-radius: 16px; cursor: pointer;">🔍 Want</button>
          </div>
          <div class="vibe-input-container">
            <span class="vibe-prompt-text" id="vibePromptText" style="font-weight: 600;">I love</span>
            <textarea id="vibe-text" name="vibe_text" placeholder="tell us about the spot..." maxlength="80" required style="width: 100%; min-height: 80px; padding: 8px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px; resize: vertical; font-family: inherit; margin-top: 4px;"></textarea>
          </div>
          <div class="character-count" style="font-size: 12px; color: #666; text-align: right; margin-bottom: 8px;">
            <span id="char-count">0</span>/80
          </div>
        </div>
        <div class="vibe-submit-section">
          <button type="submit" class="vibe-submit-button" id="vibeSubmitBtn" style="width: 100%; padding: 12px 16px; font-size: 16px; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%); color: white; border: none; border-radius: 4px; cursor: pointer;">
            <span class="submit-text">Share ✨</span>
            <span class="submit-loading" style="display: none;">...</span>
          </button>
        </div>
        <div class="vibe-message" id="vibeMessage" style="display: none;"></div>
      </form>
    `;

    // Add modal to overlay
    this.overlay.appendChild(this.modal);

    // Add overlay to body
    document.body.appendChild(this.overlay);
    console.log('VibeWidget: Modal added to body');

    // Get references to form elements
    this.closeBtn = document.getElementById('vibeCloseBtn');
    this.form = document.getElementById('vibeSubmissionForm');
  }

  setClosedState() {
    console.log('VibeWidget: Setting closed state...');

    if (this.overlay) {
      this.overlay.style.display = 'none';
      this.overlay.classList.remove('active');
      console.log('VibeWidget: Modal hidden');
    }

    this.isOpen = false;

    // Re-enable body scroll
    document.body.style.overflow = '';
  }

  setOpenState() {
    console.log('VibeWidget: Setting open state...');
    console.log('VibeWidget: Overlay element:', this.overlay);

    if (this.overlay) {
      // Use inline style to force visibility
      this.overlay.style.display = 'flex';
      this.overlay.classList.add('active');
      console.log('VibeWidget: Modal should now be visible with display: flex');
    } else {
      console.log('VibeWidget: ERROR - No overlay element found!');
    }

    this.isOpen = true;

    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    console.log('VibeWidget: Modal opening complete');
  }

  attachEventListeners() {
    console.log('VibeWidget: Attaching event listeners...');

    // Header + button click to open modal
    if (this.headerButton) {
      console.log('VibeWidget: Adding click listener to header button');
      this.headerButton.addEventListener('click', (e) => {
        console.log('VibeWidget: Header button clicked!');
        e.preventDefault();
        e.stopPropagation();
        this.setOpenState();
      });
    }

    // Close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setClosedState();
      });
    }

    // Overlay click to close (but not modal content)
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.setClosedState();
        }
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.setClosedState();
      }
    });

    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitVibe();
      });
    }

  }

  initFormFunctionality() {
    // Initialize persona button selection
    this.initPersonaButtons();
    
    // Initialize vibe prompt buttons
    this.initVibePromptButtons();
    
    // Initialize character counter
    this.initCharacterCounter();
  }

  initPersonaButtons() {
    const personaGroups = document.querySelectorAll('.persona-buttons');
    
    personaGroups.forEach(group => {
      const buttons = group.querySelectorAll('.persona-btn');
      const groupType = group.getAttribute('data-group');
      const hiddenInput = document.getElementById(`persona-${groupType}`);
      
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove selected class from all buttons in this group
          buttons.forEach(btn => btn.classList.remove('selected'));
          
          // Add selected class to clicked button
          button.classList.add('selected');
          
          // Update hidden input value
          if (hiddenInput) {
            hiddenInput.value = button.getAttribute('data-value');
          }
        });
      });
    });
  }

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

  initCharacterCounter() {
    const vibeTextarea = document.getElementById('vibe-text');
    const charCount = document.getElementById('char-count');

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
  }

  async submitVibe() {
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
        persona_demographic: personaDemographic,
        persona_activity: personaActivity,
        persona_style: personaStyle,
        category: this.getCurrentCategory()
      };

      // Validate required fields
      if (!vibeData.vibe_text || vibeData.vibe_text.trim() === '') {
        this.showMessage('Please describe your vibe', 'error', messageDiv);
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
        // Success
        this.showMessage('🎉 Your vibe has been submitted! We update our recommendations weekly, so check back soon to see new spots that match your vibe.', 'success', messageDiv);
        
        // Reset form
        this.resetForm();
        
      } else if (response.status === 429) {
        // Rate limited
        this.showMessage(result.message || 'You can only submit one vibe per hour. Try again later!', 'error', messageDiv);
      } else {
        // Other error
        this.showMessage(result.error || 'Something went wrong. Please try again!', 'error', messageDiv);
      }

    } catch (error) {
      console.error('Vibe submission error:', error);
      this.showMessage('Network error. Please check your connection and try again.', 'error', messageDiv);
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  }

  getCurrentCategory() {
    // Extract category from current page URL or use a data attribute
    const path = window.location.pathname;
    if (path.includes('meet-people')) return 'meet-people';
    if (path.includes('food-services')) return 'food-services';
    if (path.includes('fine-dining')) return 'fine-dining';
    if (path.includes('nightlife')) return 'nightlife';
    if (path.includes('health-wellness')) return 'health-wellness';
    if (path.includes('golf')) return 'golf';
    if (path.includes('entertainment')) return 'entertainment';
    if (path.includes('st-armands')) return 'st-armands';
    if (path.includes('beaches')) return 'beaches';
    if (path.includes('family-activities')) return 'family-activities';
    return 'general';
  }

  showMessage(message, type, messageDiv) {
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `vibe-message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }

  resetForm() {
    // Reset form fields
    this.form.reset();
    document.getElementById('char-count').textContent = '0';
    
    // Reset button selections
    document.querySelectorAll('.persona-btn.selected').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('#persona-demographic, #persona-activity, #persona-style').forEach(input => input.value = '');
    
    // Reset prompt to default
    document.querySelectorAll('.vibe-prompt-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.vibe-prompt-btn[data-prompt="I love vibing at"]').classList.add('active');
    document.getElementById('vibePromptText').textContent = 'I love vibing at';
    document.getElementById('vibe-text').placeholder = 'the coffee shop on Main Street with amazing vibes...';
  }
}

// Initialize the vibe widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VibeWidget();
});
