/**
 * Club Deportivo Victoria - Funcionalidad & Meta Pixel Tracking
 * Manejo de navegación móvil, visores interactivos y eventos de conversión
 */

// ==========================================================================
// 1. Helper de Meta Pixel (Facebook Ads)
// ==========================================================================
function trackMetaEvent(eventName, params = {}) {
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, params);
      console.log(`[Meta Pixel Event]: ${eventName}`, params);
    } else {
      console.log(`[Meta Pixel (Simulado - falta colocar Pixel ID)]: ${eventName}`, params);
    }
  } catch (error) {
    console.warn('[Meta Pixel Error]:', error);
  }
}

function trackMetaCustomEvent(eventName, params = {}) {
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, params);
      console.log(`[Meta Pixel Custom]: ${eventName}`, params);
    } else {
      console.log(`[Meta Pixel Custom (Simulado)]: ${eventName}`, params);
    }
  } catch (error) {
    console.warn('[Meta Pixel Custom Error]:', error);
  }
}

// ==========================================================================
// 2. Inicialización cuando el DOM esté listo
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileDrawer();
  initLightbox();
  initConversionTracking();
  initContactForm();
});

// Header con efecto al hacer Scroll
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Menú Móvil (Drawer & Backdrop)
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.mobile-nav-links a, .mobile-drawer .btn');

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    const isActive = drawer.classList.contains('active');
    isActive ? closeDrawer() : openDrawer();
  });

  backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

// Visor Emergente (Lightbox) para Galería de Instalaciones y Espacios
function initLightbox() {
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.querySelector('.lightbox-close');
  const interactiveCards = document.querySelectorAll('.facility-card, .space-gallery');

  if (!lightbox || !lightboxImg || !closeBtn) return;

  interactiveCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const tag = card.querySelector('.facility-tag')?.innerText || card.closest('.space-item')?.querySelector('h3')?.innerText || 'Instalación';
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Espacio Club Deportivo Victoria';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Disparar evento de visualización en Meta Pixel
        trackMetaEvent('ViewContent', {
          content_name: tag,
          content_category: 'Instalaciones y Espacios CDV'
        });
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// Seguimiento de Clics de Conversión (WhatsApp, Llamadas, Cotizadores de Eventos y Membresías)
function initConversionTracking() {
  // Clics a WhatsApp
  const whatsappButtons = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"], .btn-whatsapp, .whatsapp-float');
  whatsappButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      trackMetaEvent('Contact', {
        channel: 'WhatsApp',
        location: btn.dataset.location || 'General'
      });
    });
  });

  // Clics a Llamadas
  const telButtons = document.querySelectorAll('a[href^="tel:"]');
  telButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      trackMetaEvent('Contact', {
        channel: 'Llamada Telefónica'
      });
    });
  });

  // Clics a Membresías
  const membershipBtns = document.querySelectorAll('.membership-card .btn');
  membershipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const planName = btn.closest('.membership-card')?.querySelector('h3')?.innerText || 'Plan General';
      trackMetaCustomEvent('SelectMembershipPlan', {
        plan: planName
      });
    });
  });

  // Clics a Cotización de Salones y Espacios
  const spaceBtns = document.querySelectorAll('.space-details .btn');
  spaceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const spaceName = btn.closest('.space-details')?.querySelector('h3')?.innerText || 'Espacio General';
      trackMetaCustomEvent('CotizarEspacioEvento', {
        space: spaceName
      });
      // Pre-seleccionar opción en el formulario si existe
      const formInterest = document.getElementById('formInterest');
      if (formInterest) {
        formInterest.value = 'Cotización de Evento Social';
      }
    });
  });
}

// Manejo del Formulario de Prospección (Conexión con Meta Pixel Lead & WhatsApp)
function initContactForm() {
  const form = document.getElementById('cdvContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName')?.value.trim();
    const phone = document.getElementById('formPhone')?.value.trim();
    const email = document.getElementById('formEmail')?.value.trim();
    const interest = document.getElementById('formInterest')?.value;
    const message = document.getElementById('formMessage')?.value.trim();

    if (!name || !phone) {
      alert('Por favor completa los campos obligatorios (Nombre y Teléfono).');
      return;
    }

    // 1. Disparar Evento Lead en Meta Pixel
    trackMetaEvent('Lead', {
      content_name: interest || 'Información General',
      currency: 'MXN',
      value: 0.00
    });

    // 2. Construir mensaje prellenado para WhatsApp (Club Deportivo Victoria)
    const clubPhone = '528341234567'; // Reemplazar con el número de WhatsApp oficial del club (ej. 52 + 10 dígitos)
    const textMessage = `*Nueva Solicitud de Información - Club Deportivo Victoria*%0A%0A` +
      `👤 *Nombre:* ${encodeURIComponent(name)}%0A` +
      `📱 *Teléfono:* ${encodeURIComponent(phone)}%0A` +
      `✉️ *Correo:* ${encodeURIComponent(email || 'No proporcionado')}%0A` +
      `🎯 *Interés:* ${encodeURIComponent(interest)}%0A` +
      `💬 *Mensaje:* ${encodeURIComponent(message || 'Solicito informes y cotización.')}`;

    const waUrl = `https://wa.me/${clubPhone}?text=${textMessage}`;

    // 3. Confirmación visual y redirección a WhatsApp
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '✓ ¡Enviando a WhatsApp...! Redirigiendo...';
    submitBtn.style.background = 'var(--color-whatsapp)';
    submitBtn.disabled = true;

    setTimeout(() => {
      window.open(waUrl, '_blank');
      form.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 800);
  });
}
