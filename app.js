// --- State ---
let isSuitEquipped = false;
let isHelmetEquipped = false;

// --- Navigasi Fase ---
function startAdventure() {
    playBeep(600, 'square', 0.1);
    document.getElementById('phase-landing').classList.replace('active', 'hidden');
    document.getElementById('phase-a').classList.replace('hidden', 'active');
    
    // Tampilkan tombol mute dan jalankan backsound secara otomatis
    isAdventureStarted = true;
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.classList.remove('hidden-btn');
    }
    if (typeof playBgMusic === 'function') {
        playBgMusic();
    }
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

let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    playBeep(300, 'square', 0.1);
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function dragItem(ev, type) {
    if (type === 'helmet' && !isSuitEquipped) {
        ev.preventDefault();
        showToast("⚠️ Harap pakaikan baju luar angkasa (Space Suit) terlebih dahulu!");
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
        
        // Tampilkan api saat sedang di-drag ke atas
        const rocketFire = document.getElementById('rocket-fire');
        if (rocketFire) rocketFire.classList.remove('hidden');
        
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
    
    // Sembunyikan api karena dilepas sebelum meluncur
    const rocketFire = document.getElementById('rocket-fire');
    if (rocketFire) rocketFire.classList.add('hidden');
    
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
    
    const dragInd = document.getElementById('drag-indicator');
    if (dragInd) dragInd.classList.add('hidden');
    
    // Start sequence
    startCountdown();
}

function startCountdown() {
    const cdDisplay = document.getElementById('countdown');
    cdDisplay.classList.remove('hidden');
    
    // Tampilkan api roket saat countdown dimulai
    const rocketFire = document.getElementById('rocket-fire');
    if (rocketFire) {
        rocketFire.classList.remove('hidden');
    }
    
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
        desc: "Wah, bayangkan tidur sambil melayang-layang seperti balon! 🎈 Di luar angkasa tidak ada gravitasi (gaya tarik Bumi), jadi astronot harus tidur di dalam kantung tidur khusus yang ditempelkan erat ke dinding. Mengapa harus diikat? Supaya saat tertidur lelap, astronot tidak melayang dan menabrak peralatan sensitif atau astronot lainnya! Pintu kamarnya juga ditutup rapat agar suasananya tenang dan nyaman.",
        video: "https://www.youtube.com/embed/UyFYgeE32f0",
        voice: "voice_over/tidur.mp3"
    },
    eat: {
        title: "Makan di Luar Angkasa",
        desc: "Nyam, bagaimana rasanya makan makanan yang melayang? 🍕 Makanan di luar angkasa dikemas khusus dalam wadah plastik atau kaleng, bahkan ada yang dikeringkan agar tahan lama. Jika astronot menuangkan air, airnya tidak akan jatuh ke bawah, melainkan membentuk bola-bola air gelembung yang melayang manis! Astronot harus menangkap bola air itu langsung dengan mulut mereka. Seru sekali, kan? Tidak boleh makan makanan yang renyah seperti keripik, ya, karena remah-remahnya bisa melayang masuk ke mata atau merusak mesin roket!",
        video: "https://www.youtube.com/embed/onm7P_iFueE",
        voice: "voice_over/makan.mp3"
    },
    wash: {
        title: "Toilet Luar Angkasa",
        desc: "Bagaimana astronot buang air di luar angkasa? 🚽 Karena tidak ada gravitasi, toilet di stasiun antariksa (ISS) bekerja menggunakan daya hisap angin seperti penyedot debu raksasa! Jika tidak disedot, kotorannya bisa melayang ke mana-mana, lho! Hiiy... seram sekali! Jadi, toiletnya didesain sangat canggih dan pas dengan tubuh astronot agar tetap bersih, higienis, dan nyaman selama bertugas.",
        video: "https://www.youtube.com/embed/aCG8NPh5G5w",
        voice: "voice_over/toilet.mp3"
    },
    spacewalk: {
        title: "Space Walk (EVA)",
        desc: "Melompat dan berjalan di tengah kegelapan luar angkasa yang luas! 👨‍🚀 Kegiatan ini disebut Spacewalk. Astronot harus memakai baju luar angkasa lengkap yang tebal sebagai pelindung dari suhu dingin ekstrem dan radiasi berbahaya. Mereka keluar dari stasiun luar angkasa untuk memperbaiki alat atau memasang panel surya baru. Agar tidak melayang hanyut dan tersesat di luar angkasa yang tak terbatas, tubuh astronot selalu diikat dengan tali pengaman baja yang sangat kuat!",
        video: "https://www.youtube.com/embed/CC-z_aBAv6M",
        voice: "voice_over/spacewalk.mp3"
    },
    panoramic: {
        title: "Pemandangan Bumi",
        desc: "Melihat Bumi kita yang bulat, biru, dan indah dari jendela luar angkasa! 🌍 Dari stasiun luar angkasa ISS yang berada 400 kilometer di atas langit, astronot bisa memandang lengkungan Bumi yang megah. Bumi tampak bersinar dengan warna biru laut yang luas, benua-benua hijau kecokelatan, dan pusaran awan putih yang cantik bagaikan lukisan raksasa yang bergerak lambat. Sungguh pemandangan menakjubkan!",
        video: "https://www.youtube.com/embed/uYpRRInfi80",
        voice: "voice_over/pemandangan-bumi.mp3"
    },
    swimming: {
        title: "Latihan Simulasi Air",
        desc: "Sebelum terbang ke langit, astronot harus berlatih menyelam di kolam raksasa bernama NBL (Neutral Buoyancy Laboratory)! 🏊‍♂️ Kolam ini sangat dalam dan berisi replika stasiun luar angkasa. Di dalam air dengan baju astronot lengkap seberat 100 kg lebih, mereka merasa hampir tanpa bobot—sangat mirip seperti melayang di luar angkasa! Mereka belajar bergerak lambat, menggunakan peralatan canggih, dan bekerja sama di bawah air selama berjam-jam agar tidak kaget saat di antariksa nanti.",
        video: "https://www.youtube.com/embed/4514z--Zbfk",
        voice: "voice_over/simulasi-air.mp3"
    },
    centrifugal: {
        title: "Latihan Sentrifugal",
        desc: "Siap-siap berputar super cepat! 🌀 Latihan sentrifugal ini menggunakan mesin berbentuk lengan raksasa yang memutar astronot dengan kecepatan sangat tinggi di dalam ruangan bulat. Putaran cepat ini menghasilkan gaya tekan yang sangat kuat, mirip dengan tekanan berat (G-Force) yang dirasakan dada astronot saat roket meluncur menembus langit. Latihan ini melatih jantung dan pernapasan astronot agar tetap sadar dan sehat meskipun tertindih tekanan yang berat!",
        video: "https://www.youtube.com/embed/xJyBIUNlY2M",
        voice: "voice_over/sentrifugal.mp3"
    }
};

function showActivity(type) {
    playBeep(500, 'triangle', 0.1);
    const data = activityData[type];
    document.getElementById('act-title').innerHTML = data.title;
    document.getElementById('act-desc').innerHTML = data.desc;
    
    // Set path audio voice over kustom
    window.currentVoicePath = data.voice;
    
    // Hentikan voice over jika masih berjalan dari aktivitas sebelumnya
    if (typeof stopVoiceOver === 'function') {
        stopVoiceOver();
    }
    
    // Set iframe
    const container = document.getElementById('video-container');
    container.innerHTML = `<iframe width="100%" height="100%" src="${data.video}?autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    document.getElementById('activity-modal').classList.remove('hidden');
}

function closeActivity() {
    // Hentikan voice over saat modal ditutup
    if (typeof stopVoiceOver === 'function') {
        stopVoiceOver();
    }
    
    // Hapus iframe agar video berhenti memutar
    document.getElementById('video-container').innerHTML = '';
    document.getElementById('activity-modal').classList.add('hidden');
}
