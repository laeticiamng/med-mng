import type { Express, Request, Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Resvg } from '@resvg/resvg-js';

interface ItemRecord {
  item_code: string;
  title: string;
  subtitle?: string | null;
  tableau_rang_a?: unknown;
  tableau_rang_b?: unknown;
  updated_at?: string | null;
}

interface TableauSummary {
  title: string;
  sections: number;
}

interface OgItemData {
  itemCode: string;
  title: string;
  subtitle?: string;
  updatedAt?: string;
  rangA: TableauSummary;
  rangB: TableauSummary;
}

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

let cachedClient: SupabaseClient | null | undefined;

function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn('[og-item] Missing Supabase credentials – falling back to placeholder data');
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}

function parseTableau(input: unknown, fallbackTitle: string): TableauSummary {
  if (!input) {
    return { title: fallbackTitle, sections: 0 };
  }

  type TableauLike = {
    title?: unknown;
    sections?: unknown;
  };

  let parsed: TableauLike;

  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input) as TableauLike;
    } catch (error) {
      console.warn('[og-item] Unable to parse tableau JSON', error);
      return { title: fallbackTitle, sections: 0 };
    }
  } else if (typeof input === 'object' && input !== null) {
    parsed = input as TableauLike;
  } else {
    return { title: fallbackTitle, sections: 0 };
  }

  const title = typeof parsed.title === 'string' ? parsed.title : fallbackTitle;
  const sections = Array.isArray(parsed.sections) ? parsed.sections.length : 0;

  return { title, sections };
}

async function fetchItemMetadata(itemId: string): Promise<OgItemData> {
  const client = getSupabaseClient();

  if (!client) {
    return createFallbackMetadata(itemId);
  }

  try {
    const { data, error } = await client
      .from('edn_items_complete')
      .select('item_code, title, subtitle, tableau_rang_a, tableau_rang_b, updated_at')
      .or(`item_code.eq.${itemId},slug.eq.${itemId}`)
      .maybeSingle();

    if (error) {
      console.error('[og-item] Supabase query failed', error);
      return createFallbackMetadata(itemId);
    }

    if (!data) {
      return createFallbackMetadata(itemId);
    }

    return {
      itemCode: data.item_code || itemId,
      title: data.title || `Item ${itemId}`,
      subtitle: data.subtitle ?? undefined,
      updatedAt: data.updated_at ?? undefined,
      rangA: parseTableau(data.tableau_rang_a, 'Tableau Rang A'),
      rangB: parseTableau(data.tableau_rang_b, 'Tableau Rang B'),
    };
  } catch (error) {
    console.error('[og-item] Unexpected error while fetching metadata', error);
    return createFallbackMetadata(itemId);
  }
}

function createFallbackMetadata(itemId: string): OgItemData {
  return {
    itemCode: itemId,
    title: `Item ${itemId}`,
    subtitle: 'Préparation du contenu pédagogique en cours',
    rangA: { title: 'Tableau Rang A', sections: 0 },
    rangB: { title: 'Tableau Rang B', sections: 0 },
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const tentative = currentLine ? `${currentLine} ${word}` : word;

    if (tentative.length <= maxCharsPerLine) {
      currentLine = tentative;
      continue;
    }

    if (lines.length === maxLines - 1) {
      const truncated = (currentLine ? `${currentLine} ${word}` : word).slice(
        0,
        Math.max(0, maxCharsPerLine - 1)
      );
      lines.push(`${truncated}…`);
      return lines;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word.length > maxCharsPerLine ? `${word.slice(0, maxCharsPerLine - 1)}…` : word;
    } else {
      lines.push(`${word.slice(0, Math.max(0, maxCharsPerLine - 1))}…`);
      currentLine = '';
    }
  }

  if (currentLine) {
    if (lines.length === maxLines) {
      const lastIndex = maxLines - 1;
      lines[lastIndex] = `${lines[lastIndex].slice(0, Math.max(0, maxCharsPerLine - 1))}…`;
      return lines;
    }

    lines.push(currentLine);
  }

  return lines.slice(0, maxLines).map((line, index) => {
    if (index === maxLines - 1 && line.length > maxCharsPerLine) {
      return `${line.slice(0, maxCharsPerLine - 1)}…`;
    }
    return line;
  });
}

function buildSvg(metadata: OgItemData): string {
  const titleLines = wrapText(metadata.title, 28, 3);
  const subtitleLines = metadata.subtitle ? wrapText(metadata.subtitle, 40, 2) : [];

  const detailBoxes = [
    {
      label: 'Rang A',
      title: metadata.rangA.title,
      value:
        metadata.rangA.sections === 0
          ? 'À compléter'
          : `${metadata.rangA.sections} section${metadata.rangA.sections > 1 ? 's' : ''}`,
    },
    {
      label: 'Rang B',
      title: metadata.rangB.title,
      value:
        metadata.rangB.sections === 0
          ? 'À compléter'
          : `${metadata.rangB.sections} section${metadata.rangB.sections > 1 ? 's' : ''}`,
    },
  ];

  const detailBoxesSvg = detailBoxes
    .map((detail, index) => {
      const x = 80 + index * 360;
      return `
        <g transform="translate(${x}, 420)">
          <rect x="0" y="0" width="320" height="140" rx="18" fill="rgba(17, 24, 39, 0.55)" stroke="rgba(255, 255, 255, 0.18)" />
          <text x="24" y="52" fill="#8B5CF6" font-size="28" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="600">
            ${escapeXml(detail.label)}
          </text>
          <text x="24" y="92" fill="#F8FAFC" font-size="26" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="500">
            ${escapeXml(detail.title)}
          </text>
          <text x="24" y="122" fill="#E0E7FF" font-size="22" font-family="'Inter', 'Segoe UI', sans-serif">
            ${escapeXml(detail.value)}
          </text>
        </g>
      `;
    })
    .join('\n');

  const subtitleSvg = subtitleLines
    .map((line, idx) => {
      const y = 250 + titleLines.length * 60 + idx * 36;
      return `<text x="80" y="${y}" fill="#E0E7FF" font-size="32" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="400">${escapeXml(
        line
      )}</text>`;
    })
    .join('\n');

  const updatedText = metadata.updatedAt
    ? `<text x="80" y="380" fill="rgba(226,232,240,0.65)" font-size="22" font-family="'Inter', 'Segoe UI', sans-serif">Mis à jour le ${escapeXml(
        new Date(metadata.updatedAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      )}</text>`
    : '';

  const titleSvg = titleLines
    .map((line, idx) => {
      const y = 210 + idx * 60;
      return `<text x="80" y="${y}" fill="#F8FAFC" font-size="54" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="700">${escapeXml(
        line
      )}</text>`;
    })
    .join('\n');

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1E1B4B" />
          <stop offset="40%" stop-color="#312E81" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#A855F7" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#backgroundGradient)" rx="32" />

      <g opacity="0.25">
        <circle cx="1020" cy="-40" r="320" fill="url(#accentGradient)" />
        <circle cx="1120" cy="480" r="220" fill="url(#accentGradient)" />
        <circle cx="260" cy="520" r="180" fill="url(#accentGradient)" />
      </g>

      <text x="80" y="120" fill="#C7D2FE" font-size="32" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="600" letter-spacing="2">
        MED MNG · Item ${escapeXml(metadata.itemCode)}
      </text>

      ${titleSvg}
      ${subtitleSvg}
      ${updatedText}
      ${detailBoxesSvg}
    </svg>
  `;
}

async function createOgImage(metadata: OgItemData): Promise<Buffer> {
  const svg = buildSvg(metadata);
  const renderer = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: OG_WIDTH,
    },
    background: 'transparent',
  });

  const rendered = renderer.render();
  return Buffer.from(rendered.asPng());
}

async function handleOgRequest(req: Request, res: Response) {
  const itemId = req.params.id?.trim();

  if (!itemId) {
    res.status(400).json({ error: 'Missing item identifier' });
    return;
  }

  try {
    const metadata = await fetchItemMetadata(itemId);
    const pngBuffer = await createOgImage(metadata);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.setHeader('Content-Length', pngBuffer.length.toString());
    res.send(pngBuffer);
  } catch (error) {
    console.error('[og-item] Failed to generate OG image', error);
    res.status(500).json({ error: 'Unable to generate OG image' });
  }
}

export function registerOgItemRoute(app: Express) {
  app.get('/og/item/:id.png', handleOgRequest);
}
