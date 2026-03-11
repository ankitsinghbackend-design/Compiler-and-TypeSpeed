import express from 'express';
import fetch from 'node-fetch';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mistral API configuration
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || 'wdINbr3eOFlHJPnR4PH4mOcTCEQ7Z4iB';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Enhanced code completion endpoint for inline suggestions
router.post('/complete', async (req, res) => {
  try {
    const { code, language, position, maxTokens = 50 } = req.body;

    if (!code || !position) {
      return res.status(400).json({ error: 'Code and cursor position are required' });
    }

    // Get the current line and cursor context
    const lines = code.split('\n');
    const currentLineIndex = position.lineNumber - 1;
    const currentLine = lines[currentLineIndex] || '';
    const beforeCursor = currentLine.substring(0, position.column - 1);
    const afterCursor = currentLine.substring(position.column - 1);
    
    // Build context around cursor
    const codeBeforeCursor = lines.slice(0, currentLineIndex).join('\n') + '\n' + beforeCursor;
    const codeAfterCursor = afterCursor + '\n' + lines.slice(currentLineIndex + 1).join('\n');
    
    // Create focused completion prompt
    const languagePrompts = {
      python: 'Complete this Python code with a short, contextually appropriate completion:',
      javascript: 'Complete this JavaScript code with a short, contextually appropriate completion:',
      typescript: 'Complete this TypeScript code with a short, contextually appropriate completion:',
      java: 'Complete this Java code with a short, contextually appropriate completion:',
      cpp: 'Complete this C++ code with a short, contextually appropriate completion:',
      c: 'Complete this C code with a short, contextually appropriate completion:',
      go: 'Complete this Go code with a short, contextually appropriate completion:',
      rust: 'Complete this Rust code with a short, contextually appropriate completion:',
      php: 'Complete this PHP code with a short, contextually appropriate completion:',
      ruby: 'Complete this Ruby code with a short, contextually appropriate completion:',
      kotlin: 'Complete this Kotlin code with a short, contextually appropriate completion:',
      swift: 'Complete this Swift code with a short, contextually appropriate completion:',
      csharp: 'Complete this C# code with a short, contextually appropriate completion:',
      sql: 'Complete this SQL query with a short, contextually appropriate completion:',
    };
    
    const prompt = `${languagePrompts[language] || 'Complete this code:'}\n\n\`\`\`${language}\n${codeBeforeCursor}[CURSOR]${codeAfterCursor}\n\`\`\`\n\nThe cursor is at [CURSOR]. Provide ONLY the text that should be inserted at the cursor position.\n\nRules:\n1. Provide ONLY the completion text (no explanations)\n2. Keep it contextually appropriate (1-2 lines max)\n3. Don't repeat existing code\n4. Consider proper ${language} syntax\n5. Make it useful and relevant\n\nCompletion:`;

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'codestral-latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.1, // Very low temperature for focused completions
        top_p: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const completion = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean up the completion text
    const cleanCompletion = completion
      .replace(/^```[\w]*\n?/, '') // Remove opening code blocks
      .replace(/\n?```$/, '')      // Remove closing code blocks
      .replace(/^Completion:\s*/, '') // Remove "Completion:" prefix
      .trim();

    res.json({ 
      completion: cleanCompletion,
      success: true 
    });

  } catch (error) {
    console.error('Code completion error:', error);
    res.status(500).json({ 
      error: 'Failed to generate code completion',
      message: error.message 
    });
  }
});

export default router;
