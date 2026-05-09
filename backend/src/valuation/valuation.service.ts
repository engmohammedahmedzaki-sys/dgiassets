import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

export interface ValuationInput {
  category?: string;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  monthlyVisitors?: number;
  activeUsers?: number;
  ageInMonths?: number;
  monetizationType?: string;
  techStack?: string[];
  description?: string;
}

export interface ValuationResult {
  source: 'ai' | 'formula';
  fairPrice: number;
  rangeLow: number;
  rangeHigh: number;
  multiple: number;
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
}

@Injectable()
export class ValuationService {
  private readonly logger = new Logger(ValuationService.name);

  constructor(private settingsService: SettingsService) {}

  async value(input: ValuationInput): Promise<ValuationResult> {
    const settings = await this.settingsService.getSettings();
    const apiKey = settings?.openaiApiKey;
    const enabled = settings?.openaiEnabled;
    const model = settings?.openaiModel || 'gpt-4o-mini';

    if (enabled && apiKey) {
      try {
        return await this.valueWithAI(input, apiKey, model);
      } catch (e: any) {
        this.logger.warn(`AI valuation failed, falling back: ${e?.message}`);
      }
    }
    return this.valueWithFormula(input);
  }

  /**
   * Multiple-based formula tailored per category & monetization.
   * Used as fallback or when AI not configured.
   */
  private valueWithFormula(input: ValuationInput): ValuationResult {
    const profit = Number(input.monthlyProfit) || 0;
    const revenue = Number(input.monthlyRevenue) || 0;
    const visitors = Number(input.monthlyVisitors) || 0;
    const age = Number(input.ageInMonths) || 0;

    let multiple = 24; // 2 years of profit (industry default)
    let base = profit > 0 ? profit : revenue * 0.4;

    // Category-aware adjustments
    const cat = (input.category || '').toLowerCase();
    if (cat === 'saas') multiple = 36;
    else if (cat === 'ecommerce') multiple = 30;
    else if (cat === 'mobile_apps') multiple = 28;
    else if (cat === 'websites') multiple = 26;
    else if (cat === 'domains') {
      // Domains use age + memorability heuristic; flat range
      const fair = Math.max(500, base * 60);
      return {
        source: 'formula',
        fairPrice: Math.round(fair),
        rangeLow: Math.round(fair * 0.6),
        rangeHigh: Math.round(fair * 1.5),
        multiple: 0,
        reasoning: 'الدومينات تُقدَّر بناءً على الندرة + العمر + قابلية التذكر، لا الإيرادات. لا توجد بيانات أرباح كافية للتقييم بالـ multiple.',
        confidence: 'low',
      };
    }

    // Age boost: maturity = trust
    if (age >= 36) multiple += 6;
    else if (age >= 12) multiple += 3;
    else if (age < 6) multiple -= 4;

    // Traffic boost
    if (visitors >= 100000) multiple += 4;
    else if (visitors >= 10000) multiple += 2;

    // Recurring revenue boost
    const monetization = (input.monetizationType || '').toLowerCase();
    if (monetization.includes('subscription')) multiple += 4;

    multiple = Math.max(8, Math.min(60, multiple));

    const fair = Math.max(500, base * multiple);
    return {
      source: 'formula',
      fairPrice: Math.round(fair),
      rangeLow: Math.round(fair * 0.7),
      rangeHigh: Math.round(fair * 1.4),
      multiple: Number(multiple.toFixed(1)),
      reasoning: profit > 0
        ? `استخدمنا multiple = ${multiple.toFixed(1)} على الربح الشهرى (${profit.toLocaleString('en-US')} ر.س) بناءً على الفئة والعمر والتراف.`
        : `لا توجد أرباح مذكورة، فاستخدمنا 40% من الإيرادات كقاعدة، × ${multiple.toFixed(1)}.`,
      confidence: profit > 0 && age >= 6 ? 'medium' : 'low',
    };
  }

  /**
   * Calls OpenAI Chat Completions with a structured prompt and parses JSON response.
   */
  private async valueWithAI(
    input: ValuationInput,
    apiKey: string,
    model: string,
  ): Promise<ValuationResult> {
    const system = `أنت محلّل مالى متخصص فى تقييم الأصول الرقمية (مواقع، تطبيقات، SaaS، متاجر، دومينات). تردّ بـ JSON فقط دون أى نص توضيحى خارج الـ JSON. الأسعار بالريال السعودى.`;

    const user = `قيّم هذا الأصل الرقمى وأرجع JSON بالشكل التالى بالضبط:
{
  "fairPrice": <number, السعر العادل>,
  "rangeLow": <number, أدنى سعر معقول>,
  "rangeHigh": <number, أعلى سعر معقول>,
  "multiple": <number, الـ multiple على الربح الشهرى>,
  "reasoning": "<string قصير بالعربى يشرح الأساس>",
  "confidence": "low" | "medium" | "high"
}

البيانات:
- الفئة: ${input.category || 'غير محدد'}
- الإيرادات الشهرية: ${input.monthlyRevenue ?? 'غير محدد'} ر.س
- الربح الشهرى: ${input.monthlyProfit ?? 'غير محدد'} ر.س
- الزوار شهرياً: ${input.monthlyVisitors ?? 'غير محدد'}
- المستخدمين النشطين: ${input.activeUsers ?? 'غير محدد'}
- العمر: ${input.ageInMonths ?? 'غير محدد'} شهر
- نوع الربح: ${input.monetizationType || 'غير محدد'}
- التقنيات: ${(input.techStack || []).join(', ') || 'غير محدد'}
- وصف: ${(input.description || '').slice(0, 300)}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
    }
    const data: any = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');
    const parsed = JSON.parse(content);

    const fairPrice = Math.round(Number(parsed.fairPrice) || 0);
    const rangeLow = Math.round(Number(parsed.rangeLow) || fairPrice * 0.7);
    const rangeHigh = Math.round(Number(parsed.rangeHigh) || fairPrice * 1.4);
    const multiple = Number(parsed.multiple) || 0;
    const conf = ['low', 'medium', 'high'].includes(parsed.confidence)
      ? parsed.confidence
      : 'medium';

    return {
      source: 'ai',
      fairPrice,
      rangeLow,
      rangeHigh,
      multiple: Number(multiple.toFixed(1)),
      reasoning: String(parsed.reasoning || '').slice(0, 600),
      confidence: conf,
    };
  }
}
