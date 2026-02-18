document.addEventListener('DOMContentLoaded', () => {
    const myNav = document.getElementById("myNav");
    const hamburger = document.getElementById("hamburger");

    function openNav() {
        if (myNav) myNav.style.width = "100%";
    }

    function closeNav() {
        if (myNav) myNav.style.width = "0%";
    }

    // Navigation event listeners
    if (hamburger) {
        hamburger.addEventListener('click', openNav);
    }

    // Use delegation for close button and links inside overlay to close navigation
    if (myNav) {
        myNav.addEventListener('click', (e) => {
            const target = e.target;
            // Close if clicking the close button or any link inside the overlay
            if (target.classList.contains('closebtn') || target.closest('a')) {
                closeNav();
            }
        });
    }

    // Smooth scrolling for anchor links using event delegation
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const targetElement = document.getElementById(targetId.substring(1));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });

    // Simple animation on scroll using IntersectionObserver
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
                // Optimization: stop observing once visible to save CPU/memory
                observer.unobserve(entry.target);
            }
        }
    }, observerOptions);

    // Observe service cards, product cards, and team members
    const elementsToObserve = document.querySelectorAll('.service-card, .product-card, .team-member');
    for (const el of elementsToObserve) {
        el.classList.add('scroll-hidden');
        observer.observe(el);
    }
});
