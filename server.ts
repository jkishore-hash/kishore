import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
  });
});

// Endpoint: Generate Exam Questions
app.post('/api/generate-exam', async (req: Request, res: Response) => {
  try {
    const {
      subject,
      topic,
      difficulty = 'Medium',
      number = 5,
      targetAudience = 'General Academic',
      customFocus = '',
      language = 'English',
    } = req.body;

    if (!subject || !topic) {
      res.status(400).json({ error: 'Subject and topic are required fields.' });
      return;
    }

    const questionCount = Math.min(Math.max(Number(number) || 5, 1), 20);

    // If no API key configured, provide helpful error or fallback
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your environment or Settings > Secrets panel.',
      });
      return;
    }

    const prompt = `You are a distinguished university professor and academic test construction specialist.
Generate an exam question paper with exactly ${questionCount} multiple-choice questions.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Target Audience / Exam Standard: ${targetAudience}
${customFocus ? `Special Focus / Topics to cover: ${customFocus}` : ''}
Language: ${language}

Requirements:
1. Generate clear, rigorous, unambiguous, and meaningful questions.
2. Every question MUST have exactly four distinct plausible options labeled 'A', 'B', 'C', and 'D'.
3. Exactly one option must be the objectively correct answer ('A', 'B', 'C', or 'D').
4. The remaining three options (distractors) must be plausible and based on common misconceptions or related concepts, not silly or obviously wrong.
5. Provide a detailed, pedagogically sound step-by-step explanation explaining WHY the correct option is true.
6. Provide a concise distractor analysis explaining why the alternative options are flawed or incorrect.
7. Provide a subtle, instructive hint that leads the student toward reasoning out the answer without giving it away directly.
8. Provide a precise concept tag (e.g. "Kinematics", "Mitosis", "Big-O Notation").
9. Assign each question a sequential questionNumber from 1 to ${questionCount}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert exam author. Output valid JSON adhering precisely to the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'A formal title for this exam or quiz',
            },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: {
                          type: Type.STRING,
                          description: 'Option letter: A, B, C, or D',
                        },
                        text: { type: Type.STRING },
                      },
                      required: ['label', 'text'],
                    },
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "Single correct letter: 'A', 'B', 'C', or 'D'",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Comprehensive pedagogical explanation',
                  },
                  distractorExplanation: {
                    type: Type.STRING,
                    description: 'Why the incorrect options are wrong',
                  },
                  hint: {
                    type: Type.STRING,
                    description: 'Helpful conceptual clue',
                  },
                  conceptTag: {
                    type: Type.STRING,
                    description: 'Sub-topic or concept tested',
                  },
                },
                required: [
                  'questionNumber',
                  'question',
                  'options',
                  'correctAnswer',
                  'explanation',
                  'hint',
                  'conceptTag',
                ],
              },
            },
          },
          required: ['title', 'subject', 'topic', 'difficulty', 'questions'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini model');
    }

    const parsedData = JSON.parse(responseText);

    // Assign stable unique IDs
    const examId = `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedQuestions = (parsedData.questions || []).map(
      (q: any, idx: number) => ({
        id: `q-${examId}-${idx + 1}`,
        questionNumber: q.questionNumber || idx + 1,
        question: q.question,
        options: (q.options || []).slice(0, 4).map((opt: any, oIdx: number) => ({
          label: (['A', 'B', 'C', 'D'][oIdx] || opt.label || 'A') as 'A' | 'B' | 'C' | 'D',
          text: opt.text || '',
        })),
        correctAnswer: (['A', 'B', 'C', 'D'].includes(q.correctAnswer)
          ? q.correctAnswer
          : 'A') as 'A' | 'B' | 'C' | 'D',
        explanation: q.explanation || 'No explanation provided.',
        distractorExplanation: q.distractorExplanation || '',
        hint: q.hint || 'Carefully review the core definitions of the topic.',
        conceptTag: q.conceptTag || topic,
        difficulty: difficulty,
      }),
    );

    const examPackage = {
      metadata: {
        id: examId,
        title: parsedData.title || `${subject}: ${topic} Exam`,
        subject: parsedData.subject || subject,
        topic: parsedData.topic || topic,
        difficulty: parsedData.difficulty || difficulty,
        questionCount: sanitizedQuestions.length,
        createdAt: new Date().toISOString(),
        targetAudience,
        customFocus,
      },
      questions: sanitizedQuestions,
    };

    res.json(examPackage);
  } catch (error: any) {
    console.error('Error generating exam questions:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate exam questions. Please try again.',
    });
  }
});

// Endpoint: AI Tutor Deep Question Clarification
app.post('/api/explain-question', async (req: Request, res: Response) => {
  try {
    const {
      question,
      selectedOption,
      correctAnswer,
      options,
      explanation,
      studentQuery,
    } = req.body;

    if (!question || !correctAnswer) {
      res.status(400).json({ error: 'Question and correctAnswer are required' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini API is not configured on the server.',
      });
      return;
    }

    const optionsText = (options || [])
      .map((opt: any) => `${opt.label}: ${opt.text}`)
      .join('\n');

    const prompt = `You are an empathetic, world-class private tutor. A student is studying an exam question and has asked for your help.

Exam Question:
${question}

Options:
${optionsText}

Correct Answer: Option ${correctAnswer}
Official Explanation: ${explanation}
${selectedOption ? `Student's Chosen Option: Option ${selectedOption}` : ''}
Student's Specific Question / Confusion: "${studentQuery || 'Can you explain why the correct answer is right and why other options are not?'}"

Respond in a warm, encouraging, pedagogical tone.
Break it down clearly into:
1. Core Concept in simple terms
2. Step-by-step reasoning
3. Why the student's choice was tempting but incorrect (if applicable)
4. A quick memory trick or rule-of-thumb to remember this for future exams.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a patient, encouraging academic tutor. Provide clear, structured, readable markdown explanations.',
      },
    });

    res.json({
      tutorExplanation: response.text || 'Unable to generate tutoring breakdown.',
    });
  } catch (error: any) {
    console.error('Error in tutor explanation:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate tutoring breakdown.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
