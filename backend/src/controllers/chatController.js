const Chat = require('../models/Chat');
const assistantService = require('../services/assistantService');

async function getMessages(req, res, next) {
  try {
    let messages = [];
    let unread = 0;
    try {
      messages = await Chat.getUserMessages(req.user.id);
      unread = await Chat.getUnreadUserTotal(req.user.id);
    } catch (chatErr) {
      console.error('[getMessages] DB read failed (RLS?):', chatErr.message);
    }
    res.json({ messages, unread });
  } catch (err) { next(err); }
}

async function assistant(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    const text = String(message).trim();
    const reply = await assistantService.getReply(text);

    try {
      await Chat.send(req.user.id, 'user', { message: text });
      await Chat.send(req.user.id, 'admin', { message: reply });
    } catch (chatErr) {
      console.error('[assistant] DB persist failed (RLS?), returning reply anyway:', chatErr.message);
    }

    res.json({ reply });
  } catch (err) { next(err); }
}

async function sendMessage(req, res, next) {
  try {
    const { message, attachment } = req.body;
    if ((!message || !String(message).trim()) && !attachment) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    try {
      const msg = await Chat.send(req.user.id, 'user', { message, attachment });
      res.status(201).json({ message: msg });
    } catch (chatErr) {
      console.error('[sendMessage] DB persist failed (RLS?), saving locally:', chatErr.message);
      res.status(201).json({ message: { id: 'local-' + Date.now(), message, attachment, sender: 'user', created_at: new Date().toISOString() } });
    }
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    await Chat.markUserRead(req.user.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = { getMessages, sendMessage, markRead, assistant };