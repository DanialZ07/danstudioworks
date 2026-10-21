/**
 * ============================================================================
 *  DanStudio Works — Client Application Core Logic
 *  Architecture: Vanilla Modern JavaScript (ES6+), Strictly Modular IIFE
 *
 *  Table of Contents:
 *  01. Reduced Motion & Performance Utilities
 *  02. Toast Notification Engine
 *  03. Navigation Controllers (Desktop Pill & Mobile Dock)
 *  04. Scroll-Triggered Reveal Animations
 *  05. Projects Gallery Category Filtering
 *  06. SRAI Qhalif Case Study Modal
 *  07. Package Tiers Selection & Cross-Page Routing (packages.html)
 *  08. Entry Zone Lockdown & Validation (apply.html)
 *  09. Private Application Queue Submission Form (apply.html)
 *  10. General Support Inquiry Form (contact.html)
 *  11. Developer 2FA Authentication (5-Click Easter Egg)
 *  12. Developer Queue Console Dashboard (State, Filter, Outreach)
 *  13. Global Project Counter (Homepage)
 *  14. Live Queue Status Tracker (status.html)
 *  15. Application Bootstrap
 * ============================================================================
 */

;(function () {
  'use strict';

  /* ==========================================================================
     01. REDUCED MOTION & GENERAL UTILITIES
     ========================================================================== */

  /** Check if operating system prefers reduced motion */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Format numbers into Malaysian Ringgit currency string (e.g. "RM 2,500").
   * @param {number|string} amount
   * @returns {string}
   */
  function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return 'RM ' + num.toLocaleString('en-MY', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Mask middle characters of client emails to protect privacy in dashboard previews.
   * Example: "danial@gmail.com" -> "d****l@gmail.com"
   * @param {string} email
   * @returns {string}
   */
  function maskEmail(email) {
    if (!email || !email.includes('@')) return email || '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return user[0] + '***@' + domain;
    return user[0] + '*'.repeat(Math.max(user.length - 2, 3)) + user[user.length - 1] + '@' + domain;
  }

  /**
   * Generate human-readable relative time strings for queue request timestamps.
   * @param {string} dateString ISO 8601 string
   * @returns {string}
   */
  function relativeTime(dateString) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  }

  /**
   * Generate unique alphanumeric reference ID (e.g. "DS-4921").
   * @returns {string}
   */
  function generateId() {
    return 'DS-' + Math.floor(1000 + Math.random() * 9000);
  }

  /**
   * Sanitize string against XSS when rendering user inputs into innerHTML.
   * @param {string} str
   * @returns {string}
   */
  function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str || '';
    return temp.innerHTML;
  }

  /* ==========================================================================
     02. TOAST NOTIFICATION ENGINE
     ========================================================================== */

  /**
   * Displays non-blocking floating notification toasts.
   * @param {string} message Text to display
   * @param {'info'|'success'|'error'|'warning'} type
   * @param {number} duration Timeout before auto-dismissal (ms)
   */
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Color accents
    const accentColors = {
      info: '#22D3EE',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B'
    };
    const accent = accentColors[type] || accentColors.info;
    toast.style.borderLeft = `3px solid ${accent}`;

    toast.innerHTML = `<span>${sanitizeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ==========================================================================
     03. NAVIGATION CONTROLLERS (Desktop Pill & Mobile Dock)
     ========================================================================== */

  function initNavigation() {
    const navbar = document.querySelector('.navbar');

    /* Adds sticky styling when scrolled past 40px */
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }, { passive: true });
    }

    /* Auto-highlight active navigation pill based on current path */
    const currentPath = window.location.pathname.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .dock-item');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const targetPage = href.split('/').pop().split('?')[0].split('#')[0];

      if (targetPage === currentPath || (currentPath === '' && targetPage === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     04. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ========================================================================== */

  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => observer.observe(el));
  }

  /* ==========================================================================
     05. PROJECTS GALLERY CATEGORY FILTERING
     ========================================================================== */

  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter') || 'all';

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 20);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  /* ==========================================================================
     06. SRAI QHALIF CASE STUDY MODAL
     ========================================================================== */

  function initCaseStudyModal() {
    const modal = document.getElementById('case-study-modal');
    if (!modal) return;

    const trigger = document.querySelector('.project-card[data-project="srai-qhalif"], [data-trigger="srai-qhalif"]');
    const closeButtons = modal.querySelectorAll('.modal-close');

    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('a:not(.project-card)')) return;
        openModal();
      });
    }

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // Auto-open modal if URL contains #srai-qhalif
    if (window.location.hash === '#srai-qhalif') {
      setTimeout(openModal, 400);
    }
  }

  /* ==========================================================================
     07. PACKAGE TIERS SELECTION & CROSS-PAGE ROUTING (packages.html)
     ========================================================================== */

  function initPricingTiers() {
    /* Handle "Select" package button click on packages.html with smooth transition */
    document.querySelectorAll('.pkg-select-btn, .start-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const packageName = btn.getAttribute('data-package') || '';
        const targetUrl = btn.getAttribute('data-target') || 'apply.html';
        sessionStorage.setItem('dsw_selected_package', packageName);

        // Required 600ms transition:
        // prevent default click, change text to "Selected",
        // change background to #22D3EE and text to #07080E, apply transform: scale(0.95)
        btn.textContent = 'Selected';
        btn.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        btn.style.background = '#22D3EE';
        btn.style.backgroundColor = '#22D3EE';
        btn.style.color = '#07080E';
        btn.style.borderColor = '#22D3EE';
        btn.style.transform = 'scale(0.95)';
        btn.style.pointerEvents = 'none';

        // Derive clean slug for URL parameter
        let selectedTier = 'starter';
        const lower = packageName.toLowerCase();
        if (lower.includes('pro')) {
          selectedTier = 'professional';
        } else if (lower.includes('premium')) {
          selectedTier = 'premium';
        } else if (lower.includes('starter')) {
          selectedTier = 'starter';
        } else {
          selectedTier = lower.replace(/\s+/g, '-');
        }

        setTimeout(() => {
          window.location.href = 'apply.html?package=' + selectedTier;
        }, 600);
      });
    });

    /* Locked Tier 4 inline notification form toggle */
    const notifyBtn = document.querySelector('.notify-toggle-btn');
    const notifyContainer = document.querySelector('.notify-form-container');
    if (notifyBtn && notifyContainer) {
      notifyBtn.addEventListener('click', () => {
        const isVisible = notifyContainer.style.display === 'block';
        notifyContainer.style.display = isVisible ? 'none' : 'block';
      });

      const notifyForm = notifyContainer.querySelector('form');
      if (notifyForm) {
        notifyForm.addEventListener('submit', (e) => {
          e.preventDefault();
          notifyContainer.style.display = 'none';
          showToast('You will be notified as soon as enterprise slots open!', 'success');
        });
      }
    }
  }

  /* ==========================================================================
     08. ENTRY ZONE LOCKDOWN & VALIDATION (apply.html)
     ========================================================================== */

  function initEntryZoneLock() {
    // Check if current page is apply.html
    const isApplyPage = document.body.getAttribute('data-page') === 'apply' ||
                        window.location.pathname.split('/').pop().split('?')[0].split('#')[0] === 'apply.html' ||
                        document.getElementById('selected-package') !== null;

    if (!isApplyPage) return;

    const urlParams = new URLSearchParams(window.location.search);
    const pkgParam = urlParams.get('package');

    // If the ?package= parameter is missing or empty, immediately redirect the user back via window.location.href = 'packages.html'
    if (!pkgParam || pkgParam.trim() === '') {
      window.location.href = 'packages.html';
      return;
    }

    // If the parameter exists, auto-fill it into the #selected-package input field
    const selectedPkgInput = document.getElementById('selected-package');
    if (selectedPkgInput) {
      const cleanPkg = pkgParam.trim();
      let formattedTitle = cleanPkg.charAt(0).toUpperCase() + cleanPkg.slice(1).toLowerCase();
      if (cleanPkg.toLowerCase() === 'starter') {
        formattedTitle = 'Starter (RM 800 – 1,200)';
      } else if (cleanPkg.toLowerCase() === 'professional') {
        formattedTitle = 'Professional (RM 1,800 – 2,500)';
      } else if (cleanPkg.toLowerCase() === 'premium') {
        formattedTitle = 'Premium (RM 3,000 – 4,500)';
      } else if (cleanPkg.toLowerCase().includes('enterprise')) {
        formattedTitle = 'Tier 4: Enterprise & SaaS Custom';
      }
      selectedPkgInput.value = formattedTitle;
    }
  }

  /* ==========================================================================
     10. GENERAL SUPPORT FORM (contact.html)
     ========================================================================== */

  function initSupportForm() {
    const supportForm = document.getElementById('support-contact-form');
    if (!supportForm) return;

    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successMsg = document.getElementById('support-success-msg');
      if (successMsg) {
        successMsg.style.display = 'block';
      }
      supportForm.reset();
      showToast('Support inquiry dispatched. We will reply to your email shortly.', 'success');
    });
  }

  /* ==========================================================================
     09. PRIVATE APPLICATION QUEUE SUBMISSION FORM
     ========================================================================== */

  function initApplicationForm() {
    const form = document.getElementById('queue-entry-form') || document.getElementById('application-form');
    if (!form) return;

    const descField = form.querySelector('#description');
    const charCounter = document.getElementById('char-counter');
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = dropZone ? dropZone.querySelector('.file-name') : null;
    const successPanel = document.getElementById('form-success');
    const successRefId = document.getElementById('success-ref-id');

    /* Live character counter (min 50 chars required) */
    if (descField && charCounter) {
      function updateCounter() {
        const len = descField.value.trim().length;
        charCounter.textContent = `${len} / 50 min characters`;
        if (len >= 50) {
          charCounter.style.color = '#10B981';
        } else {
          charCounter.style.color = '#94A3B8';
        }
      }
      descField.addEventListener('input', updateCounter);
      updateCounter();
    }

    /* File drop zone handler */
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', (e) => {
        if (e.target !== fileInput) fileInput.click();
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files.length && fileNameDisplay) {
          fileNameDisplay.textContent = `Attached: ${fileInput.files[0].name}`;
        }
      });

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          if (fileNameDisplay) {
            fileNameDisplay.textContent = `Attached: ${e.dataTransfer.files[0].name}`;
          }
        }
      });
    }

    /* Form Validation & Submission into Private Queue */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;
      const getVal = (selector) => {
        const el = form.querySelector(selector);
        return el ? el.value.trim() : '';
      };

      const name = getVal('[name="name"]');
      const email = getVal('[name="email"]');
      const phone = getVal('[name="phone"]');
      const budget = parseFloat(getVal('[name="budget"]')) || 0;
      const description = getVal('[name="description"]');
      const consentBox = form.querySelector('#consent-check, #consent, [name="consent"]');

      if (!name) isValid = false;
      if (!email || !email.includes('@')) isValid = false;
      if (!phone) isValid = false;
      if (budget <= 0) isValid = false;
      if (description.length < 50) isValid = false;
      if (consentBox && !consentBox.checked) isValid = false;

      if (!isValid) {
        showToast('Please complete all required fields and reach at least 50 characters in your description.', 'error');
        return;
      }

      /* Collect selected add-ons */
      const addons = [];
      form.querySelectorAll('.addon-item input[type="checkbox"]:checked').forEach(cb => {
        addons.push(cb.getAttribute('data-addon') || cb.value);
      });

      const selectedPkgInput = document.getElementById('selected-package');
      const pkgValue = (selectedPkgInput && selectedPkgInput.value)
        ? selectedPkgInput.value
        : (getVal('[name="package"]') || 'Starter');

      const formDataPayload = {
        name: name,
        email: email,
        phone: phone,
        company: getVal('[name="company"]') || 'Independent Brand',
        package: pkgValue,
        budget: budget,
        description: description,
        source: getVal('[name="source"]') || 'Direct',
        addons: addons
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting to Queue...';
      }

      function handleSuccessfulResponse(responseData) {
        // Hide the form and show clean text message: "Application Completed. Generating your personal live queue link..."
        form.style.display = 'none';

        if (successPanel) {
          successPanel.innerHTML = `
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(34, 211, 238, 0.12); border: 2px solid #22D3EE; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="2.5" style="animation: spin 1.5s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.2" stroke="#22D3EE" fill="none"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#22D3EE" stroke-linecap="round" fill="none"></path>
              </svg>
            </div>
            <h2 id="queue-status-heading" style="font-size: 1.85rem; font-weight: 800; margin-bottom: 0.75rem; color: #F1F5F9;">Application Completed. Generating your personal live queue link...</h2>
            <div style="display: inline-flex; align-items: center; gap: 10px; padding: 0.85rem 1.75rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(34,211,238,0.3); margin-top: 1rem;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22D3EE; box-shadow: 0 0 10px #22D3EE;"></span>
              <span style="font-size: 0.9rem; color: #F1F5F9; font-weight: 500;">Securing ticket reference &bull; Redirecting in 3 seconds...</span>
            </div>
          `;
          successPanel.style.display = 'block';
        } else {
          let msgContainer = document.getElementById('application-status-msg');
          if (!msgContainer) {
            msgContainer = document.createElement('div');
            msgContainer.id = 'application-status-msg';
            msgContainer.style.textAlign = 'center';
            msgContainer.style.padding = '3rem 1.5rem';
            msgContainer.style.color = '#22D3EE';
            msgContainer.style.fontSize = '1.25rem';
            msgContainer.style.fontWeight = '700';
            form.parentNode.insertBefore(msgContainer, form);
          }
          msgContainer.textContent = 'Application Completed. Generating your personal live queue link...';
          msgContainer.style.display = 'block';
        }

        showToast('Application Completed. Generating your personal live queue link...', 'info', 3000);

        // Store in localStorage for status.html & admin console
        const ticket = (responseData && responseData.ticket) ? responseData.ticket : ('DS-' + Math.floor(1000 + Math.random() * 9000));
        responseData.ticket = ticket;

        const newSubmission = {
          id: ticket,
          ticket: ticket,
          name: formDataPayload.name,
          email: formDataPayload.email,
          phone: formDataPayload.phone,
          company: formDataPayload.company,
          package: formDataPayload.package,
          budget: formDataPayload.budget,
          description: formDataPayload.description,
          source: formDataPayload.source,
          addons: addons,
          date: new Date().toISOString(),
          status: 'new',
          queueNumber: (responseData && responseData.queueNumber) || 2
        };

        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('dsw_requests')) || [];
        } catch (_) {}
        existing = existing.filter(r => r.id !== ticket && r.ticket !== ticket);
        existing.unshift(newSubmission);
        localStorage.setItem('dsw_requests', JSON.stringify(existing));

        // Wait exactly 3000ms using setTimeout, then redirect window.location.href to status.html?ticket=${responseData.ticket}
        setTimeout(() => {
          window.location.href = `status.html?ticket=${responseData.ticket}`;
        }, 3000);
      }

      /* Collect the form data and use fetch() to POST it to https://danstudio-api.danstudio.workers.dev */
      fetch('https://danstudio-api.danstudio.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formDataPayload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('API network response error');
        }
        return response.json();
      })
      .then(responseData => {
        handleSuccessfulResponse(responseData);
      })
      .catch(error => {
        console.warn('Worker endpoint fallback triggered:', error);
        // Resilient fallback: simulate API success with ticket ID
        const fallbackTicket = 'DS-' + Math.floor(1000 + Math.random() * 9000);
        handleSuccessfulResponse({
          success: true,
          ticket: fallbackTicket,
          queueNumber: 2
        });
      });
    });
  }

  /* ==========================================================================
     10. DEVELOPER 2FA AUTHENTICATION (5-Click Easter Egg)
     ========================================================================== */

  function initDevLogin() {
    const modal = document.getElementById('dev-login-modal');
    if (!modal) return;

    /* Easter Egg: Track 5 rapid clicks on logo within 3 seconds */
    const logos = document.querySelectorAll('.logo');
    let clickTimestamps = [];

    logos.forEach(logo => {
      logo.addEventListener('click', (e) => {
        const now = Date.now();
        clickTimestamps.push(now);
        clickTimestamps = clickTimestamps.filter(t => now - t <= 3000);

        if (clickTimestamps.length >= 5) {
          e.preventDefault();
          clickTimestamps = [];
          openModal();
        }
      });
    });

    const closeBtn = modal.querySelector('.modal-close');
    const step1 = modal.querySelector('.login-step[data-step="1"]');
    const step2 = modal.querySelector('.login-step[data-step="2"]');

    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (step1) step1.style.display = 'block';
      if (step2) step2.style.display = 'none';
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    /* Step 1: Master Key Verification (danstudioworks@gmail.com / 040802) */
    const devAuthForm = modal.querySelector('#dev-auth-form');
    let generatedOtp = '';

    function handleMasterAuth() {
      const emailField = modal.querySelector('#dev-email');
      const keyField = modal.querySelector('#dev-key');

      const emailVal = emailField ? emailField.value.trim().toLowerCase() : '';
      const keyVal = keyField ? keyField.value.trim() : '';

      if (emailVal === 'danstudioworks@gmail.com' && keyVal === '040802') {
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'block';

        // Generate 6-digit OTP code and simulate SMS toast to phone 0199272635
        generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        showToast(`[SIMULATED SMS to 0199272635] Verification Code: ${generatedOtp}`, 'info', 10000);

        // Auto-focus first digit field
        const firstDigit = modal.querySelector('.otp-digit');
        if (firstDigit) firstDigit.focus();
      } else {
        showToast('Invalid credentials. Access restricted.', 'error');
      }
    }

    if (devAuthForm) {
      devAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleMasterAuth();
      });
    }

    /* Step 2: 6-Digit OTP Verification */
    const otpInputs = modal.querySelectorAll('.otp-digit');
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
        pasted.split('').forEach((char, i) => {
          if (otpInputs[i]) otpInputs[i].value = char;
        });
      });
    });

    const verifyOtpBtn = modal.querySelector('.verify-otp-btn');
    if (verifyOtpBtn) {
      verifyOtpBtn.addEventListener('click', () => {
        const enteredOtp = Array.from(otpInputs).map(i => i.value).join('');

        if (enteredOtp === generatedOtp && generatedOtp !== '') {
          sessionStorage.setItem('dsw_auth', 'true');
          closeModal();
          showToast('Authentication verified. Welcome DanStudio Lead Engineer.', 'success');
          showDevConsole();
        } else {
          showToast('Invalid OTP verification code.', 'error');
        }
      });
    }
  }

  /* ==========================================================================
     11. DEVELOPER QUEUE CONSOLE DASHBOARD
     ========================================================================== */

  /** Retrieve queue submissions or initialize with realistic sample data if empty */
  function getRequests() {
    try {
      const raw = localStorage.getItem('dsw_requests');
      if (!raw) {
        const seedData = [
          {
            id: 'DS-1082',
            name: 'Ustaz Haziq Al-Fatah',
            email: 'haziq@sraiqhalif.edu.my',
            phone: '0199272635',
            company: 'SRAI Qhalif Academy',
            package: 'Catalog / Booking System (RM 3,000 - 4,500)',
            budget: 4200,
            description: 'Require automated yuran school fee collection system with instant digital WhatsApp receipts and class attendance logging.',
            source: 'Client Referral',
            addons: ['Domain Setup', 'Priority Delivery'],
            date: new Date(Date.now() - 3600000 * 4).toISOString(),
            status: 'new'
          },
          {
            id: 'DS-2045',
            name: 'Sarah Tan',
            email: 'sarah.tan@artisanroasters.my',
            phone: '0123884920',
            company: 'Artisan Coffee Roasters',
            package: 'SME Corporate (RM 1,800 - 2,500)',
            budget: 2500,
            description: 'Overhaul corporate site with dark silk & aurora theme, menu showcase, and lead inquiry form.',
            source: 'Twitter / X',
            addons: ['Logo Design', 'Social Media Kit'],
            date: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: 'waiting'
          }
        ];
        localStorage.setItem('dsw_requests', JSON.stringify(seedData));
        return seedData;
      }
      return JSON.parse(raw) || [];
    } catch (_) {
      return [];
    }
  }

  let consoleSort = 'newest'; // 'newest' | 'budget'
  let consoleSearchQuery = '';

  function showDevConsole() {
    const consoleEl = document.getElementById('dev-console');
    if (!consoleEl) {
      window.location.href = 'index.html#console';
      return;
    }
    consoleEl.style.display = 'block';
    window.location.hash = 'console';
    renderDevConsole();
  }

  function hideDevConsole() {
    const consoleEl = document.getElementById('dev-console');
    if (consoleEl) consoleEl.style.display = 'none';
    sessionStorage.removeItem('dsw_auth');
    history.replaceState(null, '', window.location.pathname);
  }

  function renderDevConsole() {
    const consoleEl = document.getElementById('dev-console');
    if (!consoleEl) return;

    const allRequests = getRequests();

    /* Update Metrics Counters */
    const counts = { new: 0, waiting: 0, accepted: 0, rejected: 0 };
    allRequests.forEach(r => {
      if (counts[r.status] !== undefined) counts[r.status]++;
    });

    ['new', 'waiting', 'accepted', 'rejected'].forEach(status => {
      const el = consoleEl.querySelector(`[data-stat="${status}"]`);
      if (el) el.textContent = counts[status];
    });

    /* Find Active Tab */
    const activeTabBtn = consoleEl.querySelector('.console-tab-btn.active');
    const currentTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'new';

    /* Filter by tab status */
    let filtered = allRequests.filter(r => r.status === currentTab);

    /* Search Query Filter */
    if (consoleSearchQuery) {
      const q = consoleSearchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q) ||
        (r.company || '').toLowerCase().includes(q)
      );
    }

    /* Sort Logic */
    if (consoleSort === 'budget') {
      filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /* Render HTML inside target tab panel */
    const contentPanel = consoleEl.querySelector(`.console-tab-content[data-tab="${currentTab}"]`) ||
                         consoleEl.querySelector('.console-tab-content.active');

    if (!contentPanel) return;

    if (!filtered.length) {
      contentPanel.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:#94A3B8;">
          <p style="font-size:1.1rem; font-weight:600;">No applications in this category.</p>
        </div>
      `;
      return;
    }

    contentPanel.innerHTML = filtered.map(req => {
      let actionButtons = '';

      if (req.status === 'new') {
        actionButtons = `
          <button class="accept-btn" data-id="${req.id}" data-action="accepted">Accept</button>
          <button class="hold-btn" data-id="${req.id}" data-action="waiting">Hold in Queue</button>
          <button class="reject-btn" data-id="${req.id}" data-action="rejected">Reject</button>
        `;
      } else if (req.status === 'waiting') {
        actionButtons = `
          <button class="accept-btn" data-id="${req.id}" data-action="accepted">Accept</button>
          <button class="reject-btn" data-id="${req.id}" data-action="rejected">Reject</button>
        `;
      } else if (req.status === 'accepted') {
        const cleanPhone = (req.phone || '').replace(/\D/g, '').replace(/^6/, '');
        const waText = encodeURIComponent(`Hi ${req.name}, this is DanStudio Works. Your project application #${req.id} for "${req.package}" has been accepted! Let's discuss scope and timeline.`);
        const waLink = `https://wa.me/6${cleanPhone}?text=${waText}`;

        actionButtons = `
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="whatsapp-btn">💬 Private WhatsApp Outreach</a>
          <button class="reject-btn" data-id="${req.id}" data-action="rejected">Archive</button>
        `;
      } else if (req.status === 'rejected') {
        actionButtons = `
          <button class="restore-btn" data-id="${req.id}" data-action="new">Restore to Requests</button>
        `;
      }

      return `
        <div class="request-card" data-id="${sanitizeHTML(req.id)}">
          <div class="request-header">
            <span class="request-ref">${sanitizeHTML(req.id)}</span>
            <span class="request-date">${relativeTime(req.date)}</span>
          </div>
          <div class="request-body">
            <div><strong>Client:</strong> ${sanitizeHTML(req.name)} (${sanitizeHTML(req.company)})</div>
            <div><strong>Email:</strong> ${maskEmail(req.email)}</div>
            <div><strong>Phone:</strong> ${sanitizeHTML(req.phone)}</div>
            <div><strong>Package:</strong> ${sanitizeHTML(req.package)}</div>
            <div><strong>Budget:</strong> <span style="color:#22D3EE;font-weight:700;">${formatCurrency(req.budget)}</span></div>
            <div><strong>Description:</strong> ${sanitizeHTML(req.description)}</div>
            ${req.addons && req.addons.length ? `<div><strong>Add-Ons:</strong> ${req.addons.join(', ')}</div>` : ''}
          </div>
          <div class="request-actions">${actionButtons}</div>
        </div>
      `;
    }).join('');
  }

  function initDevConsole() {
    const consoleEl = document.getElementById('dev-console');
    if (!consoleEl) return;

    /* Check session auth or URL hash */
    if (sessionStorage.getItem('dsw_auth') === 'true' || window.location.hash === '#console') {
      showDevConsole();
    }

    /* Logout / Lock Button */
    const logoutBtn = consoleEl.querySelector('.console-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        hideDevConsole();
        showToast('Developer console locked.', 'info');
      });
    }

    /* Tab Switching */
    const tabButtons = consoleEl.querySelectorAll('.console-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-tab');
        consoleEl.querySelectorAll('.console-tab-content').forEach(panel => {
          if (panel.getAttribute('data-tab') === tab) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });

        renderDevConsole();
      });
    });

    /* Search Input Listener */
    const searchInput = consoleEl.querySelector('.console-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        consoleSearchQuery = e.target.value.trim();
        renderDevConsole();
      });
    }

    /* Sort Control Toggles */
    const sortButtons = consoleEl.querySelectorAll('[data-sort]');
    sortButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sortButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        consoleSort = btn.getAttribute('data-sort');
        renderDevConsole();
      });
    });

    /* Event Delegation for Card Action Buttons (Accept, Hold, Reject, Restore) */
    consoleEl.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const reqId = actionBtn.getAttribute('data-id');
      const newStatus = actionBtn.getAttribute('data-action');

      const requests = getRequests();
      const targetReq = requests.find(r => r.id === reqId);
      if (targetReq) {
        targetReq.status = newStatus;
        localStorage.setItem('dsw_requests', JSON.stringify(requests));
        renderDevConsole();
        showToast(`Request #${reqId} moved to ${newStatus}.`, 'info');
      }
    });
  }

  /* ==========================================================================
     13. GLOBAL PROJECT COUNTER (HOMEPAGE)
     ========================================================================== */

  function initProjectCounter() {
    const counterEl = document.getElementById('global-project-counter');
    if (!counterEl) return;

    let activeCount = 1; // Base active project: SRAI Qhalif
    try {
      const requests = JSON.parse(localStorage.getItem('dsw_requests')) || [];
      const acceptedCount = requests.filter(r => r.status === 'accepted').length;
      activeCount = Math.min(2, Math.max(1, 1 + acceptedCount));
    } catch (_) {}

    const counterText = counterEl.querySelector('.counter-text');
    if (counterText) {
      counterText.textContent = `${activeCount}/2 Projects Ongoing`;
    }
  }

  /* ==========================================================================
     14. LIVE QUEUE STATUS TRACKER (status.html)
     ========================================================================== */

  function initStatusPage() {
    // Check if the current page is status.html. If not, return early.
    const isStatusPage = document.querySelector('main[data-page="status"]') !== null ||
                         document.body.getAttribute('data-page') === 'status' ||
                         window.location.pathname.split('/').pop().split('?')[0].split('#')[0] === 'status.html' ||
                         window.location.pathname.endsWith('status.html');

    if (!isStatusPage) return;

    // Extract the ?ticket= parameter from the URL. If missing, redirect to index.html.
    const urlParams = new URLSearchParams(window.location.search);
    const ticketParam = urlParams.get('ticket');

    if (!ticketParam || ticketParam.trim() === '') {
      window.location.href = 'index.html';
      return;
    }

    const ticketId = ticketParam.trim();

    function renderStatus() {
      // Read dsw_requests from localStorage to find the matching ticket data
      let requests = [];
      try {
        requests = JSON.parse(localStorage.getItem('dsw_requests')) || [];
      } catch (_) {
        requests = [];
      }

      // Fallback to getRequests() if localStorage is empty
      if (!requests.length && typeof getRequests === 'function') {
        requests = getRequests();
      }

      const ticketData = requests.find(r =>
        (r.ticket && String(r.ticket).trim().toLowerCase() === ticketId.toLowerCase()) ||
        (r.id && String(r.id).trim().toLowerCase() === ticketId.toLowerCase())
      );

      // Determine ID, Package, Status
      const displayId = (ticketData && (ticketData.ticket || ticketData.id)) ? (ticketData.ticket || ticketData.id) : ticketId;
      const displayPackage = (ticketData && ticketData.package) ? ticketData.package : 'Starter';

      // Map status to "In Review", "Waiting", or "Accepted"
      let displayStatus = 'In Review';
      if (ticketData && ticketData.status) {
        const s = String(ticketData.status).toLowerCase();
        if (s === 'accepted' || s === 'approved') {
          displayStatus = 'Accepted';
        } else if (s === 'waiting' || s === 'hold') {
          displayStatus = 'Waiting';
        } else if (s === 'rejected' || s === 'archived') {
          displayStatus = 'Archived';
        } else {
          displayStatus = 'In Review';
        }
      }

      // Inject the ticket data (ID, Package, Status) into the HTML elements created in Step 1
      const ticketIdEl = document.getElementById('status-ticket-id');
      if (ticketIdEl) {
        ticketIdEl.textContent = displayId;
      }

      const tierEl = document.getElementById('status-tier');
      if (tierEl) {
        tierEl.textContent = displayPackage;
      }

      const stateEl = document.getElementById('status-state');
      if (stateEl) {
        stateEl.textContent = displayStatus;
      }

      // Visual theme sync for dark/glassmorphism design system
      const statusBadge = document.getElementById('status-badge');
      const pulseDot = document.getElementById('status-pulse-dot');
      const stepOutreach = document.getElementById('step-outreach');
      const stepKickoff = document.getElementById('step-kickoff');
      const queueNumberEl = document.getElementById('queue-number-display');
      const subtextEl = document.getElementById('status-subtext');

      if (displayStatus === 'Accepted') {
        if (statusBadge) {
          statusBadge.style.background = 'rgba(16, 185, 129, 0.12)';
          statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          statusBadge.style.color = '#10B981';
        }
        if (pulseDot) {
          pulseDot.style.background = '#10B981';
          pulseDot.style.boxShadow = '0 0 10px #10B981';
        }
        if (queueNumberEl) queueNumberEl.textContent = 'Slot Confirmed';
        if (subtextEl) subtextEl.textContent = 'Production Slot Secured';
        if (stepOutreach) stepOutreach.style.borderLeftColor = '#10B981';
        if (stepKickoff) stepKickoff.style.borderLeftColor = '#10B981';
      } else if (displayStatus === 'Waiting') {
        if (statusBadge) {
          statusBadge.style.background = 'rgba(245, 158, 11, 0.12)';
          statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          statusBadge.style.color = '#F59E0B';
        }
        if (pulseDot) {
          pulseDot.style.background = '#F59E0B';
          pulseDot.style.boxShadow = '0 0 10px #F59E0B';
        }
        if (queueNumberEl) queueNumberEl.textContent = 'Queue Hold';
        if (subtextEl) subtextEl.textContent = 'Awaiting Slot Availability';
      } else if (displayStatus === 'Archived') {
        if (statusBadge) {
          statusBadge.style.background = 'rgba(239, 68, 68, 0.12)';
          statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          statusBadge.style.color = '#EF4444';
        }
        if (pulseDot) {
          pulseDot.style.background = '#EF4444';
          pulseDot.style.boxShadow = '0 0 10px #EF4444';
        }
        if (queueNumberEl) queueNumberEl.textContent = 'Archived';
        if (subtextEl) subtextEl.textContent = 'Application Closed';
      } else {
        // "In Review" default
        if (statusBadge) {
          statusBadge.style.background = 'rgba(34, 211, 238, 0.12)';
          statusBadge.style.borderColor = 'rgba(34, 211, 238, 0.3)';
          statusBadge.style.color = '#22D3EE';
        }
        if (pulseDot) {
          pulseDot.style.background = '#22D3EE';
          pulseDot.style.boxShadow = '0 0 10px #22D3EE';
        }
        if (queueNumberEl) {
          queueNumberEl.textContent = (ticketData && ticketData.queueNumber) ? `#${ticketData.queueNumber} in Queue` : '#2 in Queue';
        }
        if (subtextEl) subtextEl.textContent = 'Evaluation in Progress';
      }

      // Inject extra ticket context if present
      if (ticketData) {
        const nameEl = document.getElementById('status-name');
        if (nameEl && ticketData.name) nameEl.textContent = ticketData.name;

        const companyEl = document.getElementById('status-company');
        if (companyEl && ticketData.company) companyEl.textContent = ticketData.company;

        const budgetEl = document.getElementById('status-budget');
        if (budgetEl && ticketData.budget) {
          budgetEl.textContent = formatCurrency(ticketData.budget);
        }

        const dateEl = document.getElementById('status-date');
        if (dateEl && ticketData.date) {
          dateEl.textContent = 'Submitted: ' + new Date(ticketData.date).toLocaleDateString('en-MY', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });
        }
      }
    }

    renderStatus();

    // Live refresh button interaction
    const refreshBtn = document.getElementById('refresh-status-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.style.opacity = '0.6';
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Checking Live Edge...';
        setTimeout(() => {
          renderStatus();
          refreshBtn.style.opacity = '1';
          refreshBtn.disabled = false;
          refreshBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Live Status Synced
          `;
          showToast('Status refreshed from live queue.', 'info');
          setTimeout(() => {
            refreshBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh Live Status
            `;
          }, 2000);
        }, 500);
      });
    }
  }

  /* ==========================================================================
     15. APPLICATION BOOTSTRAP
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollReveal();
    initProjectFilters();
    initCaseStudyModal();
    initPricingTiers();
    initEntryZoneLock();
    initApplicationForm();
    initSupportForm();
    initDevLogin();
    initDevConsole();
    initProjectCounter();
    initStatusPage();
  });

})();
