import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { username, text } = await req.json();

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid message text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmedUsername = username.trim();
    const trimmedText = text.trim();

    // Get the blob store
    const store = getStore('retro-chat');

    // Get existing messages
    let messages = [];
    try {
      const messagesData = await store.get('messages', { type: 'json' });
      if (messagesData) {
        messages = messagesData;
      }
    } catch (error) {
      console.log('No existing messages, starting fresh');
    }

    // Add new message
    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: trimmedUsername,
      text: trimmedText,
      timestamp: Date.now(),
    };

    messages.push(newMessage);

    // Keep only the last 100 messages
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }

    // Save messages
    await store.setJSON('messages', messages);

    // Update user's last seen
    try {
      const usersData = await store.get('users', { type: 'json' });
      if (usersData) {
        let users = usersData;
        const userIndex = users.findIndex(u => u.username === trimmedUsername);
        if (userIndex !== -1) {
          users[userIndex].lastSeen = Date.now();
          await store.setJSON('users', users);
        }
      }
    } catch (error) {
      console.log('Could not update user last seen');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: newMessage,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Send message error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
