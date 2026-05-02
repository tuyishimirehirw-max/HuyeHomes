/**
 * Huye Homes - Main scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            
            // Toggle hamburger animation
            const spans = mobileBtn.querySelectorAll('span');
            if (mobileMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 2. Sticky Header shadow on scroll
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 3. Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const statusDiv = document.getElementById('contact-status');
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            
            // Get form data
            const propertySelect = document.getElementById('contact-property');
            const selectedProperty = propertySelect.options[propertySelect.selectedIndex];
            
            const formData = {
                propertyId: propertySelect.value || null,
                propertyTitle: propertySelect.value ? selectedProperty.text : 'General Inquiry',
                name: document.getElementById('contact-name').value.trim(),
                email: document.getElementById('contact-email').value.trim(),
                phone: document.getElementById('contact-phone').value.trim(),
                message: document.getElementById('contact-message').value.trim()
            };
            
            // Basic validation
            if (!formData.name || !formData.email || !formData.phone || !formData.message) {
                statusDiv.className = 'text-sm text-center text-red-600';
                statusDiv.textContent = 'Please fill in all fields';
                statusDiv.classList.remove('hidden');
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Sending...';
            
            try {
                const response = await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    statusDiv.className = 'text-sm text-center text-green-600';
                    statusDiv.textContent = 'Message sent successfully! We\'ll get back to you soon.';
                    contactForm.reset();
                } else {
                    statusDiv.className = 'text-sm text-center text-red-600';
                    statusDiv.textContent = data.message || 'Failed to send message. Please try again.';
                }
            } catch (error) {
                statusDiv.className = 'text-sm text-center text-red-600';
                statusDiv.textContent = 'Network error. Please check your connection and try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
                statusDiv.classList.remove('hidden');
            }
        });
    }

    // 4. Handle inquiry form submission
    const inquiryForm = document.getElementById('inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const statusDiv = document.getElementById('inquiry-status');
            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            
            // Get form data
            const formData = {
                propertyId: document.getElementById('property-id').value,
                propertyTitle: document.getElementById('property-title').value,
                name: document.getElementById('inquiry-name').value.trim(),
                email: document.getElementById('inquiry-email').value.trim(),
                phone: document.getElementById('inquiry-phone').value.trim(),
                message: document.getElementById('inquiry-message').value.trim()
            };
            
            // Basic validation
            if (!formData.name || !formData.email || !formData.phone || !formData.message) {
                statusDiv.className = 'text-sm text-center text-red-600';
                statusDiv.textContent = 'Please fill in all fields';
                statusDiv.classList.remove('hidden');
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Sending...';
            
            try {
                const response = await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    statusDiv.className = 'text-sm text-center text-green-600';
                    statusDiv.textContent = 'Inquiry sent successfully! We\'ll get back to you soon.';
                    inquiryForm.reset();
                } else {
                    statusDiv.className = 'text-sm text-center text-red-600';
                    statusDiv.textContent = data.message || 'Failed to send inquiry. Please try again.';
                }
            } catch (error) {
                statusDiv.className = 'text-sm text-center text-red-600';
                statusDiv.textContent = 'Network error. Please check your connection and try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i> Send Inquiry';
                statusDiv.classList.remove('hidden');
            }
        });
    }

    // 5. WhatsApp floating button functionality (Analytics or dynamic linking if needed)
    // Dynamic property WhatsApp linking is handled inline in the HTML href where needed.
});
