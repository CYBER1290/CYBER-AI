import { GoogleGenAI } from '@google/genai';
import { supabaseService } from './supabaseService.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function generateCyberReply(
  userInput: string,
  history: ChatMessage[],
  personality = 'smart futuristic Jarvis assistant',
  language = 'hinglish',
  memoryEnabled = true
): Promise<string> {
  try {
    const ai = getAiClient();
    
    // 1. Compile memories for background context
    let memoryContext = '';
    if (memoryEnabled) {
      try {
        const pastMemories = await supabaseService.getMemories(6);
        if (pastMemories.length > 0) {
          memoryContext = 'RELEVANT PAST CONVERSATION MEMORIES:\n';
          // Iterate backwards to put them in chronological order
          for (let i = pastMemories.length - 1; i >= 0; i--) {
            const m = pastMemories[i];
            memoryContext += `- User said: "${m.user_input}" -> CYBER AI replied: "${m.ai_response}"\n`;
          }
          memoryContext += '\nUse this past conversation context if the user refers to past discussions or needs continuity. Otherwise, focus on their latest input.\n';
        }
      } catch (memError) {
        console.error('⚠️ Could not load memory context for Gemini:', memError);
      }
    }

    // 2. Formulate the system instruction
    let languageGuide = '';
    if (language === 'hinglish') {
      languageGuide = 'You MUST respond in Hinglish (a natural, friendly blend of Hindi and English written in the Latin/English script). For example: "Main aapki kaise madad kar sakta hoon? Let me know!" or "Haan, main system records scan kar raha hoon." Keep it cool, modern, and colloquial.';
    } else if (language === 'hindi') {
      languageGuide = 'You MUST respond in Hindi using clean Devanagari script. Keep it formal yet polite, like an advanced AI companion in India.';
    } else {
      languageGuide = 'You MUST respond in fluent, high-tech, sleek, professional English. Use sophisticated words when explaining technical details, but keep everyday speech extremely smooth and friendly.';
    }

    const systemInstruction = `You are CYBER AI, an advanced, highly modular personal AI companion styled after Tony Stark's JARVIS assistant.
Your character personality description: "${personality}".

Operational Directives:
1. Always stay in character as a futuristic, neon-glowing cyber assistant.
2. ${languageGuide}
3. Keep your replies concise, punchy, and engaging (under 3-4 sentences), unless the user explicitly asks for detailed explanations or code snippets.
4. If the user asks about system specifications, mention that you run on high-performance neural clusters, connected to a Supabase matrix memory grid.
5. Do not use markdown headers (# or ##) in your replies. Use bolding (**text**) or lists for structure, keeping it conversational for easy Text-to-Speech playback.
6. Acknowledge the user by terms like "Sir", "Boss", "User", or their name if known.
`;

    // 3. Format history and contents
    // Convert the local history into the format that Gemini's generateContent supports
    // Or we can use ai.chats.create, but generateContent gives us total control over appending system instructions and memory context.
    const contents: any[] = [];
    
    // Add memory context as an initial system-level note or user-prompt prefix if history is empty
    let initialUserPromptPrefix = '';
    if (memoryContext) {
      initialUserPromptPrefix = `[System Memory Core: Here are some past details of our discussions. Do not reply to this note directly, just keep it in mind:\n${memoryContext}]\n\n`;
    }

    // Feed conversational history
    if (history && history.length > 0) {
      history.forEach((msg, index) => {
        let textPart = msg.text;
        if (index === 0 && initialUserPromptPrefix) {
          textPart = initialUserPromptPrefix + textPart;
        }
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: textPart }],
        });
      });
      // Append current user message
      contents.push({
        role: 'user',
        parts: [{ text: userInput }],
      });
    } else {
      // Single message turn
      contents.push({
        role: 'user',
        parts: [{ text: (initialUserPromptPrefix + userInput) }],
      });
    }

    // 4. Generate the reply
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
        topP: 0.95,
      },
    });

    const reply = response.text || 'Core transmission empty. Please re-route.';
    
    // 5. Save the interaction in Supabase memory asynchronously (non-blocking for the chat reply speed)
    if (memoryEnabled) {
      supabaseService.saveMemory(userInput, reply).catch((err) => {
        console.error('⚠️ Failed to save memory record:', err);
      });
    }

    return reply;
  } catch (error: any) {
    console.error('❌ Error in generateCyberReply:', error);
    return `System alert: Unable to complete neural link. Connection error: ${error.message || error}`;
  }
}
