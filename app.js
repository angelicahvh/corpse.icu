// Firebase imports and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqfHWI-CGAgahKJXqeCqhdh4qpS3mxW0A",
  authDomain: "corpsechat.firebaseapp.com",
  projectId: "corpsechat",
  storageBucket: "corpsechat.firebasestorage.app",
  messagingSenderId: "1087838804413",
  appId: "1:1087838804413:web:912de84f47c9055c3a9ad4",
  measurementId: "G-48K3FMN2ZV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

window.onload = () => {
  const sendBtn = document.getElementById("send-btn");
  if (sendBtn) sendBtn.onclick = sendMessage;

  const msgInput = document.getElementById("chat-input");
  if (msgInput) {
    msgInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  if (document.getElementById("login-btn")) {
    document.getElementById("login-btn").onclick = loginUser;
    document.getElementById("register-btn").onclick = registerUser;
  }

  onAuthStateChanged(auth, user => {
    if (user) {
      document.body.dataset.user = user.uid;
      loadMessages("general");
      listenToSubchats();
    }
  });
};

async function registerUser() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    alert("Registered!");
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
}

async function loginUser() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert("Logged in!");
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value;
  if (!text.trim()) return;
  const user = auth.currentUser;
  if (!user) return;

  const subchat = document.body.dataset.subchat || "general";
  await addDoc(collection(db, "subchats", subchat, "messages"), {
    uid: user.uid,
    text: text,
    timestamp: Date.now()
  });
  input.value = "";
}

function loadMessages(subchatId) {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";
  document.body.dataset.subchat = subchatId;

  const msgRef = collection(db, "subchats", subchatId, "messages");
  onSnapshot(msgRef, snapshot => {
    chatBox.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const div = document.createElement("div");
      div.textContent = `[${time}] ${msg.text}`;
      chatBox.appendChild(div);
    });
  });
}

async function createSubchat() {
  const user = auth.currentUser;
  if (!user) return;

  const name = prompt("Enter subchat name:");
  if (!name) return;

  const subchatId = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ref = doc(db, "subchats", subchatId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    alert("Subchat already exists.");
    return;
  }

  await setDoc(ref, {
    creator: user.uid,
    name: name,
    members: [user.uid]
  });

  loadMessages(subchatId);
}

async function deleteSubchat() {
  const user = auth.currentUser;
  const subchatId = document.body.dataset.subchat;
  const ref = doc(db, "subchats", subchatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  if (snap.data().creator !== user.uid) {
    alert("Only the creator can delete this subchat.");
    return;
  }

  await deleteDoc(ref);
  alert("Subchat deleted.");
  loadMessages("general");
}

function listenToSubchats() {
  const tabArea = document.getElementById("subchat-tabs");
  const q = collection(db, "subchats");

  onSnapshot(q, snapshot => {
    tabArea.innerHTML = "";
    snapshot.forEach(docSnap => {
      const subchat = docSnap.data();
      const div = document.createElement("div");
      div.innerHTML = `<button onclick="loadMessages('${docSnap.id}')"># ${subchat.name}</button>`;
      tabArea.appendChild(div);
    });
  });
}