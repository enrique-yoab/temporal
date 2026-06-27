document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. AÑO DINÁMICO EN EL FOOTER
    // ==========================================
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ==========================================
    // 2. CANVAS — Partículas flotantes
    // ==========================================
    const canvas = document.getElementById('headerCanvas');
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {

        const PARTICLE_COUNT = 50;
        const CONNECTION_DIST = 120;

        const COLORS = [
            { r: 76,  g: 175, b: 114 },
            { r: 109, g: 217, b: 138 },
            { r: 160, g: 120, b: 90  },
        ];

        let particles = [];
        let animId;

        const createParticle = () => {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            return {
                x:      Math.random() * canvas.width,
                y:      Math.random() * canvas.height,
                vx:     (Math.random() - 0.5) * 0.3,
                vy:     (Math.random() - 0.5) * 0.25,
                radius: Math.random() * 1.8 + 0.5,
                alpha:  Math.random() * 0.55 + 0.2,
                color,
            };
        };

        const resizeCanvas = () => {
            const header = canvas.parentElement;
            canvas.width  = header.offsetWidth;
            canvas.height = header.offsetHeight;
        };

        const init = () => {
            resizeCanvas();
            particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx   = a.x - b.x;
                    const dy   = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DIST) {
                        const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.2;
                        const cr = Math.round((a.color.r + b.color.r) / 2);
                        const cg = Math.round((a.color.g + b.color.g) / 2);
                        const cb = Math.round((a.color.b + b.color.b) / 2);
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${lineAlpha})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }

            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${p.alpha})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };

        const resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(animId);
            init();
            draw();
        });
        resizeObserver.observe(canvas.parentElement);

        init();
        draw();
    }


    // ==========================================
    // 3. FILTRADO DE CATEGORÍAS
    // ==========================================
    const categoryBtns = document.querySelectorAll('.category-btn');
    const products      = document.querySelectorAll('.product-card');
    const countEl       = document.getElementById('catalogCount');
    const emptyState    = document.getElementById('emptyState');
    const productGrid   = document.getElementById('productGrid');

    const updateCount = (n) => {
        if (!countEl) return;
        countEl.textContent = n === 1 ? '1 producto' : `${n} productos`;
    };

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {

            categoryBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const target = btn.getAttribute('data-target');
            let count = 0;

            products.forEach(card => {
                const match = target === 'todos' || card.getAttribute('data-category') === target;

                if (match) {
                    card.style.display = 'flex';
                    card.style.opacity   = '0';
                    card.style.transform = 'translateY(10px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity 240ms ease, transform 240ms ease';
                        card.style.opacity    = '1';
                        card.style.transform  = 'translateY(0)';
                    });
                    count++;
                } else {
                    card.style.display = 'none';
                }
            });

            updateCount(count);

            if (emptyState) emptyState.hidden = count > 0;
            if (productGrid) productGrid.hidden = count === 0;
        });
    });

    updateCount(products.length);

    // ==========================================
    // 4. LÓGICA DE LA VENTANA EMERGENTE (MODAL)
    // ==========================================
    const modal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModal');
    const detailBtns = document.querySelectorAll('.btn-details');

    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalPrice = document.getElementById('modalPrice');
    const modalWaBtn = document.getElementById('modalWaBtn');

    const openModal = () => {
        modal.classList.add('active');
        document.body.classList.add('modal-open'); 
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    };

    detailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const card = btn.closest('.product-card');

            const title = card.querySelector('.product-title').textContent;
            const desc = card.querySelector('.product-desc').textContent;
            const price = card.querySelector('.product-price').textContent;
            const imgSrc = card.querySelector('.product-img').src;
            const waLink = btn.getAttribute('data-wa');

            modalTitle.textContent = title;
            modalDesc.textContent = desc; 
            modalPrice.textContent = price;
            modalImg.src = imgSrc;
            modalImg.alt = title;
            modalWaBtn.href = waLink;

            openModal();
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

});