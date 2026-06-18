/**
 * loader.js - Manages page loading, smooth scrolling, custom cursors, and navigation transitions
 */

// Exported Lenis smooth scroll instance
export let lenis;

export function initScroll() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Quintic easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // RequestAnimationFrame loop for Lenis
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } else {
    console.warn('Lenis Smooth Scroll CDN is not loaded.');
  }

  // Scroll Progress Bar, Header Sticky and Back-to-Top triggers
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // 1. Scroll Progress Bar
    const progressEl = document.getElementById('scroll-progress');
    if (progressEl && scrollHeight > 0) {
      const percentage = (scrollTop / scrollHeight) * 100;
      progressEl.style.width = `${percentage}%`;
    }

    // 2. Header Style changes
    const header = document.getElementById('main-header');
    if (header) {
      if (scrollTop > 60) {
        header.classList.add('bg-black/90', 'shadow-xl', 'backdrop-blur-md');
        header.classList.remove('glass-nav');
      } else {
        header.classList.add('glass-nav');
        header.classList.remove('bg-black/90', 'shadow-xl', 'backdrop-blur-md');
      }
    }

    // 3. Back to Top visibility
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      if (scrollTop > 500) {
        backToTop.classList.add('active');
      } else {
        backToTop.classList.remove('active');
      }
    }
  });

  // Back to Top click action
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

export function initCursor() {
  const cursor = document.getElementById('js-cursor');
  const follower = document.getElementById('js-cursor-follower');

  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;     // Target coordinates
  let cursorX = 0, cursorY = 0;     // Current cursor dot coordinates
  let followerX = 0, followerY = 0; // Current follower ring coordinates

  // Update target mouse coordinates on movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Show cursor elements once active
    cursor.classList.remove('hidden');
    follower.classList.remove('hidden');
  });

  // Inertial follow animation loop
  const animateCursor = () => {
    // Fast follow (0.3 speed)
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;

    // Slow follow (0.1 speed) with trailing lag
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;

    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  // Global cursor hover scaling using delegation (supports dynamic items)
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, textarea, select, [role="button"]')) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, textarea, select, [role="button"]')) {
      document.body.classList.remove('cursor-hover');
    }
  });
}

export function initLoader(onComplete) {
  const loader = document.getElementById('loader');
  const counterEl = document.getElementById('loader-counter');
  const title1 = document.getElementById('loader-title-1');
  const title2 = document.getElementById('loader-title-2');

  if (!loader || !counterEl) {
    if (onComplete) onComplete();
    return;
  }

  // Slide heading lines upward on screen entrance
  setTimeout(() => {
    if (title1) title1.classList.remove('translate-y-full');
    if (title2) title2.classList.remove('translate-y-full');
  }, 100);

  let count = 0;
  const duration = 1500; // 1.5 seconds loading simulation
  const stepTime = 15;
  const steps = duration / stepTime;
  const stepVal = 100 / steps;

  const interval = setInterval(() => {
    count += stepVal;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);

      // Slide headings back down out of view
      setTimeout(() => {
        if (title1) title1.classList.add('-translate-y-full');
        if (title2) title2.classList.add('-translate-y-full');
      }, 200);

      // Fade out loading screen
      setTimeout(() => {
        loader.classList.add('opacity-0');
        setTimeout(() => {
          loader.classList.add('hidden');
          if (onComplete) onComplete();
        }, 700);
      }, 550);
    }
    counterEl.textContent = String(Math.floor(count)).padStart(2, '0');
  }, stepTime);
}

export function initMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const topBar = document.getElementById('hamburger-top');
  const midBar = document.getElementById('hamburger-mid');
  const botBar = document.getElementById('hamburger-bot');
  const links = document.querySelectorAll('.mobile-link');

  if (!btn || !menu) return;

  let isOpen = false;

  const toggleMenu = () => {
    isOpen = !isOpen;

    if (isOpen) {
      menu.classList.remove('pointer-events-none', 'opacity-0');
      menu.classList.add('opacity-100');
      menu.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');

      // Transform hamburger to close 'X'
      topBar.classList.add('rotate-45', 'translate-y-[8px]');
      midBar.classList.add('opacity-0');
      botBar.classList.add('-rotate-45', '-translate-y-[8px]');

      // Stop scrolling
      if (lenis) lenis.stop();
    } else {
      menu.classList.add('pointer-events-none', 'opacity-0');
      menu.classList.remove('opacity-100');
      menu.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');

      // Transform close 'X' to hamburger
      topBar.classList.remove('rotate-45', 'translate-y-[8px]');
      midBar.classList.remove('opacity-0');
      botBar.classList.remove('-rotate-45', '-translate-y-[8px]');

      // Start scrolling
      if (lenis) lenis.start();
    }
  };

  btn.addEventListener('click', toggleMenu);

  // Close menu and smooth-scroll on link clicks
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      toggleMenu();

      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        // Give menu fade-out some time before scrolling
        setTimeout(() => {
          if (lenis) {
            lenis.scrollTo(targetId);
          } else {
            const targetEl = document.querySelector(targetId);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    });
  });

  // Desktop navigation links smooth-scroll binding
  const navLinks = document.querySelectorAll('header nav a, header .glow-btn, a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      // Skip back-to-top button which has its own event listener
      if (link.id === 'back-to-top') return;

      if (targetId && targetId.startsWith('#') && targetId !== '#') {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetId);
        } else {
          const targetEl = document.querySelector(targetId);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}
