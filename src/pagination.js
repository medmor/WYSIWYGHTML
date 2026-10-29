/**
 * Live page-boundary overlay for the editor.
 *
 * The document stays a single continuous editable — CKEditor owns one DOM
 * root, so true reflow pagination would require splitting the model. Instead
 * we draw A4 page boundaries and page numbers on top of the canvas as a
 * visual guide while typing. The overlay lives inside
 * `.editor-container__editor`, so it inherits the zoom transform and stays
 * aligned with the page.
 *
 * Limitation: a page's top/bottom margin is only applied to the whole
 * editable, so the first line of a page starts at the boundary (there is no
 * per-page top margin) and content can sit near a boundary. The boundary is a
 * guide, not a hard split. PDF export is unchanged (Chromium paginates at
 * export time).
 */

import { PAGE } from './pageConfig.js';

const MM_TO_PX = 96 / 25.4;
export const PAGE_WIDTH_PX = PAGE.widthMm * MM_TO_PX;
export const PAGE_HEIGHT_PX = PAGE.heightMm * MM_TO_PX;

const STORAGE_KEY = 'paginationView';

class PaginationManager {
	constructor() {
		this.editor = null;
		this.editable = null;
		this.container = null; // .editor-container__editor
		this.root = null; // .editor-container (mode class target)
		this.overlay = null;
		this.observer = null;
		this.updateTimer = null;
		this.enabled = localStorage.getItem(STORAGE_KEY) === 'on';
		this.onResize = this.onResize.bind(this);
	}

	/**
	 * @param {import('ckeditor5').Editor} editor
	 */
	init(editor) {
		this.editor = editor;
		this.editable = editor.ui.getEditableElement();
		this.container = document.querySelector('.editor-container__editor');
		this.root = document.querySelector('.editor-container');

		if (!this.editable || !this.container || !this.root) return;

		// Follow content height/width changes (typing, images loading, etc.).
		if (typeof ResizeObserver !== 'undefined') {
			this.observer = new ResizeObserver(this.onResize);
			this.observer.observe(this.editable);
		}
		window.addEventListener('resize', this.onResize);

		if (this.enabled) {
			this.enable({ silent: true });
		}
		this.syncButton();
	}

	onResize() {
		if (!this.enabled) return;
		this.scheduleUpdate();
	}

	scheduleUpdate() {
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(() => this.update(), 120);
	}

	enable(options = {}) {
		if (!this.editable) return;
		this.enabled = true;
		localStorage.setItem(STORAGE_KEY, 'on');
		this.root.classList.add('editor-container_paginated');
		this.container.classList.add('pagination-active');
		if (!this.overlay) {
			this.overlay = document.createElement('div');
			this.overlay.className = 'pagination-overlay';
			this.overlay.setAttribute('aria-hidden', 'true');
			this.container.appendChild(this.overlay);
		}
		this.update();
		if (!options.silent) this.syncButton();
	}

	disable(options = {}) {
		this.enabled = false;
		localStorage.setItem(STORAGE_KEY, 'off');
		if (this.root) this.root.classList.remove('editor-container_paginated');
		if (this.container) this.container.classList.remove('pagination-active');
		if (this.overlay && this.overlay.parentNode) {
			this.overlay.parentNode.removeChild(this.overlay);
		}
		this.overlay = null;
		if (!options.silent) this.syncButton();
	}

	toggle() {
		if (this.enabled) {
			this.disable();
		} else {
			this.enable();
		}
	}

	/** Re-apply the mode class (fullscreen restores container classes) and redraw. */
	refresh() {
		if (!this.enabled || !this.root) return;
		this.root.classList.add('editor-container_paginated');
		this.container.classList.add('pagination-active');
		this.scheduleUpdate();
	}

	syncButton() {
		const btn = document.getElementById('toggle-pagination');
		if (btn) btn.classList.toggle('btn-active', this.enabled);
	}

	update() {
		if (!this.enabled || !this.overlay || !this.editable) return;
		if (!this.editable.offsetWidth) return;

		const style = getComputedStyle(this.editable);
		const padTop = parseFloat(style.paddingTop) || 0;
		const padBottom = parseFloat(style.paddingBottom) || 0;

		const contentHeight = Math.max(
			0,
			this.editable.scrollHeight - padTop - padBottom
		);
		const pageCount = Math.max(1, Math.ceil((contentHeight - 1) / PAGE_HEIGHT_PX));

		// Position the overlay exactly over the editable canvas.
		this.overlay.style.left = `${this.editable.offsetLeft}px`;
		this.overlay.style.top = `${this.editable.offsetTop}px`;
		this.overlay.style.width = `${this.editable.offsetWidth}px`;
		this.overlay.style.height = `${this.editable.offsetHeight}px`;

		const frag = document.createDocumentFragment();

		for (let i = 1; i < pageCount; i++) {
			const boundary = document.createElement('div');
			boundary.className = 'pagination-boundary';
			boundary.style.top = `${padTop + i * PAGE_HEIGHT_PX}px`;
			frag.appendChild(boundary);
		}

		for (let n = 1; n <= pageCount; n++) {
			const label = document.createElement('div');
			label.className = 'pagination-page-label';
			label.textContent = String(n);
			label.style.top = `${padTop + (n - 1) * PAGE_HEIGHT_PX}px`;
			frag.appendChild(label);
		}

		this.overlay.textContent = '';
		this.overlay.appendChild(frag);
	}
}

export const paginationManager = new PaginationManager();
