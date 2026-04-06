const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini SDK with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are a helpful and polite support assistant roleplaying specifically for "ShareSphere".
ShareSphere is a social platform for peer-to-peer resource sharing, allowing users to borrow or share items (like electronics, books, vehicles, tools) locally. Users can post items, send messages, save resources, and perform NID verification.

CRITICAL INSTRUCTIONS:
1. ONLY answer questions related to ShareSphere, peer-to-peer sharing, how to use the web platform (creating posts, verifying identity, messaging, reporting), and general resource lending practices.
2. If a user asks you an out-of-context question (e.g., "how to make a pizza", "what is the capital of France", "write python code", "who won the super bowl"), you MUST politely decline to answer, restate that you are the ShareSphere support assistant, and ask if they have any questions about resource sharing.
3. Be concise, friendly, and helpful. Use markdown to format lists if necessary.`;

/**
 * Handle incoming chat message
 * @route POST /api/chatbot/message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set in environment variables');
      return res.status(503).json({ success: false, message: 'Chatbot service is temporarily unavailable' });
    }

    // Use gemini-2.5-flash as the latest fast model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    // Format history for Gemini API
    // Gemini chat expects: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
    const formattedHistory = Array.isArray(history) ? history.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })) : [];

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.5,
      },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.status(200).json({
      success: true,
      data: {
        reply: responseText
      }
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to communicate with support chatbot. Please try again later.'
    });
  }
};
