const USERS_KEY = 'corpsechat_users';
const LOGGED_IN_KEY = 'corpsechat_logged_user';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getLoggedInUser() {
  return localStorage.getItem(LOGGED_IN_KEY);
}

function setLoggedInUser(username) {
  localStorage.setItem(LOGGED_IN_KEY, username);
}

function login() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;
  const users = getUsers();
  if (users[user] && users[user].password === pass) {
    setLoggedInUser(user);
    window.location.href = 'home.html?s=main';
  } else {
    document.getElementById('login-error').textContent = 'Invalid username or password.';
  }
}

function register() {
  const user = document.getElementById('reg-user').value;
  const pass = document.getElementById('reg-pass').value;
  const avatarInput = document.getElementById('reg-avatar');
  const users = getUsers();

  if (users[user]) {
    alert('Username taken');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    users[user] = {
      password: pass,
      friends: [],
      avatar: reader.result
    };
    saveUsers(users);
    document.getElementById('register-msg').textContent = 'Registered successfully. You can now login.';
  };

  if (avatarInput.files[0]) {
    reader.readAsDataURL(avatarInput.files[0]);
  } else {
    users[user] = { password: pass, friends: [], avatar: null };
    saveUsers(users);
    document.getElementById('register-msg').textContent = 'Registered successfully. You can now login.';
  }
}

// Chat rendering
if (window.location.pathname.endsWith('home.html')) {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('s') || 'main';
  document.getElementById('room-title').textContent = `Subchat: ${room}`;

  const users = getUsers();
  const currentUser = getLoggedInUser();
  const avatar = users[currentUser]?.avatar;

  window.sendChat = () => {
    const input = document.getElementById('chat-input');
    const chat = document.getElementById('chat-log');
    if (input.value.trim()) {
      const msgDiv = document.createElement('div');
      if (avatar) {
        const img = document.createElement('img');
        img.src = avatar;
        img.style.height = '24px';
        img.style.width = '24px';
        img.style.borderRadius = '50%';
        img.style.marginRight = '8px';
        msgDiv.appendChild(img);
      }
      msgDiv.appendChild(document.createTextNode(`${currentUser}: ${input.value}`));
      chat.appendChild(msgDiv);
      input.value = '';
    }
  };
}

// Profile rendering
if (window.location.pathname.endsWith('profile.html')) {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('user');
  const users = getUsers();

  if (users[username]) {
    document.getElementById('profile-header').textContent = `Profile of ${username}`;
    document.getElementById('profile-username').textContent = username;
    if (users[username].avatar) {
      const img = document.createElement('img');
      img.src = users[username].avatar;
      img.style.height = '100px';
      img.style.borderRadius = '12px';
      document.body.insertBefore(img, document.getElementById('profile-header').nextSibling);
    }

    const friendList = document.getElementById('friend-list');
    users[username].friends.forEach(friend => {
      const li = document.createElement('li');
      li.textContent = friend;
      friendList.appendChild(li);
    });
  } else {
    document.body.innerHTML = `<h2>User "${username}" not found.</h2>`;
  }
}



const CHAT_KEY = 'corpsechat_messages';

function getChatMessages() {
  return JSON.parse(localStorage.getItem(CHAT_KEY)) || [];
}

function saveChatMessages(messages) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const user = getLoggedInUser();
  const time = new Date();
  const timestamp = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const message = { user, text, time: timestamp };
  const messages = getChatMessages();
  messages.push(message);
  saveChatMessages(messages);
  input.value = '';
  renderMessages();
}

function renderMessages() {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;
  chatBox.innerHTML = '';
  const messages = getChatMessages();
  messages.forEach(msg => {
    const msgEl = document.createElement('div');
    msgEl.textContent = `[${msg.time}] ${msg.user}: ${msg.text}`;
    chatBox.appendChild(msgEl);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function editProfile() {
  const user = getLoggedInUser();
  const users = getUsers();
  const newUsername = prompt("Enter new username:", user);
  if (newUsername && newUsername !== user) {
    users[newUsername] = users[user];
    delete users[user];
    saveUsers(users);
    setLoggedInUser(newUsername);
    alert("Username updated to " + newUsername);
    renderMessages(); // Optional: update name in history
  }
}

// Load chat on startup
window.addEventListener('DOMContentLoaded', renderMessages);
