document.addEventListener('DOMContentLoaded', () => {
    // 1. DARK MODE
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '🌙' : '☀️';
        trackEvent('ui', 'theme_change', isDark ? 'light' : 'dark');
    });

    // 2. HEADER SCROLL
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 3. MOBILE MENU
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('active'));
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('active'));
    });

    // 4. UTM TRACKING & WHATSAPP LOGIC
    const urlParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
        if (urlParams.has(param)) localStorage.setItem(param, urlParams.get(param));
    });

    function getWhatsAppLink(customMessage = '') {
        const source = localStorage.getItem('utm_source') || 'site orgânico';
        const baseMessage = customMessage || `Olá! Vim pelo ${source} e gostaria de saber mais sobre as peças da Nuvah.`;
        return `https://wa.me/5511960642385?text=${encodeURIComponent(baseMessage)}`;
    }

    // 5. WIDGET DE CHAT DO WHATSAPP
    const chatBox = document.getElementById('whatsapp-chat-box');
    const triggerBtn = document.getElementById('whatsapp-trigger-btn');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const openChatBtns = document.querySelectorAll('.open-chat-btn');

    function toggleChat(show) {
        chatBox.classList.toggle('active', show);
        if (show) {
            setTimeout(() => chatInput.focus(), 300);
            trackEvent('engagement', 'whatsapp_chat_open', 'widget');
        }
    }

    triggerBtn.addEventListener('click', () => toggleChat(!chatBox.classList.contains('active')));
    closeBtn.addEventListener('click', () => toggleChat(false));
    openChatBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleChat(true);
    }));

    function sendWhatsAppMessage() {
        const userText = chatInput.value.trim();
        if (!userText) return;
        
        const source = localStorage.getItem('utm_source') || 'site orgânico';
        const finalMessage = `${userText}\n\n(Origem: ${source})`;
        
        window.open(getWhatsAppLink(finalMessage), '_blank');
        chatInput.value = '';
        toggleChat(false);
        trackEvent('conversion', 'whatsapp_chat_send', 'widget');
    }

    sendBtn.addEventListener('click', sendWhatsAppMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendWhatsAppMessage();
    });

    // 6. FAQ ACCORDION
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-content').style.maxHeight = null;
            });
            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.accordion-content');
                content.style.maxHeight = content.scrollHeight + "px";
                trackEvent('engagement', 'faq_open', 'accordion');
            }
        });
    });

    // 7. FORMULÁRIO INTELIGENTE
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const waRedirectBtn = document.getElementById('whatsapp-redirect-btn');

    contactForm.querySelectorAll('input, textarea').forEach(input => {
        const saved = localStorage.getItem(`draft_${input.name}`);
        if (saved) input.value = saved;
        input.addEventListener('input', (e) => localStorage.setItem(`draft_${e.target.name}`, e.target.value));
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        const source = localStorage.getItem('utm_source') || 'site orgânico';
        
        contactForm.querySelectorAll('input, textarea').forEach(input => localStorage.removeItem(`draft_${input.name}`));
        
        const finalMessage = `Olá, meu nome é ${name}. E-mail: ${email}. Mensagem: ${message}. (Vim pelo: ${source})`;
        waRedirectBtn.href = getWhatsAppLink(finalMessage);
        successModal.classList.remove('hidden');
        trackEvent('conversion', 'form_submit', 'contact_form');
    });

    document.querySelector('.close-modal').addEventListener('click', () => successModal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === successModal) successModal.classList.add('hidden'); });

    // 8. COOKIE BANNER
    const cookieBanner = document.getElementById('cookie-banner');
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => cookieBanner.classList.remove('hidden'), 2000);
    }
    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.add('hidden');
        trackEvent('compliance', 'cookies_accepted', 'lgpd_banner');
    });

    // 9. TRACKING FUNCTION
    window.trackEvent = function(category, action, label) {
        if (localStorage.getItem('cookiesAccepted') === 'true') {
            // gtag('event', action, { 'event_category': category, 'event_label': label });
            // fbq('trackCustom', action, { category: category, label: label });
            console.log(`[TRACKING] ${category} | ${action} | ${label}`);
        }
    };
});