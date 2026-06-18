/**
 * data-loader.js - Dynamically fetches data from JSON and updates the DOM
 */

export async function loadAllData() {
  try {
    // Parallel fetching of all database layers
    const [profileRes, showsRes, athleteRes, servicesRes, socialsRes] = await Promise.all([
      fetch('assets/data/profile.json'),
      fetch('assets/data/shows.json'),
      fetch('assets/data/athlete.json'),
      fetch('assets/data/services.json'),
      fetch('assets/data/socials.json')
    ]);

    const profileData = await profileRes.json();
    const showsData = await showsRes.json();
    const athleteData = await athleteRes.json();
    const servicesData = await servicesRes.json();
    const socialsData = await socialsRes.json();

    // 1. Bind Profile Data
    bindProfile(profileData);

    // 2. Bind Shows Data
    bindShows(showsData);

    // 3. Bind Athlete Data & Stats Calculations
    bindAthlete(athleteData);

    // 4. Bind Services Data
    bindServices(servicesData);

    // 5. Bind Social Links
    bindSocials(socialsData);

    // Trigger Lucide to parse dynamically added icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    return true;
  } catch (error) {
    console.error('Error loading data sources:', error);
    return false;
  }
}

function bindProfile(profile) {
  // Description in Hero
  const heroDesc = document.getElementById('hero-desc');
  if (heroDesc) {
    heroDesc.textContent = profile.heroDescription;
  }

  // Voice About Side
  const voiceTitle = document.getElementById('about-voice-title');
  const voiceText = document.getElementById('about-voice-text');
  if (voiceTitle && voiceText && profile.about.voice) {
    voiceTitle.textContent = profile.about.voice.title;
    voiceText.innerHTML = profile.about.voice.paragraphs
      .map(p => `<p class="mb-4">${p}</p>`)
      .join('');
  }

  // Grit About Side
  const gritTitle = document.getElementById('about-grit-title');
  const gritText = document.getElementById('about-grit-text');
  if (gritTitle && gritText && profile.about.grit) {
    gritTitle.textContent = profile.about.grit.title;
    gritText.innerHTML = profile.about.grit.paragraphs
      .map(p => `<p class="mb-4">${p}</p>`)
      .join('');
  }
}

function bindShows(shows) {
  const container = document.getElementById('shows-grid-container');
  const toggleBtn = document.getElementById('btn-toggle-shows');
  const toggleText = document.getElementById('btn-toggle-text');
  const toggleIcon = document.getElementById('btn-toggle-icon');
  
  if (!container) return;

  let isExpanded = false;
  const initialCount = 4;

  // Video Lightbox Modal elements
  const videoModal = document.getElementById('video-modal');
  const videoModalContainer = document.getElementById('video-modal-container');
  const videoIframe = document.getElementById('video-iframe');
  const closeVideoBtn = document.getElementById('close-video-modal');
  const videoBackdrop = document.getElementById('video-modal-backdrop');

  // Video Lightbox Modal Control functions
  function openVideoModal(videoId) {
    if (!videoModal || !videoIframe) return;
    videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    
    // Animate Modal Fade In
    videoModal.classList.remove('opacity-0', 'pointer-events-none');
    videoModal.classList.add('opacity-100', 'pointer-events-auto');
    if (videoModalContainer) {
      videoModalContainer.classList.remove('scale-95');
      videoModalContainer.classList.add('scale-100');
    }
    
    // Stop Lenis smooth scroll if active
    if (window.lenis) {
      window.lenis.stop();
    } else {
      document.body.style.overflow = 'hidden';
    }
  }

  function closeVideoModal() {
    if (!videoModal || !videoIframe) return;
    videoIframe.src = '';
    
    // Animate Modal Fade Out
    videoModal.classList.remove('opacity-100', 'pointer-events-auto');
    videoModal.classList.add('opacity-0', 'pointer-events-none');
    if (videoModalContainer) {
      videoModalContainer.classList.remove('scale-100');
      videoModalContainer.classList.add('scale-95');
    }
    
    // Restart Lenis smooth scroll if active
    if (window.lenis) {
      window.lenis.start();
    } else {
      document.body.style.overflow = '';
    }
  }

  // Bind Close Events
  if (closeVideoBtn) closeVideoBtn.addEventListener('click', closeVideoModal);
  if (videoBackdrop) videoBackdrop.addEventListener('click', closeVideoModal);

  // Esc key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
  });

  function render(animNew = false) {
    container.innerHTML = '';
    const visibleShows = isExpanded ? shows : shows.slice(0, initialCount);

    visibleShows.forEach((show) => {
      const showCard = document.createElement('div');
      showCard.className = 'flex flex-col bg-luxuryBg border border-white/5 rounded-sm p-4 hover:border-luxuryAccent/40 transition-all duration-500 group';
      
      const isYoutube = show.type === 'youtube';
      const buttonText = isYoutube ? 'Watch Show' : 'View Post';
      const iconName = isYoutube ? 'play' : 'external-link';
      
      showCard.innerHTML = `
        <div class="image-zoom-container rounded-sm overflow-hidden aspect-[16/10] mb-6">
          <img src="${show.thumbnail}" alt="${show.title} Thumbnail" class="w-full h-full object-cover">
        </div>
        <span class="font-display text-xs text-luxuryAccent uppercase tracking-widest block mb-2">${show.category}</span>
        <h3 class="font-serif text-lg md:text-xl text-white mb-3 line-clamp-2 min-h-[56px]">${show.title}</h3>
        <p class="text-xs md:text-sm text-luxurySecondary leading-relaxed mb-6 line-clamp-3">${show.description}</p>
        
        ${isYoutube ? 
          `<button data-video-id="${show.videoId}" class="mt-auto px-6 py-3 bg-luxurySurface border border-white/5 text-white hover:border-luxuryAccent text-xs font-display tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-luxuryAccent group-hover:text-black btn-watch-show">
            ${buttonText}
            <i data-lucide="${iconName}" class="w-3.5 h-3.5"></i>
          </button>` :
          `<a href="${show.url}" target="_blank" rel="noopener noreferrer" class="mt-auto px-6 py-3 bg-luxurySurface border border-white/5 text-white hover:border-luxuryAccent text-xs font-display tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-luxuryAccent group-hover:text-black">
            ${buttonText}
            <i data-lucide="${iconName}" class="w-3.5 h-3.5"></i>
          </a>`
        }
      `;
      container.appendChild(showCard);
    });

    // Update Lucide Icons for dynamic content
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Add triggers for Video Modal to WATCH SHOW buttons
    const watchButtons = container.querySelectorAll('.btn-watch-show');
    watchButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const videoId = btn.getAttribute('data-video-id');
        openVideoModal(videoId);
      });
    });

    // GSAP Stagger Fade In for newly added items
    if (animNew && isExpanded && window.gsap) {
      const addedCards = Array.from(container.children).slice(initialCount);
      if (addedCards.length > 0) {
        window.gsap.fromTo(addedCards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
        );
      }
    }
  }

  // Initial render
  render();

  // Load More Button Action
  if (toggleBtn) {
    // Show/hide Load More button depending on total list length
    if (shows.length <= initialCount) {
      toggleBtn.classList.add('hidden');
    } else {
      toggleBtn.classList.remove('hidden');
    }

    toggleBtn.addEventListener('click', () => {
      isExpanded = !isExpanded;
      if (isExpanded) {
        if (toggleText) toggleText.textContent = 'Sembunyikan';
        if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-up');
        render(true);
      } else {
        if (toggleText) toggleText.textContent = 'Selengkapnya';
        if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-down');
        render(false);
        // Scroll back to the top of shows section smoothly
        const section = document.getElementById('shows');
        if (section) {
          if (window.lenis) {
            window.lenis.scrollTo(section, { offset: -50, duration: 1 });
          } else {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }
}

function bindAthlete(athlete) {
  // Philosophy
  const philosophy = document.getElementById('athlete-philosophy');
  if (philosophy) {
    philosophy.textContent = `"${athlete.philosophy}"`;
  }

  // Calculate stats dynamically from events history
  const raceCount = athlete.events.length;
  
  const uniqueCountries = new Set();
  athlete.events.forEach(e => {
    if (e.country) uniqueCountries.add(e.country.trim());
  });
  const countryCount = uniqueCountries.size;

  // Set targets for the counter animation scripts
  const racesVal = document.getElementById('stat-races-val');
  if (racesVal) {
    racesVal.setAttribute('data-target', raceCount);
  }

  const countriesVal = document.getElementById('stat-countries-val');
  if (countriesVal) {
    countriesVal.setAttribute('data-target', countryCount);
  }

  const hoursVal = document.getElementById('stat-hours-val');
  if (hoursVal) {
    hoursVal.setAttribute('data-target', athlete.trainingHours);
  }

  const collabsVal = document.getElementById('stat-collabs-val');
  if (collabsVal) {
    collabsVal.setAttribute('data-target', athlete.collaborations);
  }

  // Populate events list timeline
  const timeline = document.getElementById('athlete-events-timeline');
  if (timeline) {
    timeline.innerHTML = '';
    athlete.events.forEach(item => {
      const node = document.createElement('div');
      node.className = 'relative pl-6 pb-2 transition-all duration-500';
      node.innerHTML = `
        <div class="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-luxuryAccent border border-luxuryBg ring-4 ring-luxuryAccent/15"></div>
        <span class="font-display text-xs text-luxuryAccent font-medium block">${item.year} • ${item.country}</span>
        <h4 class="font-serif text-lg text-white mt-1">${item.event}</h4>
      `;
      timeline.appendChild(node);
    });
  }
}

function bindServices(services) {
  const container = document.getElementById('services-grid-container');
  if (!container) return;

  container.innerHTML = '';

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'flex flex-col bg-luxuryBg border border-white/5 rounded-sm p-8 hover:border-luxuryAccent/30 hover:shadow-[0_10px_30px_rgba(229,192,123,0.03)] transition-all duration-500 group';
    card.innerHTML = `
      <div class="w-12 h-12 rounded-full border border-luxuryAccent/45 flex items-center justify-center text-luxuryAccent mb-6 group-hover:bg-luxuryAccent group-hover:text-black transition-all duration-500">
        <i data-lucide="${service.icon}" class="w-5 h-5"></i>
      </div>
      <h3 class="font-serif text-2xl text-white mb-4">${service.title}</h3>
      <p class="text-sm text-luxurySecondary leading-relaxed">${service.description}</p>
    `;
    container.appendChild(card);
  });
}

function bindSocials(socials) {
  const mobileContainer = document.getElementById('mobile-socials-container');
  const contactContainer = document.getElementById('contact-socials-container');

  if (mobileContainer) {
    mobileContainer.innerHTML = '';
    socials.forEach(soc => {
      mobileContainer.innerHTML += `
        <a href="${soc.url}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-sm bg-luxurySurface hover:bg-luxuryAccent hover:text-black border border-white/5 flex items-center justify-center text-luxurySecondary transition-all duration-300" aria-label="${soc.platform}">
          <i data-lucide="${soc.icon}" class="w-5 h-5"></i>
        </a>
      `;
    });
  }

  if (contactContainer) {
    contactContainer.innerHTML = '';
    socials.forEach(soc => {
      contactContainer.innerHTML += `
        <a href="${soc.url}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-sm bg-luxurySurface hover:bg-luxuryAccent hover:text-black border border-white/5 flex items-center justify-center text-luxurySecondary transition-all duration-300" aria-label="${soc.platform}" title="${soc.platform}">
          <i data-lucide="${soc.icon}" class="w-5 h-5"></i>
        </a>
      `;
    });
  }
}
