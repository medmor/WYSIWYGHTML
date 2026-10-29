/**
 * Single source of truth for the page geometry shared by the editor canvas
 * and the PDF export. Margins are uniform (the export pipeline only supports
 * a single margin value) and are chosen while editing via the navbar control.
 */

export const PAGE = {
	widthMm: 210,
	heightMm: 297,
	defaultMarginMm: 15
};

export const MARGIN_PRESETS_MM = [5, 10, 15, 20, 25];

export const PAGE_MARGIN_STORAGE_KEY = 'pageMarginMm';
