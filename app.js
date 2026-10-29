/**
 * ============================================================================
 * LQ BRANDING - CORE JAVASCRIPT CONTROLLER
 * Vanilla ES6+ • Zero External Libraries • Supabase REST Ready
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. CONFIGURACIÓN WHATSAPP (100% FRONTEND)
     Número oficial para recibir los mensajes de cotización
     -------------------------------------------------------------------------- */
  const WHATSAPP_CONFIG = {
    // Número con código de país (sin espacios ni símbolos, ej: '56900000000')
    phone: '56900000000'
  };

  /* --------------------------------------------------------------------------
     2. SELECTORES DE ELEMENTOS DEL DOM
     -------------------------------------------------------------------------- */
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');
  const currentYearSpan = document.getElementById('current-year');

  /* --------------------------------------------------------------------------
     3. AÑO DINÁMICO EN FOOTER
     -------------------------------------------------------------------------- */
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     4. HEADER SCROLL EFFECT
     Añade sombra y fondo sólido al hacer scroll
     -------------------------------------------------------------------------- */
  const handleHeaderScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Ejecución inicial

  /* --------------------------------------------------------------------------
     5. MENÚ MÓVIL (HAMBURGUESA) & NAVEGACIÓN
     -------------------------------------------------------------------------- */
  const toggleMobileMenu = () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Bloquear el scroll del cuerpo cuando el menú esté abierto
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', toggleMobileMenu);

    // Cerrar al hacer clic en cualquier enlace (incluyendo el botón de cotizar)
    const allNavAnchors = navMenu.querySelectorAll('a');
    allNavAnchors.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          closeMobileMenu();
        }
      });
    });

    // Cerrar si se hace clic fuera del menú
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. ACTIVE NAV LINK ON SCROLL (INTERSECTION OBSERVER)
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  
  if ('IntersectionObserver' in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (href === currentId) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  /* --------------------------------------------------------------------------
     7. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Animación ejecutada una sola vez
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback para navegadores antiguos sin soporte
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  /* --------------------------------------------------------------------------
     9. VALIDACIÓN Y ENVÍO DEL FORMULARIO (SUPABASE REST API)
     -------------------------------------------------------------------------- */
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    // Acepta formatos internacionales (+56 9..., 912345678, etc. al menos 8 dígitos)
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 8;
  };

  const showFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`error-${fieldId}`);
    if (field && errorSpan) {
      const parent = field.closest('.form-group');
      if (parent) parent.classList.add('has-error');
      errorSpan.textContent = message;
    }
  };

  const clearFieldError = (fieldId) => {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`error-${fieldId}`);
    if (field && errorSpan) {
      const parent = field.closest('.form-group');
      if (parent) parent.classList.remove('has-error');
      errorSpan.textContent = '';
    }
  };

  // Limpiar errores mientras el usuario escribe
  ['fullName', 'email', 'phone', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearFieldError(id));
      el.addEventListener('change', () => clearFieldError(id));
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Resetear estados
      formStatus.className = 'form-status';
      formStatus.textContent = '';

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();

      let hasErrors = false;

      // Validación de Campos
      if (!fullName || fullName.length < 3) {
        showFieldError('fullName', 'Por favor ingresa tu nombre completo (mínimo 3 letras).');
        hasErrors = true;
      } else {
        clearFieldError('fullName');
      }

      if (!email || !validateEmail(email)) {
        showFieldError('email', 'Por favor ingresa un correo electrónico válido.');
        hasErrors = true;
      } else {
        clearFieldError('email');
      }

      if (!phone || !validatePhone(phone)) {
        showFieldError('phone', 'Por favor ingresa un teléfono o WhatsApp de contacto válido.');
        hasErrors = true;
      } else {
        clearFieldError('phone');
      }

      if (!message || message.length < 5) {
        showFieldError('message', 'Por favor describe brevemente tu requerimiento o consulta.');
        hasErrors = true;
      } else {
        clearFieldError('message');
      }

      if (hasErrors) return;

      // Construcción del mensaje formateado para WhatsApp
      const whatsappText = `*Solicitud de Cotización - LQ Branding*

*Nombre:* ${fullName}
*Email:* ${email}
*Teléfono:* ${phone}

*Mensaje:*
${message}`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phone}?text=${encodeURIComponent(whatsappText)}`;

      // Notificación de éxito en pantalla
      formStatus.className = 'form-status success';
      formStatus.innerHTML = `
        <strong>¡Datos validados con éxito!</strong><br>
        Abriendo WhatsApp para enviar tu mensaje directamente...
      `;

      // Abrir WhatsApp en una nueva pestaña
      window.open(whatsappUrl, '_blank');

      // Limpiar formulario tras abrir
      contactForm.reset();
    });
  }
});
