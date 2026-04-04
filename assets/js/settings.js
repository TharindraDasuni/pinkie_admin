const SETTINGS_API_URL = "http://localhost:8080/api/settings";
let currentProfileImageBase64 = null; // පින්තූරය තියාගන්න Variable එක

document.addEventListener("DOMContentLoaded", function () {
    loadAdminSettings();

    // Image Upload Preview Logic
    document.getElementById('adminImageUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('admin-profile-img').src = event.target.result;
                currentProfileImageBase64 = event.target.result; // Data එක save කරගන්නවා
            }
            reader.readAsDataURL(file);
        }
    });

    // Notification Switch Auto-Save Events
    document.getElementById('toggle-order-alerts').addEventListener('change', updateNotificationSettings);
    document.getElementById('toggle-stock-alerts').addEventListener('change', updateNotificationSettings);
});

// 1. Data Database එකෙන් අරන් පෙන්නීම
async function loadAdminSettings() {
    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        const response = await fetch(SETTINGS_API_URL, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const data = result.data;
            
            // Email and Image
            document.getElementById('admin-email').value = data.email || "";
            if (data.profile_img) {
                document.getElementById('admin-profile-img').src = data.profile_img;
                currentProfileImageBase64 = data.profile_img;
            }

            // Notification Toggles
            document.getElementById('toggle-order-alerts').checked = data.newOrderAlerts !== false; 
            document.getElementById('toggle-stock-alerts').checked = data.lowStockAlerts !== false;
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

// 2. Profile Details Update kireema (Image eka witharai)
async function updateAdminProfile() {
    // Email eka ganna eka ain kala, mokada eka disable karala thiyenne
    
    // Image eka wenas wela nathnam update karanna deyak na
    if (!currentProfileImageBase64) {
        Swal.fire("Info", "Please select a new profile image to update.", "info");
        return;
    }

    Swal.fire({ title: 'Updating Profile...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        
        // Profile image eka witharak payload ekata daanawa
        const payload = { 
            profile_img: currentProfileImageBase64 
        };

        const response = await fetch(`${SETTINGS_API_URL}/profile`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated!',
                text: 'Your profile image has been updated.',
                confirmButtonColor: '#da5586',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire("Error", result.message || "Failed to update profile.", "error");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        Swal.fire("Error", "Connection failed.", "error");
    }
}

// 3. Password Update කිරීම
async function updatePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        Swal.fire("Error", "Please fill all password fields.", "error");
        return;
    }

    if (newPassword !== confirmPassword) {
        Swal.fire("Error", "New Password and Confirm Password do not match.", "error");
        return;
    }

    if (newPassword.length < 6) {
        Swal.fire("Error", "Password must be at least 6 characters long.", "error");
        return;
    }

    Swal.fire({ title: 'Updating Password...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        
        const response = await fetch(`${SETTINGS_API_URL}/password`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                currentPassword: currentPassword, 
                newPassword: newPassword 
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Password Changed!',
                text: 'Your password has been updated securely.',
                confirmButtonColor: '#28a745',
                timer: 2000,
                showConfirmButton: false
            });

            // Clear inputs after success
            document.getElementById('current-password').value = "";
            document.getElementById('new-password').value = "";
            document.getElementById('confirm-password').value = "";
        } else {
            Swal.fire("Error", result.message || "Incorrect current password.", "error");
        }
    } catch (error) {
        console.error("Error updating password:", error);
        Swal.fire("Error", "Connection failed.", "error");
    }
}

// 4. Notification Preferences Auto-Update කිරීම
async function updateNotificationSettings() {
    const newOrderAlerts = document.getElementById('toggle-order-alerts').checked;
    const lowStockAlerts = document.getElementById('toggle-stock-alerts').checked;

    try {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        
        const response = await fetch(`${SETTINGS_API_URL}/notifications`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                newOrderAlerts: newOrderAlerts,
                lowStockAlerts: lowStockAlerts 
            })
        });

        if (response.ok) {
            // Optional: You can show a small toast notification here
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
            Toast.fire({
                icon: 'success',
                title: 'Preferences Saved'
            });
        }
    } catch (error) {
        console.error("Error updating notifications:", error);
    }
}