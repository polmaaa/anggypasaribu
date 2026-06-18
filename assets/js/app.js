/**
 * app.js - Main entry point coordinate imports and bootstrap execution
 */

import { loadAllData } from './data-loader.js';
import { initScroll, initCursor, initLoader, initMobileNav } from './loader.js';
import { initAnimations } from './animations.js';
import { initContactForm } from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
  // Start the luxury loader screen simulation on load
  initLoader(async () => {
    // 1. Initialize core UX interactions once the loader disappears
    initScroll();
    initCursor();
    initMobileNav();
    initContactForm();

    // 2. Fetch and render JSON content layers (profile, shows, athlete timeline, services, socials)
    const success = await loadAllData();

    if (success) {
      // 3. Initialize GSAP timeline triggers & count-ups once elements are mounted
      initAnimations();
    } else {
      console.error('Core content load failed. Animations not loaded.');
    }
  });
});
