import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { getClientIp, recordIpAttempt } from '@/lib/ipRateLimit';

export async function POST(req: Request) {
  try {
    // Rate limit check: max 25 prompts per 5-minute window per IP
    const clientIp = getClientIp(req);
    const rateLimit = recordIpAttempt(clientIp, 'ai-chat', 25, 5 * 60 * 1000);
    if (rateLimit.blocked) {
      return NextResponse.json(
        { 
          error: 'تم تجاوز الحد الأقصى للأسئلة المسموح بها مؤقتاً. يرجى الانتظار بضع دقائق قبل إرسال سؤال جديد.' 
        }, 
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, context } = body;

    // Server-side validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'لا توجد رسائل مرسلة أو صيغة الطلب غير صالحة' }, { status: 400 });
    }

    if (messages.length > 20) {
      return NextResponse.json({ error: 'تم تجاوز الحد الأقصى لعدد الرسائل المسموح به (20 رسالة)' }, { status: 400 });
    }

    for (const m of messages) {
      if (!m || typeof m !== 'object' || typeof m.content !== 'string') {
        return NextResponse.json({ error: 'صيغة محتوى الرسالة غير صالحة' }, { status: 400 });
      }
      if (m.content.length > 2000) {
        return NextResponse.json({ error: 'طول الرسالة يتجاوز الحد الأقصى المسموح به (2000 حرف)' }, { status: 400 });
      }
    }

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

    const safeContext = typeof context === 'object' && context !== null 
      ? JSON.stringify(context).slice(0, 4000) 
      : '';

    const systemInstruction = `أنت "دليل قريب الذكي" (Qareeb AI).
أهم القواعد للرد:
1. كن سريعاً ومباشراً ومختصراً. لا تطيل في الكلام إلا لو طلب المستخدم تفاصيل.
2. اتكلم بلهجة مصرية ودودة أو فصحى بسيطة وواضحة.
3. قدم اقتراحات محددة بالاسم (كافيهات، مطاعم، مزارات، محطات مترو).
${safeContext ? `\nسياق خطة المستخدم الحالية:\n${safeContext}` : ''}`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

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
