const Chat = require('../models/Chat');
const assistantService = require('../services/assistantService');

async function getMessages(req, res, next) {
  try {
    const messages = await Chat.getUserMessages(req.user.id);
    const unread = await Chat.getUnreadUserTotal(req.user.id);
    res.json({ messages, unread });
  } catch (err) { next(err); }
}

async function sendMessage(req, res, next) {
  try {
    const { message, attachment } = req.body;
    if ((!message || !String(message).trim()) && !attachment) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    const msg = await Chat.send(req.user.id, 'user', { message, attachment });
    res.status(201).json({ message: msg });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    await Chat.markUserRead(req.user.id);
    res.json({ ok: true });
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

    const [userMsg, botMsg] = await Promise.all([
      Chat.send(req.user.id, 'user', { message: text }),
      Chat.send(req.user.id, 'admin', { message: reply }),
    ]);

    res.json({ reply, userMessage: userMsg, assistantMessage: botMsg });
  } catch (err) { next(err); }
}

module.exports = { getMessages, sendMessage, markRead, assistant };