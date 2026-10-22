/**
 * ============================================================================
 * LQ BRANDING - CORE JAVASCRIPT CONTROLLER
 * Vanilla ES6+ • Zero External Libraries • Supabase REST Ready
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. SUPABASE CONFIGURATION
     Reemplaza con los datos de tu proyecto de Supabase (Settings > API)
     -------------------------------------------------------------------------- */
  const SUPABASE_CONFIG = {
    // Ejemplo: 'https://xyzcompany.supabase.co'
    url: 'YOUR_SUPABASE_URL',
    
    // Tu Public Anon Key (la clave pública segura para el frontend)
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    
    // Nombre exacto de la tabla creada en Supabase SQL Editor
    table: 'contact_leads'
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
  const pricingButtons = document.querySelectorAll('[data-project]');

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

    // Cerrar al hacer clic en cualquier enlace
    navLinks.forEach(link => {
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
     8. AUTO-SELECCIÓN DE PLAN DESDE LAS TARJETAS DE PRECIO
     -------------------------------------------------------------------------- */
  pricingButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedPlan = btn.getAttribute('data-project');
      const selectElement = document.getElementById('projectType');
      if (selectElement && selectedPlan) {
        selectElement.value = selectedPlan;
      }
    });
  });

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
  ['fullName', 'email', 'phone', 'projectType', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearFieldError(id));
      el.addEventListener('change', () => clearFieldError(id));
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Resetear estados
      formStatus.className = 'form-status';
      formStatus.textContent = '';

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const projectType = document.getElementById('projectType').value;
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

      if (!projectType) {
        showFieldError('projectType', 'Por favor selecciona el tipo de proyecto que necesitas.');
        hasErrors = true;
      } else {
        clearFieldError('projectType');
      }

      if (!message || message.length < 10) {
        showFieldError('message', 'Por favor describe brevemente tu requerimiento (mínimo 10 caracteres).');
        hasErrors = true;
      } else {
        clearFieldError('message');
      }

      if (hasErrors) return;

      // Activar estado de carga en el botón
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      const payload = {
        full_name: fullName,
        email: email,
        phone: phone,
        project_type: projectType,
        message: message,
        created_at: new Date().toISOString()
      };

      try {
        // Verificar si se han configurado las claves reales de Supabase
        const isSupabaseConfigured = 
          SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && 
          SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
          !SUPABASE_CONFIG.url.includes('YOUR_SUPABASE');

        if (!isSupabaseConfigured) {
          // MODO DE DEMOSTRACIÓN / LOCAL:
          // Simula una llamada asíncrona exitosa y muestra la instrucción clara al desarrollador
          await new Promise(resolve => setTimeout(resolve, 800));

          console.info('📋 [LQ Branding] Datos del Lead recibidos correctamente en modo local:', payload);

          formStatus.className = 'form-status success';
          formStatus.innerHTML = `
            <strong>¡Solicitud enviada con éxito!</strong><br>
            Gracias ${fullName}. Hemos recibido tu mensaje y te contactaremos en menos de 24 horas hábiles.
            <br><small style="color:#047857; margin-top:4px; display:inline-block;">(Nota de desarrollo: Para guardar en Supabase real, coloca tus claves en <code>app.js</code> siguiendo la guía).</small>
          `;
          contactForm.reset();
        } else {
          // LLAMADA REAL A SUPABASE REST API (vía Vanilla Fetch, sin librerías pesadas)
          const endpoint = `${SUPABASE_CONFIG.url.replace(/\/$/, '')}/rest/v1/${SUPABASE_CONFIG.table}`;

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_CONFIG.anonKey,
              'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error del servidor HTTP ${response.status}`);
          }

          // Éxito real en Supabase
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `
            <strong>¡Solicitud recibida exitosamente!</strong><br>
            Muchas gracias, ${fullName}. Nuestro equipo de arquitectura web revisará los requerimientos de tu proyecto y te contactará a la brevedad.
          `;
          contactForm.reset();
        }
      } catch (err) {
        console.error('Error al enviar formulario a Supabase:', err);
        formStatus.className = 'form-status error';
        formStatus.innerHTML = `
          <strong>No fue posible enviar tu mensaje en este momento.</strong><br>
          Por favor contáctanos directamente a nuestro correo <a href="mailto:contacto@lqbranding.com" style="text-decoration:underline; font-weight:600;">contacto@lqbranding.com</a> o por WhatsApp.
        `;
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }
});
