/* ===== TRUSTNEST APP SHARED LOGIC ===== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initMobileMenu();
  initFavorites();
});

// --- Theme Management (Dark/Light Mode) ---
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Check for saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon('light');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  if (theme === 'dark') {
    // Sun icon for dark mode (click to switch to light)
    themeToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  } else {
    // Moon icon for light mode (click to switch to dark)
    themeToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
  }
}

// --- Navbar Scroll Behavior ---
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollTop = 0;
  
  window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow when scrolled
    if (scrollTop > 20) {
      navbar.classList.add('glass');
      navbar.style.background = 'var(--glass-bg)';
    } else {
      navbar.classList.remove('glass');
      navbar.style.background = 'transparent';
    }

    // Hide navbar on scroll down, show on scroll up
    if (scrollTop > lastScrollTop && scrollTop > 80) {
      // Scrolling down
      navbar.classList.add('hidden');
    } else {
      // Scrolling up
      navbar.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
  }, { passive: true });
}

// --- Mobile Menu Toggle ---
function initMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    // Transform hamburger icon to X (optional enhancement)
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// --- Save/Favorite Functionality ---
function initFavorites() {
  const favButtons = document.querySelectorAll('.pg-card-favorite');
  
  favButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent link navigation if inside a link
      e.stopPropagation();
      
      btn.classList.toggle('active');
      
      // Show toast notification
      const isSaved = btn.classList.contains('active');
      showToast(isSaved ? 'PG saved to favorites' : 'Removed from favorites', isSaved ? 'success' : 'info');
    });
  });
}

// --- Toast Notification System ---
function showToast(message, type = 'info') {
  // Check if toast container exists, create if not
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    Object.assign(toastContainer.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    });
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  
  // Colors based on type
  const bgColors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    info: 'var(--secondary)'
  };

  Object.assign(toast.style, {
    background: bgColors[type] || bgColors.info,
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-md)',
    fontWeight: '600',
    fontSize: '14px',
    transform: 'translateY(100px)',
    opacity: '0',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  // Icon based on type
  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;
  
  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
