/** "Loki (Season 2)" → "Loki", so artwork and the favourite tag match the show itself. */
export function baseTitle(title: string) {
    return title.replace(/\s*\((season|series)\s*\d+\)\s*$/i, '').trim();
}
