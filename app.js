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
    window.location.href = 'chat.html?s=main';
  } else {
    alert('Invalid login');
  }
}

function register() {
  const user = document.getElementById('reg-user').value;
  const pass = document.getElementById('reg-pass').value;
  const users = getUsers();
  if (!users[user]) {
    users[user] = { password: pass, friends: [] };
    saveUsers(users);
    alert('Registered. Now login.');
  } else {
    alert('Username taken');
  }
}

if (window.location.pathname.endsWith('chat.html')) {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('s') || 'main';
  document.getElementById('room-title').textContent = `Subchat: ${room}`;

  window.sendChat = () => {
    const user = getLoggedInUser();
    const input = document.getElementById('chat-input');
    const chat = document.getElementById('chat-log');
    if (input.value.trim()) {
      const msg = document.createElement('div');
      msg.textContent = `${user}: ${input.value}`;
      chat.appendChild(msg);
      input.value = '';
    }
  };
}

if (window.location.pathname.endsWith('profile.html')) {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('user');
  const users = getUsers();

  if (users[username]) {
    document.getElementById('profile-header').textContent = `Profile of ${username}`;
    document.getElementById('profile-username').textContent = username;
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