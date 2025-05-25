// GSAP utilities for animations
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

export function initializeParallax(container: HTMLElement) {
  if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    
    // Parallax background effect
    const parallaxBg = container.querySelector('.parallax-layer');
    if (parallaxBg) {
      window.gsap.to(parallaxBg, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }
  }
}

export function animateFormElements() {
  if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger) {
    window.gsap.from(".form-group", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: "#trip-form",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  }
}

export function animateDeals() {
  if (typeof window !== 'undefined' && window.gsap) {
    window.gsap.from('.deal-card', {
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2
    });
  }
}

export function initializeGSAP() {
  if (typeof window !== 'undefined') {
    // Load GSAP and ScrollTrigger from CDN
    const gsapScript = document.createElement('script');
    gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    gsapScript.onload = () => {
      const scrollTriggerScript = document.createElement('script');
      scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      document.head.appendChild(scrollTriggerScript);
    };
    document.head.appendChild(gsapScript);
  }
}
