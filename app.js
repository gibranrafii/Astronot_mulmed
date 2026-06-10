// --- State ---
let isSuitEquipped = false;
let isHelmetEquipped = false;

// --- Navigasi Fase ---
function startAdventure() {
    playBeep(600, 'square', 0.1);
    document.getElementById('phase-landing').classList.replace('active', 'hidden');
    document.getElementById('phase-a').classList.replace('hidden', 'active');
}

function goToPhase(phase) {
    playBeep(600, 'square', 0.1);
    
    // Hide all
    document.querySelectorAll('.phase').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });

    // Show target
    document.getElementById(`phase-${phase}`).classList.replace('hidden', 'active');

    if (phase === 'b') {
        setupDragToLaunch();
    }
}

// --- Fase A: Persiapan ---
function showDressUp() {
    playBeep(600, 'square', 0.1);
    document.getElementById('training-section').classList.add('hidden');
    document.getElementById('dressup-section').classList.remove('hidden');
}

function dragItem(ev, type) {
    if (type === 'helmet' && !isSuitEquipped) {
        ev.preventDefault();
        alert("Harap pakaikan baju luar angkasa (Space Suit) terlebih dahulu sebelum memakai helm!");
        return;
    }
    ev.dataTransfer.setData("type", type);
}

function allowDrop(ev) {
    ev.preventDefault();
    document.getElementById('astronaut-avatar').classList.add('drag-over');
}

function dropItem(ev) {
    ev.preventDefault();
    document.getElementById('astronaut-avatar').classList.remove('drag-over');
    const type = ev.dataTransfer.getData("type");
    
    playBeep(800, 'triangle', 0.1);
    
    if (type === 'suit' && !isSuitEquipped) {
        document.getElementById('worn-suit').classList.remove('hidden');
        if (document.getElementById('head-overlay')) {
            document.getElementById('head-overlay').classList.remove('hidden');
        }
        if (document.querySelector('.base-avatar')) {
            document.querySelector('.base-avatar').classList.add('hidden');
        }
        document.getElementById('item-suit').classList.add('equipped');
        document.getElementById('item-suit').setAttribute('draggable', 'false');
        isSuitEquipped = true;
    } else if (type === 'helmet' && !isHelmetEquipped) {
        if (!isSuitEquipped) return;
        document.getElementById('worn-helmet').classList.remove('hidden');
        if (document.getElementById('head-overlay')) {
            document.getElementById('head-overlay').classList.add('hidden');
        }
        document.getElementById('item-helmet').classList.add('equipped');
        document.getElementById('item-helmet').setAttribute('draggable', 'false');
        isHelmetEquipped = true;
    }

    checkAllEquipped();
}

function checkAllEquipped() {
    if (isSuitEquipped && isHelmetEquipped) {
        playSuccessSound();
        document.getElementById('next-to-b').classList.remove('hidden');
        document.querySelector('#dressup-section .instruction-text').innerText = "Hebat! Astronot sudah siap. Mari ke tempat peluncuran!";
    }
}

// Tambahkan reset drag-over event listener di dokumen untuk berjaga-jaga
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});
document.addEventListener('drop', (e) => {
    e.preventDefault();
    const avatar = document.getElementById('astronaut-avatar');
    if (avatar) avatar.classList.remove('drag-over');
});

// --- Fase B: Peluncuran (Drag to Launch) ---
let dragStartY = 0;
let currentY = 0;
let isDragging = false;
const rocket = document.getElementById('rocket');
const launchInstruction = document.getElementById('launch-instruction');

function setupDragToLaunch() {
    rocket.addEventListener('mousedown', startDrag);
    rocket.addEventListener('touchstart', startDrag, {passive: false});
    
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, {passive: false});
    
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    isDragging = true;
    dragStartY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    rocket.style.transition = 'none';
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault(); // prevent scrolling
    
    const y = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const diff = y - dragStartY;
    
    // Only allow dragging up
    if (diff < 0) {
        currentY = diff;
        rocket.style.transform = `translateY(${currentY}px)`;
        
        // If dragged high enough, trigger launch sequence!
        if (currentY < -150) {
            isDragging = false;
            triggerLaunch();
        }
    }
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    
    // Spring back if not dragged high enough
    rocket.style.transition = 'transform 0.3s ease-out';
    rocket.style.transform = `translateY(0px)`;
    currentY = 0;
}

function triggerLaunch() {
    // Remove listeners so user can't interact anymore
    window.removeEventListener('mousemove', drag);
    window.removeEventListener('touchmove', drag);
    
    // Reset transform to base but add flying class
    rocket.style.transition = 'none';
    rocket.style.transform = `translateY(${currentY}px)`;
    
    launchInstruction.innerText = "Sistem peluncuran aktif!";
    
    // Start sequence
    startCountdown();
}

function startCountdown() {
    const cdDisplay = document.getElementById('countdown');
    cdDisplay.classList.remove('hidden');
    
    let count = 3;
    cdDisplay.innerText = count;
    playBeep(400, 'sine', 0.2); // beep
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            cdDisplay.innerText = count;
            playBeep(400, 'sine', 0.2);
        } else {
            clearInterval(interval);
            cdDisplay.innerText = "LIFT OFF!";
            playBeep(800, 'sine', 0.5); // long beep
            
            // Launch animation & sound
            startRumble();
            document.body.classList.add('shake');
            
            setTimeout(() => {
                rocket.style.transition = 'transform 3s cubic-bezier(0.5, 0, 0.2, 1)';
                rocket.style.transform = `translateY(-1500px)`;
            }, 100);
            
            // Transition to Phase C after launch
            setTimeout(() => {
                document.body.classList.remove('shake');
                stopRumble();
                goToPhase('c');
            }, 3500);
        }
    }, 1000);
}

// --- Fase C: Operasional (Menu) ---
const activityData = {
    sleep: {
        title: "Tidur Melayang",
        desc: "Di gravitasi nol, semuanya melayang! Astronot tidur di kantung tidur yang diikat ke dinding agar tidak melayang menabrak alat-alat saat tidur.",
        video: "https://www.youtube.com/embed/UyFYgeE32f0"
    },
    eat: {
        title: "Makan di Luar Angkasa",
        desc: "Makanan astronot kebanyakan dikeringkan atau ditaruh dalam kemasan khusus. Air juga membentuk bola-bola air yang melayang di udara!",
        video: "https://www.youtube.com/embed/onm7P_iFueE"
    },
    wash: {
        title: "Mandi Tanpa Gayung",
        desc: "Karena air tidak jatuh ke bawah, astronot membersihkan diri menggunakan handuk basah dan sabun tanpa bilas.",
        video: "https://www.youtube.com/embed/3VoeRAR0YgE"
    },
    spacewalk: {
        title: "Space Walk (EVA)",
        desc: "Terkadang astronot harus keluar dari ISS untuk memperbaiki satelit. Mereka diikat dengan tali pengaman agar tidak melayang jauh ke angkasa.",
        video: "https://www.youtube.com/embed/SGP6Y0Pnhe4"
    },
    panoramic: {
        title: "Pemandangan Bumi",
        desc: "Dari jarak 400 kilometer di atas Bumi, astronot bisa melihat lengkungan planet kita yang indah. Bumi terlihat dominan berwarna biru (air) dengan awan putih yang berputar.",
        video: "https://www.youtube.com/embed/XqJBXXO5mG0"
    },
    swimming: {
        title: "Latihan Simulasi Air",
        desc: "Latihan berjam-jam di bawah air menggunakan baju astronot lengkap agar terbiasa dengan gaya berat angkat.",
        video: "https://www.youtube.com/embed/4514z--Zbfk"
    },
    centrifugal: {
        title: "Latihan Sentrifugal",
        desc: "Diputar dengan sangat cepat untuk menahan tekanan peluncuran roket.",
        video: "https://www.youtube.com/embed/xJyBIUNlY2M"
    }
};

function showActivity(type) {
    playBeep(500, 'triangle', 0.1);
    const data = activityData[type];
    document.getElementById('act-title').innerHTML = data.title;
    document.getElementById('act-desc').innerHTML = data.desc;
    
    // Set iframe
    const container = document.getElementById('video-container');
    container.innerHTML = `<iframe width="100%" height="100%" src="${data.video}?autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    document.getElementById('activity-modal').classList.remove('hidden');
}

function closeActivity() {
    // Hapus iframe agar video berhenti memutar
    document.getElementById('video-container').innerHTML = '';
    document.getElementById('activity-modal').classList.add('hidden');
}
