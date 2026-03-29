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
let unsubscribeMessages = null;
let userMessageListeners = {}; 

// Default Avatar URL (පින්තූරයක් නැත්නම් මේක පෙන්වයි)
const defaultAvatar = "https://ui-avatars.com/api/?background=DA5586&color=fff&name=";

// DOM Elements
const chatListContainer = document.getElementById('chatListContainer');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');
const noChatSelected = document.getElementById('noChatSelected');
const activeChatArea = document.getElementById('activeChatArea');

// =========================================================
// 1. Load Chat List
// =========================================================
function loadChatUsers() {
    db.collection("users").where("role", "==", "customer").onSnapshot(snapshot => {
        snapshot.forEach(doc => {
            const user = doc.data();
            const userId = doc.id;
            const userName = `${user.firstName || 'Unknown'} ${user.lastName || ''}`.trim();
            
            // පින්තූරයක් නැත්නම් නමේ මුල් අකුරු වලින් Avatar එකක් හදනවා
            const photoUrl = user.photoUrl && user.photoUrl.trim() !== "" ? user.photoUrl : (defaultAvatar + encodeURIComponent(userName));

            if (userMessageListeners[userId]) return;

            userMessageListeners[userId] = db.collection("chats").doc(userId).collection("messages")
                .orderBy("timestamp", "desc").limit(1).onSnapshot(msgSnapshot => {
                    
                    const existingContact = document.getElementById(`contact-${userId}`);
                    if (existingContact) {
                        existingContact.remove();
                    }

                    if (!msgSnapshot.empty) {
                        const lastMsg = msgSnapshot.docs[0].data();
                        const time = new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        let msgPreview = lastMsg.text;
                        if (lastMsg.type === 'product') {
                            msgPreview = lastMsg.orderId ? '📦 Sent an Order details' : '🛍️ Sent a Product details';
                        } else if (lastMsg.senderId === 'admin') {
                            msgPreview = 'You: ' + msgPreview;
                        }

                        const isActive = (currentChatUserId === userId) ? 'active bg-opacity-50' : 'bg-opacity-25';

                        const userHtml = `
                            <div class="chat-contact p-3 mb-2 rounded-4 d-flex align-items-center bg-white ${isActive}" 
                                 id="contact-${userId}" 
                                 data-timestamp="${lastMsg.timestamp}"
                                 style="cursor: pointer;"
                                 onclick="openChat('${userId}', '${userName}', '${photoUrl}')">
                                
                                <div class="position-relative">
                                    <img src="${photoUrl}" class="rounded-circle object-fit-cover" style="width: 45px; height: 45px;" alt="User">
                                    <span class="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style="width: 12px; height: 12px;"></span>
                                </div>
                                
                                <div class="ms-3 flex-grow-1 overflow-hidden">
                                    <h6 class="mb-0 fw-bold text-dark" style="font-size: 14px;">${userName}</h6>
                                    <small class="text-muted text-truncate d-block" style="font-size: 12px;">${msgPreview}</small>
                                </div>
                                <div class="text-end">
                                    <small class="text-muted d-block mb-1" style="font-size: 10px;">${time}</small>
                                </div>
                            </div>
                        `;
                        
                        chatListContainer.insertAdjacentHTML('beforeend', userHtml);
                        sortChatList();
                    }
                });
        });
    });
}

function sortChatList() {
    const items = Array.from(chatListContainer.children);
    items.sort((a, b) => {
        const timeA = parseInt(a.getAttribute('data-timestamp') || 0);
        const timeB = parseInt(b.getAttribute('data-timestamp') || 0);
        return timeB - timeA; 
    });
    chatListContainer.innerHTML = '';
    items.forEach(item => chatListContainer.appendChild(item));
}

// =========================================================
// 2. Open Selected Chat
// =========================================================
window.openChat = function(userId, userName, photoUrl) {
    currentChatUserId = userId;
    currentChatUserName = userName;
    currentChatUserPhoto = photoUrl;

    // Placeholder එක හංගලා Chat Area එක පෙන්වනවා
    noChatSelected.classList.add('d-none');
    activeChatArea.classList.remove('d-none');
    activeChatArea.classList.add('d-flex');

    document.querySelectorAll('.chat-contact').forEach(el => {
        el.classList.remove('active', 'bg-opacity-50');
        el.classList.add('bg-opacity-25');
    });
    const activeContact = document.getElementById(`contact-${userId}`);
    if (activeContact) {
        activeContact.classList.remove('bg-opacity-25');
        activeContact.classList.add('active', 'bg-opacity-50');
    }

    document.getElementById('chatHeaderName').innerText = userName;
    document.getElementById('chatHeaderImg').src = photoUrl;

    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    unsubscribeMessages = db.collection("chats").doc(userId).collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
            chatBody.innerHTML = ''; 

            snapshot.forEach(doc => {
                const msg = doc.data();
                renderMessage(msg);
            });

            chatBody.scrollTop = chatBody.scrollHeight;
        });
}

// =========================================================
// 3. Render Messages
// =========================================================
function renderMessage(msg) {
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let msgHtml = '';

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
// 4. Send Message
// =========================================================
window.sendMessage = function(event) {
    event.preventDefault(); 

    if (!currentChatUserId) {
        Swal.fire("Error", "Please select a chat first!", "error");
        return;
    }

    const text = messageInput.value.trim();
    if (text === "") return;

    const msgId = db.collection("chats").doc(currentChatUserId).collection("messages").doc().id;

    const chatMessage = {
        id: msgId,
        senderId: "admin", 
        text: text,
        timestamp: Date.now(),
        type: "text",
        productId: null,
        productTitle: null,
        productPrice: 0.0,
        productImage: null,
        orderId: null
    };

    db.collection("chats").doc(currentChatUserId).collection("messages").doc(msgId).set(chatMessage)
        .then(() => {
            messageInput.value = ''; 
            chatBody.scrollTop = chatBody.scrollHeight; 
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
    loadChatUsers();
});