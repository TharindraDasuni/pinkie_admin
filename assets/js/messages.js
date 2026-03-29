// =========================================================
// Firebase Initialization (ඔයාගේ Firebase Config එක මෙතනට දාන්න)
// =========================================================
const firebaseConfig = {

    apiKey: "AIzaSyCeqraRKe9dRx0xYA-SK7Sxhy6j-dp7UKg",
    authDomain: "pinkie-ca292.firebaseapp.com",
    projectId: "pinkie-ca292",
    storageBucket: "pinkie-ca292.firebasestorage.app",
    messagingSenderId: "257811293132",
    appId: "1:257811293132:web:f045db302689e943113369",
    measurementId: "G-6TEZ28KKV7"

  };


// Firebase Initialize වී නොමැති නම් පමණක් Initialize කරන්න
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// =========================================================
// Global Variables
// =========================================================
let currentChatUserId = null;
let currentChatUserName = "";
let currentChatUserPhoto = "";
let unsubscribeMessages = null; // වෙනත් Chat එකකට යද්දී පරණ එකේ Listener එක නවත්තන්න

// DOM Elements
const chatListContainer = document.querySelector('.chat-list-container');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');

// =========================================================
// 1. Load Chat List (වම් පැත්තේ පාරිභෝගිකයන්ගේ ලැයිස්තුව)
// =========================================================
function loadChatUsers() {
    db.collection("users").where("role", "==", "customer").onSnapshot(snapshot => {
        chatListContainer.innerHTML = ''; // පරණ ඒවා මකනවා

        snapshot.forEach(doc => {
            const user = doc.data();
            const userId = doc.id;
            const photoUrl = user.photoUrl || 'assets/images/placeholder.jpg';
            const userName = `${user.firstName} ${user.lastName}`;

            // HTML එකේ තිබුණ .chat-contact Design එකමයි
            const userHtml = `
                <div class="chat-contact p-3 mb-2 rounded-4 d-flex align-items-center bg-white bg-opacity-25" 
                     id="contact-${userId}" 
                     style="cursor: pointer;"
                     onclick="openChat('${userId}', '${userName}', '${photoUrl}')">
                    
                    <div class="position-relative">
                        <img src="${photoUrl}" class="rounded-circle object-fit-cover" style="width: 45px; height: 45px;" alt="User">
                        <span class="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style="width: 12px; height: 12px;"></span>
                    </div>
                    
                    <div class="ms-3 flex-grow-1 overflow-hidden">
                        <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${userName}</h6>
                        <small class="text-muted text-truncate d-block" id="last-msg-${userId}" style="font-size: 12px;">Click to view messages</small>
                    </div>
                </div>
            `;
            chatListContainer.innerHTML += userHtml;
            
            // (Optional) අන්තිම මැසේජ් එක පෙන්නන්න ඕනේ නම් මෙතනින් වෙනම Query එකක් ගහන්න පුළුවන්
        });
    });
}

// =========================================================
// 2. Open Selected Chat (දකුණු පැත්තේ Chat එක Load කිරීම)
// =========================================================
window.openChat = function(userId, userName, photoUrl) {
    currentChatUserId = userId;
    currentChatUserName = userName;
    currentChatUserPhoto = photoUrl;

    // වම් පැත්තේ Active Class එක මාරු කිරීම
    document.querySelectorAll('.chat-contact').forEach(el => {
        el.classList.remove('active', 'bg-opacity-50');
        el.classList.add('bg-opacity-25');
    });
    const activeContact = document.getElementById(`contact-${userId}`);
    if (activeContact) {
        activeContact.classList.remove('bg-opacity-25');
        activeContact.classList.add('active', 'bg-opacity-50');
    }

    // උඩ Header එකේ නම සහ පින්තූරය මාරු කිරීම
    document.querySelector('.col-lg-8 h6.fw-bold.text-dark').innerText = userName;
    document.querySelector('.col-lg-8 img.rounded-circle').src = photoUrl;

    // පරණ Listener එකක් තියෙනවා නම් ඒක අයින් කරනවා
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    // Real-time මැසේජ් ලෝඩ් කිරීම
    unsubscribeMessages = db.collection("chats").doc(userId).collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
            chatBody.innerHTML = ''; // පරණ මැසේජ් මකනවා

            snapshot.forEach(doc => {
                const msg = doc.data();
                renderMessage(msg);
            });

            // අලුත් මැසේජ් එකක් ආවම යටටම Scroll කරනවා
            chatBody.scrollTop = chatBody.scrollHeight;
        });
}

// =========================================================
// 3. Render Messages (HTML එකට මැසේජ් ඇඳීම)
// =========================================================
function renderMessage(msg) {
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let msgHtml = '';

    // Admin ගේ මැසේජ් එකක් නම් (දකුණු පැත්ත)
    if (msg.senderId === 'admin' || msg.type === 'admin') {
        msgHtml = `
            <div class="d-flex justify-content-end mb-2">
                <div class="chat-bubble chat-bubble-admin">
                    ${msg.text}
                    <div class="text-end mt-1" style="font-size: 10px; opacity: 0.8;">${time}</div>
                </div>
            </div>
        `;
    } 
    // Customer එවපු Product Card එකක් නම් (වම් පැත්ත)
    else if (msg.type === 'product') {
        const orderText = msg.orderId ? `<small class="d-block text-muted" style="font-size: 11px;">(Order: #${msg.orderId})</small>` : '';
        const imgUrl = msg.productImage || 'assets/images/placeholder.jpg';
        
        msgHtml = `
            <div class="d-flex justify-content-start mb-2">
                <div>
                    <div class="chat-bubble chat-bubble-customer shadow-sm">
                        ${msg.text}
                        <div class="text-end mt-1" style="font-size: 10px; color: #999;">${time}</div>
                    </div>
                    
                    <div class="chat-product-card shadow-sm mt-2" style="background: white; padding: 12px; border-radius: 12px;">
                        <h6 class="fw-bold text-dark mb-2" style="font-size: 13px;">${msg.orderId ? 'Order Information' : 'Product Information'}</h6>
                        <div class="d-flex align-items-center">
                            <img src="${imgUrl}" class="chat-product-img me-3" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                            <div>
                                <small class="fw-bold text-dark" style="font-size: 12px;">${msg.productTitle}</small>
                                ${orderText}
                                <div class="mt-1">
                                    <small class="text-muted">Price: </small>
                                    <small class="fw-bold text-dark">Rs. ${msg.productPrice}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } 
    // Customer ගේ සාමාන්‍ය මැසේජ් එකක් නම් (වම් පැත්ත)
    else {
        msgHtml = `
            <div class="d-flex justify-content-start mb-2">
                <div class="chat-bubble chat-bubble-customer shadow-sm">
                    ${msg.text}
                    <div class="text-end mt-1" style="font-size: 10px; color: #999;">${time}</div>
                </div>
            </div>
        `;
    }

    chatBody.innerHTML += msgHtml;
}

// =========================================================
// 4. Send Message (Admin පැත්තෙන් මැසේජ් යැවීම)
// =========================================================
window.sendMessage = function(event) {
    event.preventDefault(); // Page එක Refresh වෙන එක නවත්වනවා

    if (!currentChatUserId) {
        Swal.fire("Error", "Please select a chat first!", "error");
        return;
    }

    const text = messageInput.value.trim();
    if (text === "") return;

    const msgId = db.collection("chats").doc(currentChatUserId).collection("messages").doc().id;

    const chatMessage = {
        id: msgId,
        senderId: "admin", // Admin කියලා අඳුරගන්න
        text: text,
        timestamp: Date.now(),
        type: "text",
        productId: null,
        productTitle: null,
        productPrice: 0.0,
        productImage: null,
        orderId: null
    };

    // Firebase එකට යවනවා
    db.collection("chats").doc(currentChatUserId).collection("messages").doc(msgId).set(chatMessage)
        .then(() => {
            messageInput.value = ''; // TextBox එක හිස් කරනවා
            chatBody.scrollTop = chatBody.scrollHeight; // යටටම Scroll කරනවා
        })
        .catch(error => {
            console.error("Error sending message: ", error);
            Swal.fire("Error", "Failed to send message.", "error");
        });
}

// =========================================================
// Initialize
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    // Firebase Scripts කලින් HTML එකේ Include කරලා තියෙන්න ඕනේ.
    // උදා: <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js"></script>
    //      <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore-compat.js"></script>
    
    loadChatUsers();
});