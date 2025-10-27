import './style.css';

// Application state
const state = {
  username: null,
  messages: [],
  lastMessageTimestamp: 0,
  onlineUsers: 0,
  pollInterval: null,
};

// API endpoints
const API = {
  join: '/.netlify/functions/join',
  sendMessage: '/.netlify/functions/send-message',
  getMessages: '/.netlify/functions/get-messages',
};

// Initialize app
function init() {
  renderLoginScreen();
}

// Render login screen
function renderLoginScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <div class="shape shape-triangle"></div>
      <div class="shape shape-circle"></div>
      <div class="shape shape-square"></div>
      <h1 class="login-title">RetroChat 90s</h1>
      <form class="login-form" id="loginForm">
        <div class="input-wrapper">
          <input
            type="text"
            class="username-input"
            id="usernameInput"
            placeholder="Enter your rad username..."
            maxlength="20"
            required
            autocomplete="off"
          />
        </div>
        <button type="submit" class="join-button">
          Join the Chat!
        </button>
      </form>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('usernameInput').focus();
}

// Render chat screen
function renderChatScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="chat-container">
      <div class="shape shape-triangle"></div>
      <div class="shape shape-circle"></div>
      <div class="shape shape-square"></div>

      <div class="chat-header">
        <h1 class="chat-title">RetroChat 90s</h1>
        <div class="user-info">
          <span class="username-display">Logged in as: ${escapeHtml(state.username)}</span>
          <span class="online-count" id="onlineCount">${state.onlineUsers} online</span>
        </div>
      </div>

      <div class="messages-container" id="messagesContainer">
        ${renderMessages()}
      </div>

      <div class="input-container">
        <form class="message-form" id="messageForm">
          <input
            type="text"
            class="message-input"
            id="messageInput"
            placeholder="Type your message..."
            maxlength="500"
            required
            autocomplete="off"
          />
          <button type="submit" class="send-button">Send!</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('messageForm').addEventListener('submit', handleSendMessage);
  document.getElementById('messageInput').focus();
  scrollToBottom();
}

// Render messages
function renderMessages() {
  if (state.messages.length === 0) {
    return '<div class="empty-state">No messages yet... Be the first to say something!</div>';
  }

  return state.messages
    .map(msg => {
      const isOwnMessage = msg.username === state.username;
      const messageClass = isOwnMessage ? 'message own-message' : 'message';
      const timestamp = new Date(msg.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
        <div class="${messageClass}">
          <div class="message-header">
            <span class="message-username">${escapeHtml(msg.username)}</span>
            <span class="message-time">${timestamp}</span>
          </div>
          <div class="message-text">${escapeHtml(msg.text)}</div>
        </div>
      `;
    })
    .join('');
}

// Update messages display
function updateMessages() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    const wasAtBottom = isScrolledToBottom(container);
    container.innerHTML = renderMessages();
    if (wasAtBottom) {
      scrollToBottom();
    }
  }
}

// Update online count
function updateOnlineCount() {
  const countElement = document.getElementById('onlineCount');
  if (countElement) {
    countElement.textContent = `${state.onlineUsers} online`;
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  const input = document.getElementById('usernameInput');
  const username = input.value.trim();

  if (!username) {
    alert('Please enter a username!');
    return;
  }

  try {
    const response = await fetch(API.join, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error('Failed to join chat');
    }

    const data = await response.json();
    state.username = username;
    state.onlineUsers = data.onlineUsers || 1;

    renderChatScreen();
    startPolling();
    await fetchMessages();
  } catch (error) {
    console.error('Login error:', error);
    alert('Oops! Could not join the chat. Please try again!');
  }
}

// Handle send message
async function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('messageInput');
  const text = input.value.trim();

  if (!text) {
    return;
  }

  try {
    const response = await fetch(API.sendMessage, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.username,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    input.value = '';
    await fetchMessages();
  } catch (error) {
    console.error('Send message error:', error);
    alert('Oops! Could not send message. Please try again!');
  }
}

// Fetch messages from server
async function fetchMessages() {
  try {
    const response = await fetch(
      `${API.getMessages}?since=${state.lastMessageTimestamp}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();

    if (data.messages && data.messages.length > 0) {
      state.messages = data.messages;
      state.lastMessageTimestamp = Math.max(
        ...data.messages.map(m => m.timestamp),
        state.lastMessageTimestamp
      );
      updateMessages();
    }

    if (data.onlineUsers !== undefined) {
      state.onlineUsers = data.onlineUsers;
      updateOnlineCount();
    }
  } catch (error) {
    console.error('Fetch messages error:', error);
  }
}

// Start polling for new messages
function startPolling() {
  if (state.pollInterval) {
    clearInterval(state.pollInterval);
  }

  // Poll every 2 seconds
  state.pollInterval = setInterval(fetchMessages, 2000);
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function scrollToBottom() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function isScrolledToBottom(container) {
  return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
}

// Start the app
init();
