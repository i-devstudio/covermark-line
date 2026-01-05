const LIFF_ID = "2008756827-zANFfOMQ";

// 1. ข้อมูลสินค้า (เพิ่ม bgImg สำหรับหน้า Preview และ Reveal)
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
        name: "Moisturecoat Gel (พร้อมพัฟ)		", 
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

// State Management
let selectedProduct = PRODUCTS[0];
let selectedMessage = LOVE_MESSAGES[0];
let isMusicPlaying = false;
let shakeThreshold = 15;
let lastX, lastY, lastZ;


function startWithSound() {
    const audio = document.getElementById('bgm');
    const statusSender = document.getElementById('music-status');
    const statusSummary = document.getElementById('music-status-summary');

    // // 1. สั่งเล่นเพลงทันทีที่กดปุ่ม
    // audio.play().then(() => {
    //     isMusicPlaying = true;
    //     // อัปเดต UI ปุ่มเพลงทุกจุดให้เป็น ON
    //     if (statusSender) statusSender.innerText = 'ON';
    //     if (statusSummary) statusSummary.innerText = 'ON';
    // }).catch(error => {
    //     console.log("Autoplay blocked, waiting for next interaction");
    // });

    // 2. ไปที่หน้าถัดไป (Condition หรือหน้าเลือกของขวัญ)
    navigateTo('page-sender'); 
}

// function startWithSound() {
//     // ปลดล็อก Audio Context สำหรับ Browser
//     const audio = document.getElementById('bgm');
//     audio.play().then(() => {
//         // ถ้าเล่นได้ ให้รันยาวไป
//         isMusicPlaying = true;
//         updateMusicUI('ON');
//     }).catch(() => {
//         // ถ้าโดนบล็อก ก็ยังให้ไปหน้าถัดไปได้
//         console.log("Audio waiting for user interaction");
//     });

//     navigateTo('page-sender'); 
// }
// --- 1. ระบบเริ่มต้น (LIFF & Logic) ---
// async function startApp() {
//     try {
//         await liff.init({ liffId: LIFF_ID });
//         const urlParams = new URLSearchParams(window.location.search);
        
//         if (urlParams.get('mode') === 'receiver') {
//             setupReceiverMode(urlParams);
//         } else {
//             if (liff.isLoggedIn()) {
//                 const profile = await liff.getProfile();
//                 const senderInput = document.getElementById('sender-name');
//                 if (senderInput) senderInput.value = profile.displayName;
//             }
//         }
//     } catch (e) {
//         console.error("LIFF Error:", e);
//     } finally {
//         hideLoader();
//     }
// }
async function startApp() {
    try {
        await liff.init({ liffId: LIFF_ID });
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('mode') === 'receiver') {
            // ถ้าเป็นผู้รับ ให้ไปหน้า receiver ทันที
            setupReceiverMode(urlParams);
        } else {
            // ถ้าไม่ใช่ผู้รับ ถึงจะแสดงหน้าแรก (Home)
            navigateTo('page-home');
            
            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                const senderInput = document.getElementById('sender-name');
                if (senderInput) senderInput.value = profile.displayName;
            }
        }
    } catch (e) {
        console.error("LIFF Init Error:", e);
        // กรณี Error ให้กลับไปหน้า Home เพื่อความปลอดภัย
        navigateTo('page-home');
    } finally {
        hideLoader();
    }
}



function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 5000);
    }
}

// --- 2. ฟังก์ชันแชร์ (Sender Flow) ---
async function sendGift() {
    const sender = document.getElementById('sender-name').value || "เพื่อนของคุณ";
    const receiver = document.getElementById('receiver-name').value;
    const msg = selectedMessage; 

    if (!receiver) {
        alert("กรุณาระบุชื่อผู้รับ");
        return;
    }

    // สร้าง URL โดยส่ง giftId และ msg ไปด้วย
    const shareUrl = `https://liff.line.me/${LIFF_ID}?mode=receiver&sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}&giftId=${selectedProduct.id}&msg=${encodeURIComponent(msg)}`;

    if (!liff.isApiAvailable('shareTargetPicker')) {
        alert("กรุณาเปิดในแอป LINE เพื่อส่งของขวัญ");
        return;
    }

    try {
        const result = await liff.shareTargetPicker([{
            "type": "flex",
            "altText": `คุณได้รับของขวัญจากคุณ ${sender}`,
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box", "layout": "vertical", "paddingAll": "0px",
                    "contents": [{
                        "type": "box", "layout": "vertical", "contents": [
                            { 
                                "type": "image", 
                                "url": selectedProduct.bgImg, // ใช้ภาพ Background ใน Flex
                                "size": "full", "aspectRatio": "3:4", "aspectMode": "cover" 
                            },
                            { 
                                "type": "box", "layout": "vertical", "position": "absolute", "offsetBottom": "80px", "offsetStart": "0px", "offsetEnd": "0px", "alignItems": "center", "contents": [
                                    { "type": "text", "text": `To: ${receiver}`, "weight": "bold", "color": "#ffffff" },
                                    { "type": "text", "text": msg, "color": "#ffffff", "size": "sm" }
                                ]
                            },
                            { 
                                "type": "button", 
                                "action": { "type": "uri", "label": "เปิดกล่องของขวัญ", "uri": shareUrl }, 
                                "style": "primary", "color": "#015c46", "position": "absolute", "offsetBottom": "20px", "offsetStart": "50px", "offsetEnd": "50px" 
                            }
                        ]
                    }]
                }
            }
        }]);
        if (result) liff.closeWindow();
    } catch (e) {
        console.error("Share Failed", e);
    }
}

// --- 3. ระบบแสดงผล (UI & Swiper) ---
function initSwipers() {
    // Product Swiper (หน้าเลือกสินค้า)
    const prodWrapper = document.getElementById('product-list');
    const list = [...PRODUCTS, ...PRODUCTS];
    prodWrapper.innerHTML = list.map(p => `
        <div class="swiper-slide">
            <div class="product-card-3-4"><img src="${p.img}"></div>
            <p class="text-center mt-4 text-[10px] uppercase tracking-widest text-[#015c46]">${p.name}</p>
        </div>
    `).join('');

    new Swiper(".productSwiper", {
        centeredSlides: true, slidesPerView: "auto", spaceBetween: 40, loop: true,
        on: {
            slideChange: function() {
                selectedProduct = PRODUCTS[this.realIndex % PRODUCTS.length];
            }
        }
    });

 // Swiper ข้อความ (แก้ไขเพื่อลด Warning)
 const msgWrapper = document.getElementById('message-list');
 // เพิ่มจำนวนการคัดลอกข้อความเพื่อให้ Swiper Loop ทำงานได้เสถียร (อย่างน้อย 10 items)
 const extendedMessages = [...LOVE_MESSAGES, ...LOVE_MESSAGES]; 
 
 msgWrapper.innerHTML = extendedMessages.map(m => `
	 <div class="swiper-slide"><div class="message-item">${m}</div></div>
 `).join('');

 new Swiper(".messageSwiper", {
	 centeredSlides: true,
	 slidesPerView: "auto", // หรือใส่เป็น 3 สำหรับหน้าจอใหญ่
	 spaceBetween: 10,
	 loop: true,
	 loopedSlides: 5, // กำหนดจำนวนสไลด์ที่ให้ loop แน่นอน
	 on: {
		 slideChange: function() {
			 // ใช้ค่าจาก realIndex เพื่อให้ได้ index ที่ถูกต้องเสมอ
			 selectedMessage = LOVE_MESSAGES[this.realIndex % LOVE_MESSAGES.length];
		 }
	 }
 });
}

// function prepareSummary() {
//     const receiver = document.getElementById('receiver-name').value;
//     if (!receiver) return alert("กรุณาระบุชื่อผู้รับ");
    
//     document.getElementById('sum-receiver').innerText = receiver;
//     document.getElementById('sum-sender').innerText = document.getElementById('sender-name').value || "เพื่อนของคุณ";
//     document.getElementById('sum-msg').innerText = `"${selectedMessage}"`;
//     document.getElementById('summary-img').src = openGift.jpg; 
//     // document.getElementById('summary-img').src = selectedProduct.bgImg; 
    
//     navigateTo('page-summary');
    
//     // ถ้าเพลงถูกเปิดไว้ตั้งแต่หน้าก่อนหน้า (หน้า 3) เพลงจะเล่นต่อเนื่องมาถึงหน้านี้ทันที
// }

function prepareSummary() {
    const receiver = document.getElementById('receiver-name').value;
    if (!receiver) return alert("กรุณาระบุชื่อผู้รับ");
    
    document.getElementById('sum-receiver').innerText = receiver;
    document.getElementById('sum-sender').innerText = document.getElementById('sender-name').value || "เพื่อนของคุณ";
    document.getElementById('sum-msg').innerText = `"${selectedMessage}"`;
    
    // แก้ไขตรงนี้: ใส่เครื่องหมาย ' ' ครอบชื่อไฟล์
    document.getElementById('summary-img').src = 'openGift.jpg'; 
    
    navigateTo('page-summary');
}

// --- 4. ระบบสำหรับผู้รับ (Receiver Flow) ---
// function setupReceiverMode(params) {
//     navigateTo('page-receiver');
//     document.getElementById('rec-sender-name').innerText = params.get('sender') || "เพื่อนของคุณ";
    
//     const product = PRODUCTS.find(p => p.id == params.get('giftId')) || PRODUCTS[0];
//     const msg = params.get('msg') || "ของขวัญแด่คนพิเศษ";
    
//     document.getElementById('reveal-img').src = product.bgImg; // ใช้ภาพ bgImg ตอนเปิด
//     document.getElementById('reveal-msg').innerText = `"${msg}"`;
    
//     // คลิกเพื่อเปิด
//     document.getElementById('gift-container').onclick = handleOpenGift;
// }
// ฟังก์ชันสำหรับขออนุญาตเข้าถึง Sensor (เรียกใช้ตอนผู้รับกด "คลิกที่กล่องเพื่อเปิด")
// async function requestShakePermission() {
//     if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
//         try {
//             const permission = await DeviceMotionEvent.requestPermission();
//             if (permission === 'granted') {
//                 window.addEventListener('devicemotion', handleMotion);
//             }
//         } catch (error) {
//             console.error("Permission denied", error);
//         }
//     } else {
//         // สำหรับ Android หรือ Browser ที่ไม่ต้องขออนุญาต
//         window.addEventListener('devicemotion', handleMotion);
//     }
// }
// ปรับปรุงฟังก์ชันขอสิทธิ์ให้สมบูรณ์ขึ้น
async function requestShakePermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
                console.log("Shake sensor: ON");
            }
        } catch (error) {
            console.error("Permission denied", error);
        }
    } else {
        // สำหรับ Android หรือ Desktop
        window.addEventListener('devicemotion', handleMotion);
    }
}

// function setupReceiverMode(params) {
//     navigateTo('page-receiver');
    
//     // ตั้งค่าข้อมูลผู้รับ... (ตามโค้ดเดิม)

//     // เพิ่มตัวดักจับการคลิกครั้งแรกเพื่อขอสิทธิ์ Sensor
//     const giftContainer = document.getElementById('gift-container');
//     giftContainer.addEventListener('click', function() {
//         requestShakePermission(); // ขอสิทธิ์เขย่า
//         handleOpenGift();        // ถ้าเขย่าไม่ได้ อย่างน้อยคลิกก็ต้องเปิดได้
//     }, { once: true }); // ให้ทำงานแค่ครั้งเดียว
// }

function setupReceiverMode(params) {
    isOpening = false; // รีเซ็ตสถานะป้องกันการค้าง
    navigateTo('page-receiver');
    
    // ดึงข้อมูลจาก URL
    const sender = params.get('sender') || "เพื่อนของคุณ";
    const giftId = params.get('giftId');
    const msg = params.get('msg') || "ของขวัญแด่คนพิเศษ";

    // แสดงชื่อผู้ส่ง
    const recSenderName = document.getElementById('rec-sender-name');
    if (recSenderName) recSenderName.innerText = sender;
    
    // เตรียมข้อมูลสินค้าหน้า Reveal
    const product = PRODUCTS.find(p => p.id == giftId) || PRODUCTS[0];
    const revealImg = document.getElementById('reveal-img');
    const revealMsg = document.getElementById('reveal-msg');
    
    if (revealImg) revealImg.src = product.bgImg;
    if (revealMsg) revealMsg.innerText = `"${msg}"`;

    // ผูกคำสั่งคลิกที่ตัวกล่อง
    const giftContainer = document.getElementById('gift-container');
    if (giftContainer) {
        giftContainer.onclick = (e) => {
            e.preventDefault(); // ป้องกัน Browser ทำงานซ้ำซ้อน
            requestShakePermission(); // ขอสิทธิ์เขย่าสำหรับ iPhone
            handleOpenGift();        // สั่งเปิดกล่อง
        };
    }
}

// function handleOpenGift() {
//     const box = document.getElementById('gift-box');
//     if(box.classList.contains('box-explode')) return;

//     box.classList.add('shaking');
//     setTimeout(() => {
//         box.classList.remove('shaking');
//         box.classList.add('box-explode');
//         setTimeout(() => navigateTo('page-reveal'), 600);
//     }, 1000);
// }

function handleOpenGift() {
    if (isOpening) return; // ถ้ากำลังทำงานอยู่ ไม่ต้องทำซ้ำ

    const box = document.getElementById('gift-box');
    if (!box) return;

    isOpening = true; 
    box.classList.add('shaking'); // เริ่มสั่น

    setTimeout(() => {
        box.classList.remove('shaking');
        box.classList.add('box-explode'); // แอนิเมชันระเบิด/เปิดออก
        
        setTimeout(() => {
            navigateTo('page-reveal'); // เปลี่ยนไปหน้าโชว์ของขวัญ
        }, 600);
    }, 1000);
}

// --- 5. ยูทิลิตี้ ---
// function navigateTo(pageId) {
//     document.querySelectorAll('.page').forEach(p => {
//         p.classList.remove('active');
//         p.style.display = 'none';
//     });
    
//     const target = document.getElementById(pageId);
//     if (target) {
//         target.classList.add('active');
        
//         // กำหนดการแสดงผล Layout
//         const isFlex = ['page-home', 'page-condition', 'page-receiver'].includes(pageId);
//         target.style.display = isFlex ? 'flex' : 'block';
        
//         // เมื่อเปลี่ยนหน้า เราจะไม่สั่ง audio.pause() หรือ audio.currentTime = 0 
//         // เพลงจะเล่นต่อไปเรื่อยๆ ตามสถานะ isMusicPlaying
//         window.scrollTo(0, 0);
//     }
// }
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

        // --- จุดที่เพลงจะเริ่มทำงาน ---
        if (pageId === 'page-sender') {
			const audio = document.getElementById('bgm');
			// ถ้าเพลงยังไม่เล่น ให้สั่งเล่นและตั้งค่าเป็น ON
			if (!isMusicPlaying) {
				audio.play().then(() => {
					isMusicPlaying = true;
					updateMusicUI('ON');
				}).catch(e => {
					isMusicPlaying = false;
					updateMusicUI('OFF');
				});
			} else {
				// ถ้าเพลงเล่นอยู่แล้ว (จากการกด startWithSound) ให้มั่นใจว่า UI แสดง ON
				updateMusicUI('ON');
			}
		}
        
        window.scrollTo(0, 0);
    }
}

// ปรับปรุงฟังก์ชัน toggle ให้แม่นยำขึ้น
function toggleMusic() {
    const audio = document.getElementById('bgm');
    
    // ถ้าเพลงเล่นอยู่ (isMusicPlaying เป็น true) ให้สั่งหยุด
    if (isMusicPlaying) {
        audio.pause();
        isMusicPlaying = false;
        updateMusicUI('OFF');
    } 
    // ถ้าเพลงหยุดอยู่ ให้สั่งเล่น
    else {
        audio.play().then(() => {
            isMusicPlaying = true;
            updateMusicUI('ON');
        }).catch(e => console.log("Playback failed"));
    }
}

// ฟังก์ชันอัปเดตข้อความบนปุ่ม
function updateMusicUI(status) {
    const s1 = document.getElementById('music-status');
    const s2 = document.getElementById('music-status-summary');
    if (s1) s1.innerText = status;
    if (s2) s2.innerText = status;
}
// function toggleMusic() {
//     const audio = document.getElementById('bgm');
//     const statusSender = document.getElementById('music-status');
//     const statusSummary = document.getElementById('music-status-summary');
    
//     if (isMusicPlaying) {
//         audio.pause();
//         isMusicPlaying = false;
//         if (statusSender) statusSender.innerText = 'OFF';
//         if (statusSummary) statusSummary.innerText = 'OFF';
//     } else {
//         audio.play();
//         isMusicPlaying = true;
//         if (statusSender) statusSender.innerText = 'ON';
//         if (statusSummary) statusSummary.innerText = 'ON';
//     }
// }

let lastUpdate = 0;
let isOpening = false; // กันการเขย่าซ้ำตอนกำลังเล่นแอนิเมชัน

function handleMotion(event) {
    if (isOpening) return; // ถ้ากำลังเปิดอยู่ ไม่ต้องตรวจจับการเขย่าซ้ำ

    let curTime = Date.now();
    if ((curTime - lastUpdate) > 100) {
        let diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        let acc = event.accelerationIncludingGravity;
        // คำนวณความแรงจากการเปลี่ยนแปลงของแกน X, Y, Z
        let speed = Math.abs(acc.x + acc.y + acc.z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > 1200) { // ลองปรับค่านี้ดูครับ 1200 กำลังดี
            handleOpenGift();
        }

        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
    }
}

// ในฟังก์ชัน setupReceiverMode
const giftContainer = document.getElementById('gift-container');
if (giftContainer) {
    giftContainer.onclick = async () => {
        // 1. ขอสิทธิ์เขย่า (ถ้าขอแล้วจะผ่านฉลุย ถ้ายังจะเด้งถาม)
        await requestShakePermission(); 
        
        // 2. สั่งเปิดกล่อง (ถ้าผู้ใช้ไม่เขย่า แต่ใช้วิธีคลิกแทน กล่องก็ต้องเปิดได้)
        handleOpenGift(); 
    };
}

function updateMusicUI(status) {
    const s1 = document.getElementById('music-status');
    const s2 = document.getElementById('music-status-summary');
    
    // ค้นหาปุ่มที่หุ้มข้อความอยู่ (ใช้ parentElement)
    const btn1 = s1 ? s1.parentElement : null;
    const btn2 = s2 ? s2.parentElement : null;

    if (s1) s1.innerText = status;
    if (s2) s2.innerText = status;

    if (status === 'ON') {
        if (btn1) { btn1.classList.add('music-on-glow'); btn1.classList.remove('music-off-style'); }
        if (btn2) { btn2.classList.add('music-on-glow'); btn2.classList.remove('music-off-style'); }
    } else {
        if (btn1) { btn1.classList.remove('music-on-glow'); btn1.classList.add('music-off-style'); }
        if (btn2) { btn2.classList.remove('music-on-glow'); btn2.classList.add('music-off-style'); }
    }
}

// Start Application
window.addEventListener('load', () => {
    initSwipers();
    startApp();
});