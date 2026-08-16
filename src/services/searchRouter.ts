/**
 * SearchRouter & SearchProvider Service
 * Implements search routing, source prioritization, verification,
 * and tool-like search handlers for Mashunya AI Agent.
 */

export type SearchCategory =
  | 'LOCAL'
  | 'OFFICIAL'
  | 'WEB'
  | 'MAP'
  | 'MARKETPLACE'
  | 'DOCUMENT'
  | 'NEWS'
  | 'WEATHER';

export interface WebSourceItem {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
  priority?: number; // 1: Official, 2: Registries, 3: Institutions, 4: Media
  isInternalSection?: boolean;
  internalAction?: string;
}

export interface SearchRouteResult {
  category: SearchCategory;
  query: string;
  needsWebSearch: boolean;
  prioritySources: string[];
  suggestedAction?: string;
}

/**
 * Parses user query to determine if Web Search is needed and identifies SearchCategory
 */
export function classifySearchIntent(userQuery: string): SearchRouteResult {
  const q = userQuery.toLowerCase().trim();

  // 1. Check if simple greeting / self question (No Internet needed)
  if (
    q === 'привіт' ||
    q === 'вітаю' ||
    q.includes('як тебе звати') ||
    q.includes('хто ти') ||
    q.includes('як ти можеш мені допомогти') ||
    q.includes('що ти вмієш')
  ) {
    return {
      category: 'LOCAL',
      query: userQuery,
      needsWebSearch: false,
      prioritySources: ['Системна база знань Рокитнівської громади']
    };
  }

  // 2. Weather Intent
  if (
    q.includes('погод') ||
    q.includes('температур') ||
    q.includes('дощ') ||
    q.includes('градус') ||
    q.includes('прогноз')
  ) {
    return {
      category: 'WEATHER',
      query: userQuery,
      needsWebSearch: true,
      prioritySources: ['Meteo.gov.ua', 'Sinoptik Rokytne'],
      suggestedAction: 'NAVIGATE_WEATHER'
    };
  }

  // 3. Map / Spatial Locations
  if (
    q.includes('де знаход') ||
    q.includes('кафе') ||
    q.includes('аптек') ||
    q.includes('карта') ||
    q.includes('маршрут') ||
    q.includes('де найближч') ||
    q.includes('відпочинок') ||
    q.includes('водойм')
  ) {
    return {
      category: 'MAP',
      query: userQuery,
      needsWebSearch: true,
      prioritySources: ['Інтерактивна Карта Рокитнівщини', 'Google Maps API'],
      suggestedAction: 'NAVIGATE_MAP'
    };
  }

  // 4. Marketplace / "Знайди мені..."
  if (
    q.includes('знайди мені') ||
    q.includes('купити') ||
    q.includes('продам') ||
    q.includes('ціна') ||
    q.includes('дрова') ||
    q.includes('мед') ||
    q.includes('трактор') ||
    q.includes('оренда') ||
    q.includes('що продають') ||
    q.includes('вакансі') ||
    q.includes('робот')
  ) {
    return {
      category: 'MARKETPLACE',
      query: userQuery,
      needsWebSearch: true,
      prioritySources: ['Локальний Маркетплейс Рокитного', 'Оголошення в мережі'],
      suggestedAction: 'NAVIGATE_MARKETPLACE'
    };
  }

  // 5. Official Documents / Council Decisions
  if (
    q.includes('рішення') ||
    q.includes('рада') ||
    q.includes('сесія') ||
    q.includes('земль') ||
    q.includes('земельн') ||
    q.includes('постанов') ||
    q.includes('регламент') ||
    q.includes('розпорядження')
  ) {
    return {
      category: 'DOCUMENT',
      query: userQuery,
      needsWebSearch: true,
      prioritySources: [
        'Офіційний портал Рокитнівської селищної ради (rokytne-gromada.gov.ua)',
        'Державний веб-портал rada.gov.ua'
      ]
    };
  }

  // 6. News & Events
  if (
    q.includes('новин') ||
    q.includes('сьогодні') ||
    q.includes('зараз') ||
    q.includes('подій') ||
    q.includes('що нового') ||
    q.includes('актуальн')
  ) {
    return {
      category: 'NEWS',
      query: userQuery,
      needsWebSearch: true,
      prioritySources: [
        'Офіційні новини Рокитнівської громади',
        'Рівненська ОВА (rv.gov.ua)',
        'Суспільне Рівне'
      ]
    };
  }

  // 7. Official CNAP / Government Services
  if (
    q.includes('чнап') ||
    q.includes('паспорт') ||
    q.includes('черг') ||
    q.includes('пільг') ||
    q.includes('впо') ||
    q.includes('старост') ||
    q.includes('заяв')
  ) {
    return {
      category: 'OFFICIAL',
      query: userQuery,
      needsWebSearch: true,
      prioritySources: [
        'Портал ЦНАП Рокитне (rokytne-gromada.gov.ua/cnap)',
        'Державний сервіс Дія (diia.gov.ua)'
      ],
      suggestedAction: q.includes('чнап') ? 'NAVIGATE_CNAP' : 'NAVIGATE_SOCIAL'
    };
  }

  // Default: Web Search
  return {
    category: 'WEB',
    query: userQuery,
    needsWebSearch: true,
    prioritySources: [
      'Офіційні ресурси Рокитнівської громади',
      'Google Search Network'
    ]
  };
}

/**
 * Filter & Sort sources based on requirement 4 source priority rules
 */
export function prioritizeWebSources(sources: WebSourceItem[]): WebSourceItem[] {
  return sources.map(src => {
    let priority = 4;
    const u = src.url.toLowerCase();

    if (u.includes('rokytne-gromada.gov.ua') || u.includes('.gov.ua') || u.includes('rv.gov.ua')) {
      priority = 1; // Official gov
    } else if (u.includes('prozorro') || u.includes('diia.gov.ua') || u.includes('opendatabot')) {
      priority = 2; // Registries
    } else if (u.includes('wikipedia') || u.includes('suspilne') || u.includes('ukrinform')) {
      priority = 3; // Official media / trusted
    }

    return { ...src, priority };
  }).sort((a, b) => (a.priority || 4) - (b.priority || 4));
}
