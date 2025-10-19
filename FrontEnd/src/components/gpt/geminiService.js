// geminiService.js
// Gemini API Service for handling AI requests

const GEMINI_API_KEY = 
  import.meta.env.VITE_GEMINI_API_KEY || 
  process.env.REACT_APP_GEMINI_API_KEY || 
  'YOUR_API_KEY_HERE';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Send a message to Gemini API and get AI response
 * @param {string} message - The user's input message
 * @returns {Promise<string>} - The AI generated response text
 * @throws {Error} - If API call fails or message is invalid
 */
export const sendMessageToGemini = async (message) => {
  // Validate input
  if (!message || !message.trim()) {
    throw new Error('Message cannot be empty');
  }

  // Check API key
  if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE' || !GEMINI_API_KEY) {
    throw new Error('Please set your Gemini API key in .env file (VITE_GEMINI_API_KEY or REACT_APP_GEMINI_API_KEY)');
  }

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    // Parse response
    const data = await response.json();

    // Extract text from response
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response generated from Gemini');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Send conversation history to Gemini API (for context-aware responses)
 * @param {Array<{role: string, text: string}>} messages - Array of conversation messages
 * @returns {Promise<string>} - The AI generated response text
 * @throws {Error} - If API call fails
 */
export const sendConversationToGemini = async (messages) => {
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE' || !GEMINI_API_KEY) {
    throw new Error('Please set your Gemini API key in .env file');
  }

  try {
    // Convert message format to Gemini API format
    const contents = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response generated from Gemini');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};