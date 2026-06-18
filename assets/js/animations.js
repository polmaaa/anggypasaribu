/**
 * animations.js - Coordinates GSAP scroll-triggered effects, parallax, and numeric counters
 */

export function initAnimations() {
  // 1. Initialize AOS (Animate On Scroll) for standard entrance reveals
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }

  // Ensure GSAP and ScrollTrigger are loaded before running custom sequences
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger CDN is not loaded. Skipping complex animations.');
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // 2. Hero Section Load Sequence
  const heroTl = gsap.timeline();
  
  // Text reveal animation (lines sliding up)
  const revealElements = document.querySelectorAll('[data-reveal-text]');
  if (revealElements.length > 0) {
    heroTl.fromTo(revealElements, 
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 1.2, ease: 'power4.out', stagger: 0.2 }
    );
  }

  // Parallax scrolling effect on the hero background image
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    gsap.to(heroSection, {
      backgroundPositionY: '35%',
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // 3. About Section (The Two Sides) - Split Column Scroll Reveals
  const voiceSide = document.getElementById('about-voice-side');
  const gritSide = document.getElementById('about-grit-side');

  if (voiceSide) {
    gsap.fromTo(voiceSide,
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#about',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  if (gritSide) {
    gsap.fromTo(gritSide,
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#about',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // 4. Shows Section - Card Staggered Fade Up
  const showsGrid = document.getElementById('shows-grid-container');
  if (showsGrid) {
    ScrollTrigger.create({
      trigger: '#shows',
      start: 'top 75%',
      onEnter: () => {
        const cards = showsGrid.children;
        if (cards.length > 0) {
          gsap.fromTo(cards,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.15 }
          );
        }
      },
      once: true
    });
  }

  // 5. Dynamic Stats Counter Animation
  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    ScrollTrigger.create({
      trigger: statsSection,
      start: 'top 85%',
      onEnter: () => {
        animateStats();
      },
      once: true
    });
  }
}

/**
 * Counts up numbers dynamically from 0 to target value specified in the dataset
 */
function animateStats() {
  const stats = [
    { el: document.getElementById('stat-races-val') },
    { el: document.getElementById('stat-countries-val') },
    { el: document.getElementById('stat-hours-val') },
    { el: document.getElementById('stat-collabs-val') }
  ];

  stats.forEach(item => {
    if (!item.el) return;

    const targetVal = parseInt(item.el.getAttribute('data-target') || '0', 10);
    const countObj = { val: 0 };

    gsap.to(countObj, {
      val: targetVal,
      duration: 2.0,
      ease: 'power3.out',
      onUpdate: () => {
        item.el.textContent = Math.floor(countObj.val);
      }
    });
  });
}
