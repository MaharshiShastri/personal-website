const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fill the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Atoms and Circuits Animation
const particles = [];
const maxParticles = 100;

window.addEventListener('scroll', () => {
    const scrollToTopButton = document.getElementById('scrollToTop');
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
});

document.getElementById('scrollToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speedX: Math.random() * 1.5 - 0.75,
        speedY: Math.random() * 1.5 - 0.75,
        color: `rgba(10, 30, 120, ${Math.random() + 0.3})`
    };
}

// Initialize particles
for (let i = 0; i < maxParticles; i++) {
    particles.push(createParticle());
}

// Draw a particle
function drawParticle(particle) {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
}

// Update particle positions
function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap particles around the screen
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        drawParticle(particle);
    });
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = "rgba(10, 30, 120, 0.2)";
                ctx.stroke();
            }
        }
    }

    updateParticles();
    requestAnimationFrame(animate);
}

// Open Modal
document.querySelector('.contact a').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('contactModal').style.display = 'flex';
});

// Close Modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('contactModal').style.display = 'none';
});

// Close Modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('contactModal')) {
        document.getElementById('contactModal').style.display = 'none';
    }
});

animate();
