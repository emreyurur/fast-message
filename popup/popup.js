let socket;
let currentUserId = null;

// Console log fonksiyonu - hem console hem log box'a yazar
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('tr-TR');
  const fullMessage = `[${timestamp}] ${message}`;
  
  // Console'a yaz
  if (type === 'error') {
    console.error(fullMessage);
  } else if (type === 'warn') {
    console.warn(fullMessage);
  } else {
    console.log(fullMessage);
  }
  
  // Log box'a yaz
  const logBox = document.getElementById("logBox");
  logBox.textContent += fullMessage + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

// Status güncelleme
function setStatus(online) {
  const indicator = document.getElementById("status-indicator");
  const statusText = document.getElementById("status-text");
  
  if (online) {
    indicator.className = "status online";
    statusText.textContent = "Bağlı";
    log("✅ WebSocket bağlantısı başarılı");
  } else {
    indicator.className = "status offline";
    statusText.textContent = "Bağlantı yok";
    log("❌ WebSocket bağlantısı koptu", 'error');
  }
}

// Mesaj ekleme
function addMessage(text, type = 'info') {
  const messagesDiv = document.getElementById("messages");
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-item";
  
  const messageText = document.createElement("div");
  messageText.className = "message-text";
  messageText.textContent = text;
  
  if (type === 'sent') {
    messageText.style.color = '#2ecc71';
  } else if (type === 'received') {
    messageText.style.color = '#3498db';
  } else if (type === 'error') {
    messageText.style.color = '#e74c3c';
  } else {
    messageText.style.color = '#333';
  }
  
  // Kopyalama butonu
  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "📋";
  copyBtn.title = "Mesajı kopyala";
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    copyToClipboard(text);
  };
  
  // Mesaja tıklayınca da kopyala
  messageContainer.onclick = () => {
    copyToClipboard(text);
  };
  
  messageContainer.appendChild(messageText);
  messageContainer.appendChild(copyBtn);
  messagesDiv.appendChild(messageContainer);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Kopyalama fonksiyonu
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log("📋 Mesaj kopyalandı:", text);
    showCopyNotification();
  }).catch(err => {
    console.error("❌ Kopyalama hatası:", err);
    // Fallback yöntemi
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopyNotification();
  });
}

// Kopyalama bildirimi
function showCopyNotification() {
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.textContent = '✅ Kopyalandı!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// Alıcıları kaydet/yükle
function saveReceivers(receivers) {
  localStorage.setItem('receivers', JSON.stringify(receivers));
  console.log("💾 Alıcılar kaydedildi:", receivers);
}

function loadReceivers() {
  const saved = localStorage.getItem('receivers');
  const receivers = saved ? JSON.parse(saved) : [];
  console.log("📂 Alıcılar yüklendi:", receivers);
  return receivers;
}

function updateReceiverSelect() {
  const select = document.getElementById("receiverSelect");
  const receivers = loadReceivers();
  
  // Mevcut seçimi koru
  const currentValue = select.value;
  
  // Dropdown'u temizle ve yeniden doldur
  select.innerHTML = '<option value="">Alıcı seçin...</option>';
  
  receivers.forEach(receiver => {
    const option = document.createElement("option");
    option.value = receiver;
    option.textContent = receiver;
    select.appendChild(option);
  });
  
  // Önceki seçimi geri yükle
  if (currentValue && receivers.includes(currentValue)) {
    select.value = currentValue;
  }
  
  console.log("🔄 Alıcı listesi güncellendi. Toplam:", receivers.length);
}

// Chat başlat
function startChat(userId) {
  currentUserId = userId;
  
  console.log("═══════════════════════════════════════════");
  console.log("🚀 WEBSOCKET BAĞLANTISI BAŞLATILIYOR");
  console.log("═══════════════════════════════════════════");
  console.log("👤 Kullanıcı ID:", userId);
  console.log("🌐 Sunucu:", "https://batuhantekin.icu");
  console.log("🔗 WebSocket URL:", `wss://batuhantekin.icu/wschat?userId=${userId}`);
  console.log("═══════════════════════════════════════════");
  
  log(`🚀 ${userId} olarak bağlanılıyor...`);
  log(`🔗 Bağlantı URL'si: wss://batuhantekin.icu/wschat?userId=${userId}`);
  
  // Socket.IO bağlantısı
  socket = io("https://batuhantekin.icu", {
    path: "/socket.io",
    query: { userId: userId },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  console.log("⚙️ Socket.IO yapılandırması:", {
    path: "/socket.io/",
    query: { userId: userId },
    transports: ['websocket'],
    reconnection: true
  });

  // Bağlantı olayları
  socket.on("connect", () => {
    console.log("╔════════════════════════════════════════╗");
    console.log("║  ✅ WEBSOCKET BAĞLANTISI BAŞARILI!     ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("🆔 Socket ID:", socket.id);
    console.log("👤 User ID:", currentUserId);
    console.log("🔗 Bağlı:", socket.connected);
    console.log("═══════════════════════════════════════════");
    
    setStatus(true);
    log(`🔗 Socket ID: ${socket.id}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("╔════════════════════════════════════════╗");
    console.log("║  ❌ WEBSOCKET BAĞLANTISI KOPTU!        ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("❌ Kopma nedeni:", reason);
    console.log("═══════════════════════════════════════════");
    
    setStatus(false);
    log(`❌ Bağlantı kopma nedeni: ${reason}`, 'error');
  });

  socket.on("connect_error", (error) => {
    console.error("╔════════════════════════════════════════╗");
    console.error("║  ❌ BAĞLANTI HATASI!                   ║");
    console.error("╚════════════════════════════════════════╝");
    console.error("❌ Hata detayı:", error);
    console.error("❌ Hata mesajı:", error.message);
    console.error("═══════════════════════════════════════════");
    
    log(`❌ Bağlantı hatası: ${error.message}`, 'error');
    setStatus(false);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Yeniden bağlanma denemesi #${attemptNumber}`);
    log(`🔄 Yeniden bağlanma denemesi #${attemptNumber}`, 'warn');
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`✅ Yeniden bağlanıldı! (Deneme sayısı: ${attemptNumber})`);
    log(`✅ Yeniden bağlanıldı (Deneme: ${attemptNumber})`);
    setStatus(true);
  });

  // Backend'den gelen eventler
  
  // messages eventi - gelen mesajlar
  socket.on("messages", (data) => {
    console.log("╔════════════════════════════════════════╗");
    console.log("║  📩 GELEN MESAJ!                       ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("📦 Raw Data:", data);
    console.log("👤 Gönderen:", data?.from);
    console.log("💬 Mesaj:", data?.message);
    console.log("═══════════════════════════════════════════");
    
    if (data && data.from && data.message) {
      addMessage(`📩 ${data.from}: ${data.message}`, 'received');
      log(`📩 ${data.from} → ${data.message}`);
    } else {
      console.warn("⚠️ BEKLENMEYEN MESAJ FORMATI!");
      console.warn("⚠️ Gelen data:", data);
      log(`⚠️ Beklenmeyen mesaj formatı: ${JSON.stringify(data)}`, 'warn');
    }
  });

  // error eventi - hatalar
  socket.on("error", (error) => {
    console.error("╔════════════════════════════════════════╗");
    console.error("║  ❌ BACKEND HATASI!                    ║");
    console.error("╚════════════════════════════════════════╝");
    console.error("❌ Hata detayı:", error);
    console.error("❌ Hata tipi:", typeof error);
    console.error("═══════════════════════════════════════════");
    
    const errorMessage = error?.message || error || "Bilinmeyen hata";
    addMessage(`❌ Hata: ${errorMessage}`, 'error');
    log(`❌ Backend hatası: ${JSON.stringify(error)}`, 'error');
  });

  // users eventi - aktif kullanıcılar
  socket.on("users", (users) => {
    console.log("╔════════════════════════════════════════╗");
    console.log("║  👥 AKTİF KULLANICILAR                 ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("📦 Raw Data:", users);
    console.log("👥 Kullanıcı sayısı:", Array.isArray(users) ? users.length : "Array değil!");
    console.log("👥 Kullanıcılar:", users);
    console.log("═══════════════════════════════════════════");
    
    log(`👥 Aktif kullanıcılar: ${JSON.stringify(users)}`);
  });

  // Tüm eventleri dinle (debug için)
  socket.onAny((eventName, ...args) => {
    console.log(`🎯 Event alındı: "${eventName}"`, args);
  });
}

// Login
document.getElementById("loginBtn").addEventListener("click", () => {
  const userId = document.getElementById("userIdInput").value.trim();
  if (!userId) {
    alert("Kullanıcı ID'si giriniz!");
    return;
  }
  
  console.log("🔐 LOGIN İŞLEMİ BAŞLATILDI");
  console.log("👤 User ID:", userId);
  
  localStorage.setItem("userId", userId);
  console.log("💾 User ID localStorage'a kaydedildi");
  
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("chat-screen").classList.remove("hidden");
  document.getElementById("myUserId").textContent = userId;
  
  updateReceiverSelect();
  startChat(userId);
});

// Alıcı ekle
document.getElementById("addReceiverBtn").addEventListener("click", () => {
  const newReceiver = document.getElementById("newReceiver").value.trim();
  if (!newReceiver) {
    alert("Alıcı ID giriniz!");
    return;
  }
  
  console.log("➕ Yeni alıcı ekleniyor:", newReceiver);
  
  const receivers = loadReceivers();
  if (receivers.includes(newReceiver)) {
    alert("Bu alıcı zaten ekli!");
    console.warn("⚠️ Bu alıcı zaten listede:", newReceiver);
    return;
  }
  
  receivers.push(newReceiver);
  saveReceivers(receivers);
  updateReceiverSelect();
  
  // Yeni eklenen alıcıyı seç
  document.getElementById("receiverSelect").value = newReceiver;
  document.getElementById("newReceiver").value = "";
  
  log(`➕ Yeni alıcı eklendi: ${newReceiver}`);
});

// Mesaj gönder
document.getElementById("sendBtn").addEventListener("click", () => {
  const message = document.getElementById("messageInput").value.trim();
  const receiver = document.getElementById("receiverSelect").value;
  
  if (!receiver) {
    alert("Alıcı seçiniz!");
    return;
  }
  if (!message) {
    alert("Mesaj yazınız!");
    return;
  }
  
  if (!socket || !socket.connected) {
    alert("WebSocket bağlantısı yok! Lütfen bekleyin veya sayfayı yenileyin.");
    console.error("❌ WebSocket bağlı değil! socket.connected =", socket?.connected);
    return;
  }
  
  // Backend dokümantasyonuna göre mesaj gönder
  const messageData = {
    to: receiver,
    message: message
  };
  
  console.log("╔════════════════════════════════════════╗");
  console.log("║  📤 MESAJ GÖNDERİLİYOR!                ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("👤 Gönderen:", currentUserId);
  console.log("👤 Alıcı:", receiver);
  console.log("💬 Mesaj:", message);
  console.log("📦 Gönderilen data:", messageData);
  console.log("🔗 Socket bağlı mı?", socket.connected);
  console.log("🆔 Socket ID:", socket.id);
  console.log("═══════════════════════════════════════════");
  
  socket.emit("message", messageData);
  console.log("✅ Mesaj emit edildi!");
  
  addMessage(`📤 Siz → ${receiver}: ${message}`, 'sent');
  log(`📤 → ${receiver}: ${message}`);
  document.getElementById("messageInput").value = "";
});

// Enter ile gönder
document.getElementById("messageInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    console.log("⌨️ Enter tuşuna basıldı, mesaj gönderiliyor...");
    document.getElementById("sendBtn").click();
  }
});

// Settings toggle
document.getElementById("settings-btn").addEventListener("click", () => {
  document.getElementById("settings-panel").classList.toggle("hidden");
  console.log("⚙️ Settings panel toggle edildi");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
    console.log("🚪 Çıkış yapılıyor...");
    localStorage.removeItem("userId");
    console.log("🗑️ User ID localStorage'dan silindi");
    
    if (socket) {
      console.log("🔌 WebSocket bağlantısı kapatılıyor...");
      socket.disconnect();
    }
    location.reload();
  }
});

// Auto login
window.addEventListener("load", () => {
  console.log("🔄 Sayfa yüklendi, auto-login kontrol ediliyor...");
  
  const savedUser = localStorage.getItem("userId");
  if (savedUser) {
    console.log("✅ Kaydedilmiş kullanıcı bulundu:", savedUser);
    console.log("🔐 Otomatik giriş yapılıyor...");
    
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("chat-screen").classList.remove("hidden");
    document.getElementById("myUserId").textContent = savedUser;
    updateReceiverSelect();
    startChat(savedUser);
  } else {
    console.log("ℹ️ Kaydedilmiş kullanıcı bulunamadı. Login ekranı gösteriliyor.");
  }
});