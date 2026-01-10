document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const serverCards = document.querySelectorAll('.server-card');
    
    const layerMilitary = document.createElement('div');
    layerMilitary.className = 'bg-layer';
    layerMilitary.style.backgroundImage = "url('military.png')";
    document.body.appendChild(layerMilitary);

    const layerLife = document.createElement('div');
    layerLife.className = 'bg-layer';
    layerLife.style.backgroundImage = "url('life.png')";
    document.body.appendChild(layerLife);

    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            revealSite();
            fetchPlayerCounts();
            setInterval(fetchPlayerCounts, 2000);
        }, 800);
    }, 2000); 

    function revealSite() {
        const items = [
            { el: 'header', delay: 0 },
            { el: '.subtitle', delay: 200 },
            { el: '.main-title', delay: 400 },
            { el: '.hero-line', delay: 600 },
            { el: '#servers', delay: 800 }
        ];

        items.forEach(item => {
            const element = document.querySelector(item.el);
            if(element) {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    element.style.transition = 'all 1s cubic-bezier(0.2, 1, 0.3, 1)';
                }, item.delay);
            }
        });

        initScrollReveal();
        initProximityEffect();
    }

    function initProximityEffect() {
        window.addEventListener('mousemove', (e) => {
            let closestCard = null;
            let minDistance = Infinity;

            serverCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const cardCenterX = rect.left + rect.width / 2;
                const cardCenterY = rect.top + rect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(e.clientX - cardCenterX, 2) + 
                    Math.pow(e.clientY - cardCenterY, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            });

            if (minDistance < 500) {
                const isMilitary = closestCard.getAttribute('data-bg') === 'military.png';
                
                layerMilitary.classList.toggle('active', isMilitary);
                layerLife.classList.toggle('active', !isMilitary);
                
                serverCards.forEach(c => c.classList.remove('highlight'));
                closestCard.classList.add('highlight');
            } else {
                layerMilitary.classList.remove('active');
                layerLife.classList.remove('active');
                serverCards.forEach(c => c.classList.remove('highlight'));
            }
        });
    }

    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.staff-card, #staff').forEach(el => {
            if(!el.style.opacity || el.style.opacity === '0') {
                el.style.opacity = '0';
                el.style.transform = 'translateY(40px)';
                el.style.transition = 'all 1s cubic-bezier(0.2, 1, 0.3, 1)';
                observer.observe(el);
            }
        });
    }

    async function fetchPlayerCounts() {
        serverCards.forEach(async (server) => {
            const cfxId = server.getAttribute('data-cfx');
            const countDisplay = server.querySelector('.player-count');
            try {
                const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${cfxId}`);
                if (response.ok) {
                    const data = await response.json();
                    const current = data.Data.clients;
                    const max = data.Data.sv_maxclients;
                    const newText = `${current}/${max}`;
                    if(countDisplay.innerText !== newText) {
                        countDisplay.classList.add('update-flash');
                        countDisplay.innerText = newText;
                        setTimeout(() => countDisplay.classList.remove('update-flash'), 500);
                    }
                } else { countDisplay.innerText = 'OFFLINE'; }
            } catch (error) { countDisplay.innerText = 'ERROR'; }
        });
    }
});