export type MashunyaEmotion = 'smile' | 'surprised' | 'thoughtful' | 'empathetic' | 'serious' | 'idle';

export function detectMashunyaEmotion(text: string, userQuery: string = ''): MashunyaEmotion {
  const combined = (text + ' ' + userQuery).toLowerCase();

  if (
    combined.includes('цікаво') ||
    combined.includes('ого') ||
    combined.includes('вау') ||
    combined.includes('знайшла в мережі') ||
    combined.includes('виявляється') ||
    combined.includes('дивовижно') ||
    combined.includes('несподівано') ||
    combined.includes('новинк')
  ) {
    return 'surprised';
  }

  if (
    combined.includes('аналізую') ||
    combined.includes('шукаю') ||
    combined.includes('закон') ||
    combined.includes('порядок') ||
    combined.includes('процедура') ||
    combined.includes('стаття') ||
    combined.includes('розрахунок') ||
    combined.includes('перевіряю') ||
    combined.includes('інструкція')
  ) {
    return 'thoughtful';
  }

  if (
    combined.includes('допомог') ||
    combined.includes('турбот') ||
    combined.includes('підтримк') ||
    combined.includes('впо') ||
    combined.includes('ветеран') ||
    combined.includes('захисник') ||
    combined.includes('укритт') ||
    combined.includes('бережіть') ||
    combined.includes('соціальн')
  ) {
    return 'empathetic';
  }

  if (
    combined.includes('увага') ||
    combined.includes('важливо') ||
    combined.includes('обов\'язков') ||
    combined.includes('заборонен') ||
    combined.includes('термін') ||
    combined.includes('правила')
  ) {
    return 'serious';
  }

  return 'smile';
}
