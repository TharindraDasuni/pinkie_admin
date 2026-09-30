const firebaseConfig = {
    apiKey: "AIzaSyCeqraRKe9dRx0xYA-SK7Sxhy6j-dp7UKg",
    authDomain: "pinkie-ca292.firebaseapp.com",
    projectId: "pinkie-ca292",
    storageBucket: "pinkie-ca292.firebasestorage.app",
    messagingSenderId: "257811293132",
    appId: "1:257811293132:web:f045db302689e943113369",
    measurementId: "G-6TEZ28KKV7"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

let currentChatUserId = null;
let currentChatUserName = "";
let currentChatUserPhoto = "";
let unsubscribeMessages = null;
let userMessageListeners = {}; 
let globalUnreadCount = 0; 

const defaultAvatar = "https://ui-avatars.com/api/?background=DA5586&color=fff&name=";

const chatListContainer = document.getElementById('chatListContainer');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');
const noChatSelected = document.getElementById('noChatSelected');
const activeChatArea = document.getElementById('activeChatArea');


function loadChatUsers() {
    db.collection("users").where("role", "==", "customer").onSnapshot(snapshot => {
        snapshot.forEach(doc => {
            const user = doc.data();
            const userId = doc.id;
            const userName = `${user.firstName || 'Unknown'} ${user.lastName || ''}`.trim();
            const photoUrl = user.photoUrl && user.photoUrl.trim() !== "" ? user.photoUrl : (defaultAvatar + encodeURIComponent(userName));

            if (userMessageListeners[userId]) return;

            userMessageListeners[userId] = db.collection("chats").doc(userId).collection("messages")
                .orderBy("timestamp", "asc").onSnapshot(msgSnapshot => {
                    
                    let unreadCountForUser = 0;
                    let lastMsg = null;

                    msgSnapshot.forEach(msgDoc => {
                        const msgData = msgDoc.data();
                        lastMsg = msgData; 

                        if (msgData.senderId !== 'admin' && !msgData.readByAdmin) {
                            unreadCountForUser++;
                        }
                    });

                    if (currentChatUserId === userId && unreadCountForUser > 0) {
                        markMessagesAsRead(userId, msgSnapshot);
                        unreadCountForUser = 0;
                    }

                    updateGlobalUnreadCount();

                    const existingContact = document.getElementById(`contact-${userId}`);
                    if (existingContact) {
                        existingContact.remove();
                    }

                    if (lastMsg) {
                        const time = new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        let msgPreview = lastMsg.text;
                        if (lastMsg.type === 'product') {
                            msgPreview = lastMsg.orderId ? '📦 Sent an Order details' : '🛍️ Sent a Product details';
                        } else if (lastMsg.senderId === 'admin') {
                            msgPreview = 'You: ' + msgPreview;
                        }

                        const isActive = (currentChatUserId === userId) ? 'active bg-opacity-50' : 'bg-opacity-25';
                        
                        const unreadBadgeHtml = unreadCountForUser > 0 
                            ? `<span class="badge bg-pinkie rounded-pill ms-2">${unreadCountForUser}</span>` 
                            : '';

                        const userHtml = `
                            <div class="chat-contact p-3 mb-2 rounded-4 d-flex align-items-center bg-white ${isActive}" 
                                 id="contact-${userId}" 
                                 data-timestamp="${lastMsg.timestamp}"
                                 data-unread="${unreadCountForUser}"
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
                                <div class="text-end d-flex flex-column align-items-end">
                                    <small class="text-muted d-block mb-1" style="font-size: 10px;">${time}</small>
                                    ${unreadBadgeHtml}
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

function updateGlobalUnreadCount() {
    globalUnreadCount = 0;
    
    const contacts = document.querySelectorAll('.chat-contact');
    contacts.forEach(contact => {
        const count = parseInt(contact.getAttribute('data-unread') || 0);
        globalUnreadCount += count;
    });

    const commentIcon = document.querySelector('.fa-comment-dots');
    if (commentIcon) {
        const navbarBadge = commentIcon.nextElementSibling;
        if (navbarBadge && navbarBadge.tagName.toLowerCase() === 'span') {
            if (globalUnreadCount > 0) {
                navbarBadge.innerText = globalUnreadCount;
                navbarBadge.style.display = 'inline-block';
            } else {
                navbarBadge.style.display = 'none'; 
            }
        }
    }
}

function markMessagesAsRead(userId, snapshot) {
    const batch = db.batch();
    let hasUnread = false;

    snapshot.forEach(doc => {
        const msg = doc.data();
        if (msg.senderId !== 'admin' && !msg.readByAdmin) {
            const msgRef = db.collection("chats").doc(userId).collection("messages").doc(doc.id);
            batch.update(msgRef, { readByAdmin: true });
            hasUnread = true;
        }
    });

    if (hasUnread) {
        batch.commit().catch(err => console.error("Error marking as read: ", err));
    }
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
    updateGlobalUnreadCount(); 
}

window.openChat = function(userId, userName, photoUrl) {
    currentChatUserId = userId;
    currentChatUserName = userName;
    currentChatUserPhoto = photoUrl;

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
        
        const badge = activeContact.querySelector('.badge');
        if (badge) badge.remove();
        activeContact.setAttribute('data-unread', '0');
        updateGlobalUnreadCount();
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

            markMessagesAsRead(userId, snapshot);

            snapshot.forEach(doc => {
                const msg = doc.data();
                renderMessage(msg);
            });

            chatBody.scrollTop = chatBody.scrollHeight;
        });
}

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
        orderId: null,
        readByAdmin: true,
        readByCustomer: false
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

document.addEventListener("DOMContentLoaded", () => {
    loadChatUsers();
});


function listenForGlobalAdminNotifications() {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    
    const db = firebase.firestore();
    
    db.collection("admin_notifications")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
          let unreadCount = 0;
          let listHtml = '';
          const listBody = document.getElementById("notificationListBody");
          const badge = document.getElementById("adminNotifBadge");
          
          if (snapshot.empty) {
              if(listBody) listBody.innerHTML = '<div class="text-center p-4 text-muted"><small>No notifications yet</small></div>';
              if(badge) { badge.classList.add("d-none"); badge.style.display = "none"; }
              return;
          }

          snapshot.forEach((doc) => {
              const data = doc.data();
              const notifId = doc.id;
              
              if (!data.isRead) unreadCount++; 
              
              const timeStr = data.timestamp ? new Date(data.timestamp).toLocaleString() : '';
              
              const bgClass = data.isRead ? 'bg-white' : 'bg-light';
              const fwClass = data.isRead ? 'text-muted' : 'text-dark fw-bold';
              const dotHtml = data.isRead ? '' : '<span class="badge rounded-circle p-1 ms-2" style="background-color: #da5586;"></span>';
              
              listHtml += `
                  <a href="#" onclick="handleNotificationClick(event, '${notifId}', '${data.orderId}')" class="dropdown-item border-bottom px-4 py-3 ${bgClass}" style="white-space: normal; transition: 0.3s;">
                      <div class="d-flex align-items-center">
                          <div class="flex-grow-1">
                              <h6 class="mb-1 ${fwClass}" style="font-size: 14px;">${data.title}</h6>
                              <p class="mb-1 text-muted" style="font-size: 13px;">${data.message}</p>
                              <small class="text-muted" style="font-size: 11px;"><i class="far fa-clock me-1"></i>${timeStr}</small>
                          </div>
                          ${dotHtml}
                      </div>
                  </a>
              `;
          });
          
          if(listBody) listBody.innerHTML = listHtml;

          if (badge) {
              if (unreadCount > 0) {
                  badge.innerText = unreadCount;
                  badge.classList.remove("d-none");
                  badge.style.display = "inline-block";
              } else {
                  badge.classList.add("d-none");
                  badge.style.display = "none";
              }
          }
      }, (error) => {
          console.error("Global Notification Error: ", error);
      });
}

window.handleNotificationClick = function(event, notifId, orderId) {
    event.preventDefault(); 
    
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    const db = firebase.firestore();
    
    db.collection("admin_notifications").doc(notifId).update({ isRead: true })
      .then(() => {
          if(orderId) {
              window.location.href = `orders.html?search=${orderId}`;
          }
      }).catch(err => console.error("Error marking as read", err));
};

window.markAllNotificationsAsRead = function() {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    const db = firebase.firestore();
    
    db.collection("admin_notifications").where("isRead", "==", false).get().then(snapshot => {
        if(snapshot.empty) return;
        
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        return batch.commit();
    }).then(() => {
        console.log("All marked as read");
    }).catch(err => console.error("Error batch updating", err));
};

function initGlobalNotificationsWhenReady() {
    const checkExist = setInterval(function() {
        if (document.getElementById("adminNotifBadge") && typeof firebase !== 'undefined' && firebase.firestore) {
            clearInterval(checkExist); 
            listenForGlobalAdminNotifications(); 
        }
    }, 500); 
}

document.addEventListener("DOMContentLoaded", () => {
    initGlobalNotificationsWhenReady();
});