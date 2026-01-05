/**
 * CONFIGURATION & CONSTANTS
 */
const LIFF_ID = "2008756827-zANFfOMQ";

const PRODUCTS = [
    { 
        id: 1, 
        name: "Moisture Veil LX", 
        img: "https://covermark.co.th/wp-content/uploads/2020/03/MoistureVeilLX.jpg", 
        bgImg: "https://covermark.co.th/wp-content/uploads/2020/04/4935059CMMVNM.png" 
    },
    { 
        id: 2, 
        name: "Flawless Fit", 
        img: "https://covermark.co.th/wp-content/uploads/2020/04/FlawlessFit.jpg", 
        bgImg: "https://covermark.co.th/wp-content/uploads/2020/04/104234189_1524006301105607_3220439053025674423_n-1.jpg" 
    },
    { 
        id: 3, 
        name: "Moisturecoat Gel (พร้อมพัฟ)", 
        img: "https://covermark.co.th/wp-content/uploads/2021/11/Covermark-Moisture-Coat-Gel-600x600-1.png", 
        bgImg: "https://cosmenet-private.s3-bkk.nipa.cloud/upload/Maker/product-info/covermark/covermark-moisture-coat-gel-1.jpg" 
    }
];

const LOVE_MESSAGES = [
    "ของขวัญแด่คนพิเศษ",
    "ขอบคุณที่มีกันนะ",
    "แทนความรักจากใจ",
    "สุขสันต์วันวาเลนไทน์",
    "รักเธอที่สุดนะ"
];

/**
 * STATE MANAGEMENT
 */
let selectedProduct = PRODUCTS[0];
let selectedMessage = LOVE_MESSAGES[0];
let isMusicPlaying = false;
let isOpening = false; // สถานะการเปิดกล่อง
let moveCounter = 0;   // นับจังหวะเขย่า
let lastX = null, lastY = null, lastZ = null;

/**
 * CORE APPLICATION LOGIC
 */
async function startApp() {
    try {
        await liff.init({ liffId: LIFF_ID });
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('mode') === 'receiver') {
            setupReceiverMode(urlParams);
        } else {
            navigateTo('page-home');
            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                const senderInput = document.getElementById('sender-name');
                if (senderInput) senderInput.value = profile.displayName;
            }
        }
    } catch (e) {
        console.error("LIFF Init Error:", e);
        navigateTo('page-home');
    } finally {
        hideLoader();
    }
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        const isFlex = ['page-home', 'page-condition', 'page-receiver'].includes(pageId);
        target.style.display = isFlex ? 'flex' : 'block';

        // Auto-play music when arriving at sender page
        if (pageId === 'page-sender' && !isMusicPlaying) {
            handleMusicPlay(true);
        }
        window.scrollTo(0, 0);
    }
}

/**
 * MUSIC CONTROL
 */
function handleMusicPlay(shouldPlay) {
    const audio = document.getElementById('bgm');
    if (shouldPlay) {
        audio.play().then(() => {
            isMusicPlaying = true;
            updateMusicUI('ON');
        }).catch(() => {
            isMusicPlaying = false;
            updateMusicUI('OFF');
        });
    } else {
        audio.pause();
        isMusicPlaying = false;
        updateMusicUI('OFF');
    }
}

function toggleMusic() {
    handleMusicPlay(!isMusicPlaying);
}

function updateMusicUI(status) {
    const s1 = document.getElementById('music-status');
    const s2 = document.getElementById('music-status-summary');
    
    if (s1) s1.innerText = status;
    if (s2) s2.innerText = status;

    const btns = [s1?.parentElement, s2?.parentElement];
    btns.forEach(btn => {
        if (!btn) return;
        if (status === 'ON') {
            btn.classList.add('music-on-glow');
            btn.classList.remove('music-off-style');
        } else {
            btn.classList.remove('music-on-glow');
            btn.classList.add('music-off-style');
        }
    });
}

/**
 * GIFT BOX & PORTAL ANIMATION
 */
function handleOpenGift() {
    if (isOpening) return;
    const box = document.getElementById('gift-box');
    if (!box) return;

    isOpening = true;
    box.classList.add('shaking');

    setTimeout(() => {
        const portal = document.createElement('div');
        portal.className = 'portal-overlay';
        document.body.appendChild(portal);

        setTimeout(() => {
            portal.classList.add('portal-active');
            
            setTimeout(() => {
                navigateTo('page-reveal');
                const revealCard = document.querySelector('#page-reveal > div');
                if(revealCard) revealCard.classList.add('reveal-item-float');

                setTimeout(() => {
                    portal.style.opacity = '0';
                    setTimeout(() => {
                        portal.remove();
                        isOpening = false;
                    }, 1000);
                }, 800);
            }, 600);
        }, 100);
    }, 800);
}

/**
 * SENSOR & MOTION (SHAKE)
 */
function handleMotion(event) {
    if (isOpening) return;

    let acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc || acc.x === null) return;

    if (lastX !== null) {
        let deltaX = Math.abs(lastX - acc.x);
        let deltaY = Math.abs(lastY - acc.y);
        
        // Threshold for shaking (Adjustable)
        if (deltaX > 15 || deltaY > 15) {
            moveCounter++;
            if (moveCounter >= 2) {
                handleOpenGift();
                moveCounter = 0;
            }
        }
    }
    lastX = acc.x; lastY = acc.y; lastZ = acc.z;
}

async function requestShakePermission() {
    // iOS 13+ Requirement
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission === 'granted') {
                window.addEventListener('devicemotion', handleMotion, true);
                return true;
            }
        } catch (e) {
            console.error("Sensor permission error", e);
        }
    } else {
        // Android / Other browsers
        window.addEventListener('devicemotion', handleMotion, true);
        return true;
    }
    return false;
}

/**
 * RECEIVER MODE SETUP
 */
function setupReceiverMode(params) {
    isOpening = false;
    navigateTo('page-receiver');
    
    const sender = params.get('sender') || "เพื่อนของคุณ";
    const giftId = params.get('giftId');
    const msg = params.get('msg') || "ของขวัญแด่คนพิเศษ";

    document.getElementById('rec-sender-name').innerText = sender;
    
    const product = PRODUCTS.find(p => p.id == giftId) || PRODUCTS[0];
    document.getElementById('reveal-img').src = product.bgImg;
    document.getElementById('reveal-msg').innerText = `"${msg}"`;

    const giftContainer = document.getElementById('gift-container');
    if (giftContainer) {
        giftContainer.onclick = async (e) => {
            e.preventDefault();
            await requestShakePermission();
            handleOpenGift();
        };
    }
}

/**
 * UI INITIALIZATION (SWIPERS & SENDER FLOW)
 */
function initSwipers() {
    const prodWrapper = document.getElementById('product-list');
    const extendedList = [...PRODUCTS, ...PRODUCTS];
    prodWrapper.innerHTML = extendedList.map(p => `
        <div class="swiper-slide">
            <div class="product-card-3-4"><img src="${p.img}"></div>
            <p class="text-center mt-4 text-[10px] uppercase tracking-widest text-[#015c46]">${p.name}</p>
        </div>
    `).join('');

    new Swiper(".productSwiper", {
        centeredSlides: true, slidesPerView: "auto", spaceBetween: 40, loop: true,
        on: { slideChange: function() { selectedProduct = PRODUCTS[this.realIndex % PRODUCTS.length]; } }
    });

    const msgWrapper = document.getElementById('message-list');
    const extendedMessages = [...LOVE_MESSAGES, ...LOVE_MESSAGES]; 
    msgWrapper.innerHTML = extendedMessages.map(m => `
        <div class="swiper-slide"><div class="message-item">${m}</div></div>
    `).join('');

    new Swiper(".messageSwiper", {
        centeredSlides: true, slidesPerView: "auto", spaceBetween: 10, loop: true,
        on: { slideChange: function() { selectedMessage = LOVE_MESSAGES[this.realIndex % LOVE_MESSAGES.length]; } }
    });
}

function prepareSummary() {
    const receiver = document.getElementById('receiver-name').value;
    if (!receiver) return alert("กรุณาระบุชื่อผู้รับ");
    
    document.getElementById('sum-receiver').innerText = receiver;
    document.getElementById('sum-sender').innerText = document.getElementById('sender-name').value || "เพื่อนของคุณ";
    document.getElementById('sum-msg').innerText = `"${selectedMessage}"`;
    document.getElementById('summary-img').src = 'openGift.jpg'; 
    
    navigateTo('page-summary');
}

/**
 * LINE SHARING
 */
async function sendGift() {
    const sender = document.getElementById('sender-name').value || "เพื่อนของคุณ";
    const receiver = document.getElementById('receiver-name').value;
    if (!receiver) return alert("กรุณาระบุชื่อผู้รับ");

    const shareUrl = `https://liff.line.me/${LIFF_ID}?mode=receiver&sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}&giftId=${selectedProduct.id}&msg=${encodeURIComponent(selectedMessage)}`;

    if (!liff.isApiAvailable('shareTargetPicker')) return alert("กรุณาเปิดในแอป LINE");

    try {
        await liff.shareTargetPicker([{
            "type": "flex",
            "altText": `คุณได้รับของขวัญจากคุณ ${sender}`,
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box", "layout": "vertical", "paddingAll": "0px",
                    "contents": [{
                        "type": "box", "layout": "vertical", "contents": [
                            { "type": "image", "url": selectedProduct.bgImg, "size": "full", "aspectRatio": "3:4", "aspectMode": "cover" },
                            { "type": "box", "layout": "vertical", "position": "absolute", "offsetBottom": "80px", "offsetStart": "0px", "offsetEnd": "0px", "alignItems": "center", "contents": [
                                { "type": "text", "text": `To: ${receiver}`, "weight": "bold", "color": "#ffffff" },
                                { "type": "text", "text": selectedMessage, "color": "#ffffff", "size": "sm" }
                            ]},
                            { "type": "button", "action": { "type": "uri", "label": "เปิดกล่องของขวัญ", "uri": shareUrl }, "style": "primary", "color": "#015c46", "position": "absolute", "offsetBottom": "20px", "offsetStart": "50px", "offsetEnd": "50px" }
                        ]
                    }]
                }
            }
        }]);
        liff.closeWindow();
    } catch (e) { console.error("Share Failed", e); }
}

/**
 * INITIALIZATION
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
}

function startWithSound() {
    navigateTo('page-sender'); 
}

window.addEventListener('load', () => {
    initSwipers();
    startApp();
});
