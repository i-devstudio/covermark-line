/**
 * CONFIGURATION & CONSTANTS
 */
 const LIFF_ID = "2008756827-zANFfOMQ";

 const PRODUCTS = [
	 { 
		 id: 1, 
		 name: "Skinbright Cream CC", 
		 img: "https://covermark.co.th/wp-content/uploads/2021/07/Skinbright-cream-cc-1.jpg", 
		 bgImg: "https://th-test-11.slatic.net/p/8151db9492ddb04aee9fc28f925d898a.jpg" 
	 },
	 { 
		 id: 2, 
		 name: "Moisture Charge Serum", 
		 img: "https://covermark.co.th/wp-content/uploads/2020/04/MCS.png", 
		 bgImg: "https://scontent.fbkk12-3.fna.fbcdn.net/v/t1.6435-9/119973031_1607023319470571_7054897150241389889_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=mnwsSmHgsgEQ7kNvwEDmhfN&_nc_oc=AdmVEL3IXRU57whbL6-vuH3sxqq8YevQEl_pwxcHgcJa1njcVOkvfGIDYBuMy6wiwSd9tn0NK8083Hj9XI6BoyYX&_nc_zt=23&_nc_ht=scontent.fbkk12-3.fna&_nc_gid=2-5aFlwP1SCfDKQQerBGzw&oh=00_AfoIAth6Xmy9ixzRxqOnOYRSxu6U5alft9dIY-wnbS7UOQ&oe=6983DCC3" 
	 },
	 { 
		 id: 3, 
		 name: "Moisturecoat Gel", 
		 img: "https://covermark.co.th/wp-content/uploads/2021/11/Covermark-Moisture-Coat-Gel-600x600-1.png", 
		 bgImg: "https://mpics.mgronline.com/pics/Images/564000011707002.JPEG" 
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
 /**
 * ปรับปรุงการเขย่าให้แม่นยำขึ้น
 */
// --- 1. ประกาศตัวแปรไว้บนสุดเสมอเพื่อกัน Error ---

let lastShakeTime = 0;

// --- 2. ฟังก์ชันจัดการการเขย่า (ปรับให้ Smooth ขึ้น) ---
function handleMotion(event) {
    if (isOpening) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null) return;

    const currentTime = Date.now();
    if (currentTime - lastShakeTime > 80) {
        if (lastX !== null) {
            let deltaX = Math.abs(lastX - acc.x);
            let deltaY = Math.abs(lastY - acc.y);
            let deltaZ = Math.abs(lastZ - acc.z);
            
            // รวมแรงเหวี่ยงทุกแกน
            if (deltaX + deltaY + deltaZ > 18) { 
                moveCounter++;
            }

            if (moveCounter >= 2) {
                // เขย่าสำเร็จ
                if (navigator.vibrate) navigator.vibrate(100);
                handleOpenGift(); 
                moveCounter = 0;
            }

            // ถ้าหยุดเขย่าให้ Reset
            if (currentTime - lastShakeTime > 500) moveCounter = 0;
        }
        lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        lastShakeTime = currentTime;
    }
}

// --- 3. ฟังก์ชันเปิดกล่อง (เพิ่ม Effect การเปลี่ยนหน้า) ---
function handleOpenGift() {
    if (isOpening) return;
    const box = document.getElementById('gift-box'); // ตรวจสอบ ID ให้ตรงกับ HTML
    
    isOpening = true;
    if (box) box.classList.add('shaking');

    // สร้าง Fade Effect เหมือนตัวอย่าง Chanel
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: white; z-index: 9999; opacity: 0;
        transition: opacity 0.8s ease; pointer-events: none;
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1'; // ค่อยๆ ขาวโพลน
        setTimeout(() => {
            navigateTo('page-reveal'); // เปลี่ยนหน้า
            overlay.style.opacity = '0'; // ค่อยๆ จางออก
            setTimeout(() => {
                overlay.remove();
                isOpening = false;
            }, 800);
        }, 800);
    }, 500);
}

/**
 * แก้ไขจุดคลิกเพื่อไม่ให้มันเปิดทันที (ให้รอเขย่าได้)
 */
//  async function requestShakePermission() {
// 	 // iOS 13+ Requirement
// 	 if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
// 		 try {
// 			 const permission = await DeviceMotionEvent.requestPermission();
// 			 if (permission === 'granted') {
// 				 window.addEventListener('devicemotion', handleMotion, true);
// 				 return true;
// 			 }
// 		 } catch (e) {
// 			 console.error("Sensor permission error", e);
// 		 }
// 	 } else {
// 		 // Android / Other browsers
// 		 window.addEventListener('devicemotion', handleMotion, true);
// 		 return true;
// 	 }
// 	 return false;
//  }
 
async function requestShakePermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission === 'granted') {
                // ถ้าอนุญาตแล้ว ให้เริ่มดักจับการเคลื่อนไหวทันที
                window.removeEventListener('devicemotion', handleMotion); // ลบตัวเก่ากันซ้ำ
                window.addEventListener('devicemotion', handleMotion, true);
                console.log("Motion Sensor: Granted");
                return true;
            }
        } catch (e) {
            console.error("Sensor permission error", e);
        }
    } else {
        // สำหรับ Android หรือ Browser อื่นๆ ที่ไม่ต้องขอ Permission
        window.removeEventListener('devicemotion', handleMotion);
        window.addEventListener('devicemotion', handleMotion, true);
        console.log("Motion Sensor: Active (Non-iOS)");
        return true;
    }
    return false;
}

 /**
  * RECEIVER MODE SETUP
  */
//  function setupReceiverMode(params) {
// 	 isOpening = false;
// 	 navigateTo('page-receiver');
	 
// 	 const sender = params.get('sender') || "เพื่อนของคุณ";
// 	 const giftId = params.get('giftId');
// 	 const msg = params.get('msg') || "ของขวัญแด่คนพิเศษ";
 
// 	 document.getElementById('rec-sender-name').innerText = sender;
	 
// 	 const product = PRODUCTS.find(p => p.id == giftId) || PRODUCTS[0];
// 	 document.getElementById('reveal-img').src = product.bgImg;
// 	 document.getElementById('reveal-msg').innerText = `"${msg}"`;
 
// 	 const giftContainer = document.getElementById('gift-container');
// 	 if (giftContainer) {
// 		 giftContainer.onclick = async (e) => {
// 			 e.preventDefault();
// 			 await requestShakePermission();
// 			 handleOpenGift();
// 		 };
// 	 }
// 	 const receiverPage = document.getElementById('page-receiver');
//     if (receiverPage) {
//         receiverPage.onclick = async () => {
//             // ถ้าเซนเซอร์ยังไม่ทำงาน ให้ขอสิทธิ์เมื่อคลิกที่ไหนก็ได้ในหน้านี้
//             await requestShakePermission();
//         };
//     }
//  }
 
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
							 { "type": "image", "url": openGift.jpg, "size": "full", "aspectRatio": "3:4", "aspectMode": "cover" },
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
 
 async function startWithSound() {
	await requestShakePermission();
	navigateTo('page-sender'); 
 }

 let isShaking = false;

// 1. ฟังก์ชันขออนุญาต (เรียกใช้เมื่อคลิกปุ่ม)
// ฟังก์ชันเรียกใช้ตอนเข้าหน้า Receiver
function setupReceiverMode(params) {
    isOpening = false;
    navigateTo('page-receiver');

    // แสดงหน้า Overlay สีดำเพื่อรอให้ผู้ใช้แตะ
    const overlay = document.getElementById('permission-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex'; // มั่นใจว่าแสดงผลแน่นอน
    }

    // เซ็ตข้อมูลผู้ส่ง/ข้อความ ตามเดิมของคุณ
    const sender = params.get('sender') || "เพื่อนของคุณ";
    const msg = params.get('msg') || "ของขวัญแด่คนพิเศษ";
    const giftId = params.get('giftId');
    
    document.getElementById('rec-sender-name').innerText = sender;
    const product = PRODUCTS.find(p => p.id == giftId) || PRODUCTS[0];
    document.getElementById('reveal-img').src = product.bgImg;
    document.getElementById('reveal-msg').innerText = `"${msg}"`;
}

// ฟังก์ชันเมื่อมีการแตะหน้าจอ
async function enableMotion() {
    // 1. ปิดหน้าสีดำทันที
    const overlay = document.getElementById('permission-overlay');
    if (overlay) overlay.style.display = 'none';

    // 2. ขอสิทธิ์ iOS Motion Sensor
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const response = await DeviceMotionEvent.requestPermission();
            if (response === 'granted') {
                startMotionListener();
            } else {
                alert("กรุณาอนุญาตการเข้าถึงเซนเซอร์เพื่อเล่นฟีเจอร์เขย่า");
            }
        } catch (e) {
            console.error("Permission request error:", e);
        }
    } else {
        // สำหรับ Android หรือ Browser อื่นๆ
        startMotionListener();
    }
}

function startMotionListener() {
    let lastAxl = 0;
    // ลบ Event เดิมก่อนเพื่อป้องกันการซ้อนกัน
    window.removeEventListener('devicemotion', handleMotionUpdate);
    window.addEventListener('devicemotion', handleMotionUpdate, true);
}

function handleMotionUpdate(event) {
    if (isOpening) return;
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    // ตรวจจับความแรง
    let currentAxl = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
    let diff = Math.abs(currentAxl - lastAxl);

    if (diff > 25) { // ปรับค่านี้ตามความยากง่ายที่ต้องการ
        handleOpenGift(); 
    }
    lastAxl = currentAxl;
}
 
 window.addEventListener('load', () => {
	 initSwipers();
	 startApp();
 });

 