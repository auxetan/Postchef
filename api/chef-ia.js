/**
 * /api/chef-ia — Chef IA avec tool-calling
 * Outils disponibles : create_idea, add_calendar_event, generate_image
 * Rate limit : 25 req/min global, generate_image limité côté frontend
 */
import { optionalEnv, requireEnv } from './_lib/env.js'
import { ApiError, createApiHandler } from './_lib/http.js'

const MODEL = 'claude-haiku-4-5-20251001'

const TOOLS = [
  {
    name: 'create_idea',
    description:
      'Crée une idée de contenu et l\'ajoute à la liste d\'idées PostChef de l\'utilisateur. ' +
      'À utiliser quand l\'utilisateur demande de générer, créer ou sauvegarder une idée.',
    input_schema: {
      type: 'object',
      properties: {
        hook: {
          type: 'string',
          description: 'Accroche courte et percutante, max 12 mots, tutoiement interdit',
        },
        format: {
          type: 'string',
          enum: ['Reel', 'Vidéo courte', 'Photo', 'Carrousel', 'Story'],
          description: 'Format du contenu',
        },
        plateforme: {
          type: 'string',
          enum: ['Instagram', 'TikTok', 'Instagram & TikTok'],
          description: 'Plateforme cible',
        },
        brief: {
          type: 'string',
          description: 'Description du contenu visuel en 1-2 phrases concrètes et actionnables',
        },
        legende: {
          type: 'string',
          description: 'Légende prête à poster avec emojis, 150 chars max',
        },
      },
      required: ['hook', 'format', 'plateforme', 'brief'],
    },
  },
  {
    name: 'add_calendar_event',
    description:
      'Planifie un post dans le calendrier de contenu PostChef. ' +
      'À utiliser quand l\'utilisateur veut programmer, planifier ou ajouter un post à une date précise.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type de contenu (ex: "Plat du jour en vidéo", "Coulisses cuisine")',
        },
        date: {
          type: 'string',
          description: 'Date ISO 8601 (YYYY-MM-DD), ex: 2026-04-20',
        },
        format: {
          type: 'string',
          enum: ['Reel', 'Vidéo courte', 'Photo', 'Carrousel', 'Story'],
        },
        plateformes: {
          type: 'array',
          items: { type: 'string', enum: ['Instagram', 'TikTok'] },
          description: 'Plateformes cibles',
        },
        hook: {
          type: 'string',
          description: 'Accroche / titre du post',
        },
        brief: {
          type: 'string',
          description: 'Instructions de tournage ou de création',
        },
        legende: {
          type: 'string',
          description: 'Légende prête à copier (optionnel)',
        },
      },
      required: ['type', 'date', 'format', 'plateformes', 'hook'],
    },
  },
  {
    name: 'generate_image',
    description:
      'Génère une image IA d\'un plat ou visuel restaurant. ' +
      'À utiliser uniquement si l\'utilisateur demande explicitement une image, photo ou visuel généré par IA.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Description précise du visuel à générer',
        },
        dish_name: {
          type: 'string',
          description: 'Nom du plat (optionnel)',
        },
      },
      required: ['prompt'],
    },
  },
]

async function execGenerateImage(input, openaiKey) {
  const dishPart = input.dish_name ? `${input.dish_name}, ` : ''
  const fullPrompt =
    `Professional food photography, ${dishPart}${input.prompt}, ` +
    `restaurant plate presentation, appetizing, high quality, natural light, bokeh background`

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { authorization: `Bearer ${openaiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: fullPrompt.slice(0, 1000),
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    }),
  })

  if (!res.ok) {
    console.error('[chef-ia] openai_image_error', res.status)
    return { error: 'Génération image indisponible.' }
  }
  const data = await res.json()
  const url = data.data?.[0]?.url
  return url ? { url } : { error: 'Aucune image renvoyée.' }
}

export default createApiHandler({
  routeName: 'chef-ia',
  rateLimit: { limit: 25, windowMs: 60_000 },
  async handler({ body }) {
    const claudeKey = requireEnv('ANTHROPIC_API_KEY')
    const openaiKey = optionalEnv('OPENAI_API_KEY')

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new ApiError(400, 'INVALID_MESSAGES', 'messages requis')
    }

    const messages = body.messages.map((m) => {
      if (!m.role || !m.content) throw new ApiError(400, 'INVALID_MESSAGE', 'message mal formé')
      return { role: m.role, content: String(m.content).slice(0, 4000) }
    })
    const system = body.system ? String(body.system).slice(0, 3000) : undefined

    // ── 1re passe : Claude avec outils ──────────────────────────────────────
    const r1 = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        ...(system ? { system } : {}),
        tools: TOOLS,
        tool_choice: { type: 'auto' },
        messages,
      }),
    })

    if (!r1.ok) {
      const details = await r1.text()
      console.error('[chef-ia] claude_r1_error', { status: r1.status, details })
      throw new ApiError(502, 'CLAUDE_ERROR', 'Chef IA indisponible.')
    }

    const d1 = await r1.json()
    const content1 = d1.content || []
    const textBlocks1 = content1.filter((b) => b.type === 'text')
    const toolBlocks = content1.filter((b) => b.type === 'tool_use')

    // Pas d'outil appelé → renvoie directement
    if (toolBlocks.length === 0) {
      return {
        text: textBlocks1.map((b) => b.text).join('\n').trim(),
        actions: [],
        usage: d1.usage || null,
      }
    }

    // ── Exécution des outils ─────────────────────────────────────────────────
    const actions = []
    const toolResults = []
    const now = Date.now()

    for (const tb of toolBlocks) {
      const { id, name, input } = tb
      let toolOutput = {}

      if (name === 'create_idea') {
        const idea = {
          id: `idea_chef_${now}_${Math.random().toString(36).slice(2, 6)}`,
          hook: String(input.hook || '').slice(0, 120),
          format: input.format || 'Reel',
          plateforme: input.plateforme || 'Instagram',
          brief: String(input.brief || '').slice(0, 500),
          legende: String(input.legende || '').slice(0, 300),
          difficulte: 'Facile',
          _fromChef: true,
        }
        actions.push({ type: 'create_idea', data: idea })
        toolOutput = { success: true, id: idea.id, message: `Idée "${idea.hook}" ajoutée.` }
      } else if (name === 'add_calendar_event') {
        // Validate date format
        const dateStr = String(input.date || '')
        const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        const post = {
          id: `post_chef_${now}_${Math.random().toString(36).slice(2, 6)}`,
          type: String(input.type || 'Post IA').slice(0, 100),
          date: dateValid ? dateStr : new Date().toISOString().split('T')[0],
          format: input.format || 'Reel',
          plateformes: Array.isArray(input.plateformes) ? input.plateformes : ['Instagram'],
          hook: String(input.hook || '').slice(0, 120),
          brief: String(input.brief || '').slice(0, 500),
          legende: String(input.legende || '').slice(0, 300),
          description: String(input.brief || '').slice(0, 500),
          status: 'idee',
          _fromChef: true,
        }
        actions.push({ type: 'add_calendar_event', data: post })
        toolOutput = { success: true, id: post.id, message: `Post planifié le ${post.date}.` }
      } else if (name === 'generate_image') {
        if (!openaiKey) {
          toolOutput = { error: 'Génération image non configurée.' }
        } else {
          toolOutput = await execGenerateImage(input, openaiKey)
          if (toolOutput.url) {
            actions.push({
              type: 'generate_image',
              data: { url: toolOutput.url, dish_name: input.dish_name || '', prompt: input.prompt },
            })
          }
        }
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: id,
        content: JSON.stringify(toolOutput),
      })
    }

    // ── 2e passe : Claude confirme les actions ───────────────────────────────
    const r2 = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        ...(system ? { system } : {}),
        messages: [
          ...messages,
          { role: 'assistant', content: content1 },
          { role: 'user', content: toolResults },
        ],
      }),
    })

    let finalText = textBlocks1.map((b) => b.text).join('\n').trim()

    if (r2.ok) {
      const d2 = await r2.json()
      const t2 = (d2.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
      if (t2) finalText = t2
    }

    return {
      text: finalText,
      actions,
      usage: d1.usage || null,
    }
  },
})
