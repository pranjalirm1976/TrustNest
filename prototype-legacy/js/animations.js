/* ===== TRUSTNEST ANIMATIONS ===== */

// CSS Keyframes are usually in design-system.css, but we'll inject them or rely on them here.
// Add keyframes to document
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  .animate-fade-up {
    opacity: 0;
    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Trigger slightly before element comes into view
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class
        entry.target.classList.add('animate-fade-up');
        
        // Handle staggered children if it has data-stagger attribute
        if (entry.target.hasAttribute('data-stagger')) {
          const children = entry.target.querySelectorAll('.stagger-item');
          children.forEach((child, index) => {
            child.style.opacity = '0';
            child.style.animation = `fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.1}s`;
          });
        }
        
        // Unobserve after animating (one-time animation)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Find all elements to animate
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  elementsToAnimate.forEach(el => {
    el.style.opacity = '0'; // Hide initially
    scrollObserver.observe(el);
  });
});

// Animated Counter Utility
function animateCounter(el, target, duration = 2000, suffix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Easing function: easeOutExpo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    
    const currentVal = Math.floor(easeProgress * target);
    
    // Format number with commas
    el.textContent = currentVal.toLocaleString() + suffix;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Setup stat counters observer
document.addEventListener('DOMContentLoaded', () => {
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.stat-counter');
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const suffix = counter.getAttribute('data-suffix') || '';
          animateCounter(counter, target, 2000, suffix);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});

// Typewriter effect utility
class Typewriter {
  constructor(element, words, wait = 3000) {
    this.element = element;
    this.words = words;
    this.txt = '';
    this.wordIndex = 0;
    this.wait = parseInt(wait, 10);
    this.type();
    this.isDeleting = false;
  }

  type() {
    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.element.innerHTML = `<span class="txt">${this.txt}</span><span class="cursor">|</span>`;

    let typeSpeed = 100;
    if (this.isDeleting) typeSpeed /= 2;

    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.wait;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// Init Typewriter if element exists
document.addEventListener('DOMContentLoaded', () => {
  const typeElement = document.querySelector('.typewriter');
  if (typeElement) {
    const words = JSON.parse(typeElement.getAttribute('data-words'));
    const wait = typeElement.getAttribute('data-wait');
    new Typewriter(typeElement, words, wait);
  }
});
