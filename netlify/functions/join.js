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
    const { username } = await req.json();

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmedUsername = username.trim();

    // Get the blob store
    const store = getStore('retro-chat');

    // Get existing users
    let users = [];
    try {
      const usersData = await store.get('users', { type: 'json' });
      if (usersData) {
        users = usersData;
      }
    } catch (error) {
      console.log('No existing users, starting fresh');
    }

    // Add user with timestamp
    const now = Date.now();
    const userEntry = {
      username: trimmedUsername,
      joinedAt: now,
      lastSeen: now,
    };

    // Remove any existing entry for this username and add new one
    users = users.filter(u => u.username !== trimmedUsername);
    users.push(userEntry);

    // Clean up old users (not seen in last 5 minutes)
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    users = users.filter(u => u.lastSeen > fiveMinutesAgo);

    // Save updated users
    await store.setJSON('users', users);

    return new Response(
      JSON.stringify({
        success: true,
        username: trimmedUsername,
        onlineUsers: users.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Join error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to join chat' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
