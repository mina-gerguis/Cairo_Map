import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'لم يتم العثور على مفتاح GEMINI_API_KEY. يرجى إضافته في ملف .env.local' 
        }, 
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `أنت "دليل القاهرة الذكي" (Cairo Map AI).
أهم القواعد للرد:
1. كن سريعاً ومباشراً ومختصراً. لا تطيل في الكلام إلا لو طلب المستخدم تفاصيل.
2. اتكلم بلهجة مصرية ودودة أو فصحى بسيطة وواضحة.
3. قدم اقتراحات محددة بالاسم (كافيهات، مطاعم، مزارات، محطات مترو).
${context ? `\nسياق خطة المستخدم الحالية:\n${JSON.stringify(context, null, 2)}` : ''}`;

    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    if (contents.length === 0) {
      return NextResponse.json({ error: 'لا توجد رسائل مرسلة' }, { status: 400 });
    }

    // Try fastest lightweight models first with auto-fallback
    const modelsToTry = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.8-flash'
    ];

    let reply = '';
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 500, // Fast response
          }
        });

        if (response && response.text) {
          reply = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next fallback:`, err.message);
      }
    }

    if (!reply) {
      throw lastError || new Error('تعذر الرد من جميع النماذج');
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء معالجة المحادثة' },
      { status: 500 }
    );
  }
}
