// 1. GLOBAL STATE
let finalData = {
    to: "",
    from: "",
    msg: "",
    img: "",
    name: ""
};
const MY_LIFF_ID = '2008756827-zANFfOMQ';

// 2. INITIALIZATION
async function initApp() {
    try {
        await liff.init({ liffId: MY_LIFF_ID });
        if (!liff.isLoggedIn()) {
            // หากยังไม่ได้ Login ให้เด้งไปหน้า Login ของ LINE
            // liff.login(); 
        }
        
        initSliderLogic();
        initMessageSelection();
        console.log("LIFF Initialized");
    } catch (error) {
        console.error("LIFF Initialization failed", error);
    }
}

// 3. SLIDER LOGIC (รองรับทั้ง Click และ Swipe)
// เก็บข้อมูลสินค้าที่เลือกไว้ในตัวแปร Global เพื่อไปใช้ต่อในหน้าสรุป

function initSliderLogic() {
    const slider = document.getElementById('giftSlider');
    const cards = document.querySelectorAll('.gift-card');

    if (!slider || cards.length === 0) return;

    const selectProduct = (target) => {
        cards.forEach(c => c.classList.remove('active'));
        target.classList.add('active');
        
        // บันทึกข้อมูลเข้า Global State ทันที
        finalData.name = target.getAttribute('data-name');
        finalData.img = target.querySelector('img').src;
        console.log("Selected:", finalData.name);
    };

    // --- ส่วนที่เพิ่ม: บังคับเลือกชิ้นแรกทันทีที่โหลด ---
    // ตรวจสอบก่อนว่ายังไม่มีชิ้นไหนถูกเลือก (ป้องกันการ reset ค่าขณะสไลด์)
    if (!finalData.name) {
        selectProduct(cards[0]); 
    }

    // --- ระบบ Observer เดิม ---
    const observerOptions = {
        root: slider,
        threshold: 0.6, 
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        if (window.innerWidth < 768) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    selectProduct(entry.target);
                }
            });
        }
    }, observerOptions);

    cards.forEach(card => {
        observer.observe(card);
        // ระบบคลิกสำหรับ Desktop
        card.addEventListener('click', function() {
            if (window.innerWidth >= 768) {
                selectProduct(this);
            } else {
                this.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }
        });
    });
}

// เรียกใช้งานเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', initSliderLogic);

// ฟังก์ชันสำหรับจัดการการเลือก (Visual + Data)
function selectCard(cardElement) {
    const cards = document.querySelectorAll('.gift-card');
    cards.forEach(c => c.classList.remove('active'));
    
    cardElement.classList.add('active');
    
    // บันทึกข้อมูล
    finalData.img = cardElement.querySelector('img').src;
    finalData.name = cardElement.getAttribute('data-name');
    
    console.log("Selected Item:", finalData.name);
}

// 4. MESSAGE SELECTION (Chips)
function initMessageSelection() {
    const chips = document.querySelectorAll('.msg-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            chips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            finalData.msg = this.getAttribute('data-msg');
        });
    });
}

// 5. NAVIGATION & SUMMARY
function showSummary() {
    const to = document.getElementById('toName').value.trim();
    const from = document.getElementById('fromName').value.trim();

    if (!to || !from || !finalData.msg || !finalData.img) {
        alert("กรุณากรอกชื่อผู้รับ-ผู้ส่ง และเลือกของขวัญ/ข้อความให้ครบถ้วน");
        return;
    }

    finalData.to = to;
    finalData.from = from;

    const summaryDiv = document.getElementById('summary-content');
    summaryDiv.innerHTML = `
        <div class="card p-3 border-0 shadow-sm rounded-4 text-center">
            <img src="${finalData.img}" class="img-fluid rounded-3 mb-3 mx-auto" style="max-height: 180px;">
            <p class="fw-bold mb-1">ของขวัญ: ${finalData.name}</p>
            <hr>
            <p class="mb-1"><strong>ถึง:</strong> ${finalData.to}</p>
            <p class="text-primary italic">"${finalData.msg}"</p>
            <p class="text-muted small"><strong>จาก:</strong> ${finalData.from}</p>
        </div>
    `;

    navigateTo('page-summary');
}

// 6. SEND TO LINE (ฟังก์ชันส่งข้อความหาเพื่อน)
async function sendToLine() {
    // 1. เช็คว่า LIFF ID ถูกต้องและโหลดเสร็จไหม
    if (!liff.isInitialized()) {
        alert("LIFF ยังไม่พร้อม (Is it initialized?)");
        return;
    }

    // 2. เช็คการ Login (บางครั้ง SharePicker ต้องการให้ Login ก่อน)
    if (!liff.isLoggedIn()) {
        alert("กำลังพาไป Login...");
        liff.login();
        return;
    }

    // 3. ตรวจสอบ API แบบเข้มงวด
    const canShare = await liff.isApiAvailable('shareTargetPicker');
    if (!canShare) {
        alert("API shareTargetPicker ไม่พร้อมใช้งาน!\n\nสาเหตุที่เป็นไปได้:\n1. ยังไม่ได้เปิด Scope ใน Console\n2. คุณไม่ได้เปิดผ่านแอป LINE\n3. URL ไม่ตรงกับ Endpoint");
        return;
    }

    // 4. ลองส่งข้อความแบบ Simple Text ก่อน (เพื่อดูว่า Picker เด้งไหม)
    try {
        const result = await liff.shareTargetPicker([
            {
                "type": "text",
                "text": "ทดสอบส่งข้อความ"
            }
        ]);
        
        if (result) {
            alert("แชร์สำเร็จ!");
            liff.closeWindow();
        } else {
            console.log("คุณกดยกเลิก");
        }
    } catch (error) {
        // นี่คือจุดที่จะบอกว่าทำไมไม่ได้
        alert("Error เจาะจง: " + error.code + " - " + error.message);
        console.error(error);
    }
}



function navigateTo(pageId) {
    // 1. หาหน้าปัจจุบันที่กำลังแสดงอยู่ (ที่มีคลาส active-page)
    const currentPage = document.querySelector('section:not(.d-none)');
    const targetPage = document.getElementById(pageId);

    if (targetPage) {
        // 2. ซ่อนหน้าปัจจุบันทั้งหมด
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('d-none');
            section.classList.remove('active-page');
        });

        // 3. แสดงหน้าเป้าหมาย
        targetPage.classList.remove('d-none');
        
        // 4. ถ้าเป็นหน้าแรก (page-home) ให้ใส่ active-page เพื่อโชว์พื้นหลัง
        // แต่ถ้าเป็นหน้าเลือก (page-select) เราจะเอาพื้นหลังออกเพื่อให้ดูสะอาดตา
        if (pageId === 'page-home') {
            targetPage.classList.add('active-page');
        }

        // 5. กรณีไปหน้าเลือกสินค้า ให้โหลดระบบ Slider ใหม่เพื่อให้ปัดได้แม่นยำ
        if (pageId === 'page-select') {
            setTimeout(() => {
                initSliderLogic(); // ฟังก์ชันที่เราเขียนไว้ตรวจจับการปัด
            }, 100);
        }
    }
}

let shakeThreshold = 15; // ความแรงในการเขย่า
let lastX, lastY, lastZ;

// ฟังก์ชันเริ่มต้นหน้าจอ Unboxing
function startUnboxingFlow(customMsg) {
    const overlay = document.getElementById('unboxing-overlay');
    const msgTag = document.getElementById('custom-unboxing-msg');
    
    if (customMsg) msgTag.innerText = customMsg;
    overlay.classList.remove('d-none');

    // ขออนุญาตใช้งาน Sensor สำหรับ iOS 13+
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleShake);
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('devicemotion', handleShake);
    }
}

// function handleShake(event) {
//     let acceleration = event.accelerationIncludingGravity;
//     let deltaX = Math.abs(lastX - acceleration.x);
//     let deltaY = Math.abs(lastY - acceleration.y);
//     let deltaZ = Math.abs(lastZ - acceleration.z);

//     if (deltaX + deltaY + deltaZ > shakeThreshold) {
//         revealGift(); 
//     }

//     lastX = acceleration.x;
//     lastY = acceleration.y;
//     lastZ = acceleration.z;
// }

// function revealGift() {
//     window.removeEventListener('devicemotion', handleShake);
//     const giftImg = document.getElementById('shaking-gift');
    
  
//     giftImg.classList.add('open-gift-animation');
    
//     setTimeout(() => {
//         document.getElementById('unboxing-overlay').classList.add('d-none');
//         showSummary(); 
//     }, 1000);
// }

// เรียกใช้งานเมื่อโหลดเสร็จ
window.onload = initApp;