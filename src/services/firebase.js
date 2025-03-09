import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// 🔥 Pegue sua VAPID Key correta no Firebase Cloud Messaging
const VAPID_KEY = "BEpJxcQJzML7O4TzRzLFNUWvtBlb6M9mb8e5rpHzhP0YPo8FFF5QGtSeykqW_4vLGYlefNlwORjozoMcoubz6RM"; // Substitua pela chave correta

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔥 Função para registrar e ativar o Service Worker antes de pedir o Token
export const registrarServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("⚠️ O navegador não suporta Service Workers.");
    return null;
  }

  try {
    console.log("🔄 Registrando Service Worker...");
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    console.log("✅ Service Worker registrado com sucesso!", registration);

    // 🔄 Esperar o Service Worker estar totalmente ativo antes de continuar
    await new Promise((resolve) => {
      if (registration.active) {
        console.log("🚀 Service Worker já ativo!");
        resolve();
      } else {
        console.log("⏳ Aguardando Service Worker ativar...");
        registration.installing?.addEventListener("statechange", (event) => {
          if (event.target.state === "activated") {
            console.log("🚀 Service Worker agora está ativado!");
            resolve();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error("❌ Erro ao registrar Service Worker:", error);
    return null;
  }
};

// 🔥 Pedir permissão de notificação e obter Token FCM
export const pedirPermissaoNotificacao = async () => {
  try {
    console.log("🔄 Aguardando Service Worker estar pronto...");
    const registration = await registrarServiceWorker();
    
    if (!registration) {
      console.error("❌ Service Worker não registrado. Notificações não funcionarão.");
      return null;
    }

    console.log("📡 Obtendo Token FCM...");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("🔑 Token FCM gerado:", token);
      return token;
    } else {
      console.warn("⚠️ Nenhum token FCM foi gerado.");
      return null;
    }
  } catch (error) {
    console.error("❌ Erro ao obter permissão de notificação:", error);
    return null;
  }
};

// 🔥 Escutar notificações em primeiro plano
onMessage(messaging, (payload) => {
  console.log("📢 Notificação recebida:", payload);
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icone.png",
  });
});

// 🔥 Função para enviar uma notificação manualmente
export const enviarNotificacao = (titulo, mensagem) => {
  if (Notification.permission === "granted") {
    new Notification(titulo, { body: mensagem, icon: "/icone.png" });
    console.log("📢 Notificação enviada:", titulo, mensagem);
  } else {
    console.warn("⚠️ Notificações não permitidas pelo usuário.");
  }
};

// 🔥 Escutar notificações em primeiro plano
onMessage(messaging, (payload) => {
  console.log("📢 Notificação recebida:", payload);
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icone.png",
  });
});
