// FILE: server/diagnosis/extract/anthropicTransport.js
//
// Gercek tasiyici. extractCase'e disaridan verilir; testler bunun yerine
// sahte tasiyici kullanir, boylece cikarim mantigi API'siz test edilir.
//
// Yapilandirilmis cikti icin arac (tool) kullanimi tercih edildi: sema
// zorlanir, JSON ayristirma hatasi ve "modelin arasozu" sorunu ortadan kalkar.

import Anthropic from '@anthropic-ai/sdk';

// Repo konvansiyonu (bkz. controllers/aiController.js, .env.example).
const DEFAULT_MODEL = process.env.DIAGNOSIS_EXTRACT_MODEL
  || process.env.AI_MODEL
  || 'claude-sonnet-5';

const DEFAULT_MAX_TOKENS = Number(process.env.DIAGNOSIS_EXTRACT_MAX_TOKENS || 4096);

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * @param {object} [config] { apiKey, model, maxTokens, client }
 * @returns {(req: {system, user, schema, toolName}) => Promise<object>}
 */
export function createAnthropicTransport(config = {}) {
  const model = config.model ?? DEFAULT_MODEL;
  const maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS;
  let client = config.client ?? null;

  return async function complete({ system, user, schema, toolName }) {
    if (!client) {
      const apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY tanımlı değil');
      client = new Anthropic({ apiKey });
    }

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      // Cikarim yaratici bir is degil: ayni metin ayni cikti vermeli.
      temperature: 0,
      system,
      messages: [{ role: 'user', content: user }],
      tools: [{
        name: toolName,
        description: 'Metinden çıkarılan yapılandırılmış bulguları kaydeder.',
        input_schema: schema,
      }],
      tool_choice: { type: 'tool', name: toolName },
    });

    const block = response.content?.find((c) => c.type === 'tool_use' && c.name === toolName);
    if (!block) {
      const stop = response.stop_reason ?? 'bilinmiyor';
      throw new Error(`Model yapılandırılmış çıktı üretmedi (stop_reason: ${stop})`);
    }
    return block.input;
  };
}
