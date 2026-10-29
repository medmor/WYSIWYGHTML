/**
 * Minimal i18n layer (French / Arabic).
 *
 * Localizes the app chrome (navbar, AI sidebar, dialogs) and the document
 * direction used by the editor configuration. The CKEditor 5 UI itself is
 * localized through CKEditor's own `translations` + `language` config.
 */

const LANGUAGE_KEY = 'appLanguage';

const translations = {
	fr: {
		// Navbar
		newFile: 'Nouveau',
		open: 'Ouvrir',
		save: 'Enregistrer',
		saveAs: 'Enregistrer sous',
		pdf: 'PDF',
		newDocument: 'Nouveau fichier',
		noChanges: 'Aucune modification',
		unsavedChanges: 'Modifications non enregistrées',
		exportPdf: 'Exporter en PDF',
		paginationView: 'Vue paginée (A4)',
		margins: 'Marges',
		zoomIn: 'Zoom avant',
		zoomOut: 'Zoom arrière',
		resetZoom: 'Réinitialiser',
		languageToggle: 'Changer la langue',
		langFr: 'Français',
		langAr: 'العربية',

		// AI sidebar
		aiAssistant: 'AI Assistant',
		aiCheckStatus: 'Vérification de la connexion...',
		aiNotAvailable: 'Ollama non disponible',
		aiNotAvailableDesc: 'L\'assistant IA nécessite Ollama. Démarrez-le avec :',
		aiRetry: 'Réessayer',
		aiModel: 'Modèle',
		aiLoading: 'Chargement...',
		aiPrompt: 'Prompt',
		aiPromptPlaceholder: 'Décrivez ce que vous voulez générer...',
		aiGenerate: 'Générer',
		aiFixGrammar: 'Corriger',
		aiComplete: 'Compléter',
		aiResult: 'Résultat',
		aiResultPlaceholder: 'Le résultat apparaîtra ici...',
		aiInsert: 'Insérer dans l\'éditeur',
		aiStatusConnected: 'Connecté ({model})',
		aiStatusDisconnected: 'Déconnecté',
		aiPromptEmpty: 'Please enter a prompt',
		aiNotConnected: 'Not connected to Ollama. Please check if Ollama is running.',
		aiSelectTextFix: 'Please select some text to fix',
		aiSelectTextComplete: 'Please select some text to complete',
		aiNoContent: 'No content to insert',

		// Dialogs / editor
		errorOpen: 'Erreur lors de l\'ouverture du fichier : ',
		errorSave: 'Erreur lors de l\'enregistrement : ',
		unsavedPrompt: 'Vous avez des modifications non enregistrées. Voulez-vous continuer ?',
		unsavedQuitPrompt: 'Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de quitter ?',
		appTitleNew: 'WYSIWYG HTML Editor : Nouveau document',
		editorPlaceholder: 'Tapez ou collez votre contenu ici !'
	},
	ar: {
		// Navbar
		newFile: 'جديد',
		open: 'فتح',
		save: 'حفظ',
		saveAs: 'حفظ باسم',
		pdf: 'PDF',
		newDocument: 'ملف جديد',
		noChanges: 'لا توجد تغييرات',
		unsavedChanges: 'تغييرات غير محفوظة',
		exportPdf: 'تصدير PDF',
		paginationView: 'عرض الصفحات (A4)',
		margins: 'الهوامش',
		zoomIn: 'تكبير',
		zoomOut: 'تصغير',
		resetZoom: 'إعادة تعيين',
		languageToggle: 'تغيير اللغة',
		langFr: 'Français',
		langAr: 'العربية',

		// AI sidebar
		aiAssistant: 'المساعد الذكي',
		aiCheckStatus: 'جارٍ التحقق من الاتصال...',
		aiNotAvailable: 'Ollama غير متوفر',
		aiNotAvailableDesc: 'يتطلب المساعد الذكي تشغيل Ollama. ابدأه باستخدام:',
		aiRetry: 'إعادة المحاولة',
		aiModel: 'النموذج',
		aiLoading: 'جارٍ التحميل...',
		aiPrompt: 'الطلب',
		aiPromptPlaceholder: 'صف ما تريد إنشاءه...',
		aiGenerate: 'إنشاء',
		aiFixGrammar: 'تصحيح',
		aiComplete: 'إكمال',
		aiResult: 'النتيجة',
		aiResultPlaceholder: 'ستظهر النتيجة هنا...',
		aiInsert: 'إدراج في المحرر',
		aiStatusConnected: 'متصل ({model})',
		aiStatusDisconnected: 'غير متصل',
		aiPromptEmpty: 'يرجى إدخال طلب',
		aiNotConnected: 'غير متصل بـ Ollama. تحقق من تشغيله.',
		aiSelectTextFix: 'يرجى تحديد النص الذي تريد تصحيحه',
		aiSelectTextComplete: 'يرجى تحديد النص الذي تريد إكماله',
		aiNoContent: 'لا يوجد محتوى لإدراجه',

		// Dialogs / editor
		errorOpen: 'حدث خطأ أثناء فتح الملف: ',
		errorSave: 'حدث خطأ أثناء الحفظ: ',
		unsavedPrompt: 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟',
		unsavedQuitPrompt: 'لديك تغييرات غير محفوظة. هل تريد حفظها قبل الخروج؟',
		appTitleNew: 'محرر HTML WYSIWYG : مستند جديد',
		editorPlaceholder: 'اكتب أو الصق المحتوى هنا!'
	}
};

/**
 * Get the current app language ('fr' or 'ar').
 * @returns {'fr'|'ar'}
 */
export function getLanguage() {
	const saved = localStorage.getItem(LANGUAGE_KEY);
	return saved === 'ar' || saved === 'fr' ? saved : 'fr';
}

/**
 * Persist the app language.
 * @param {'fr'|'ar'} lang
 */
export function setLanguage(lang) {
	localStorage.setItem(LANGUAGE_KEY, lang === 'ar' ? 'ar' : 'fr');
}

/**
 * Get the language the user is not currently using.
 * @returns {'fr'|'ar'}
 */
export function getOtherLanguage() {
	return getLanguage() === 'ar' ? 'fr' : 'ar';
}

/**
 * Get the writing direction ('ltr' | 'rtl') for a language.
 * @param {string} [lang]
 * @returns {'ltr'|'rtl'}
 */
export function getDirection(lang = getLanguage()) {
	return lang === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Translate a key using the current language.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
	const lang = getLanguage();
	const table = translations[lang] || translations.fr;
	return table[key] ?? translations.fr[key] ?? key;
}

/**
 * Apply the current language to the document:
 * sets the <html> lang/dir and fills every `data-i18n*` element.
 */
export function applyLanguageToDocument() {
	const html = document.documentElement;
	html.setAttribute('lang', getLanguage());
	html.setAttribute('dir', getDirection());

	document.querySelectorAll('[data-i18n]').forEach(el => {
		el.textContent = t(el.dataset.i18n);
	});
	document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
		el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
	});
	document.querySelectorAll('[data-i18n-title]').forEach(el => {
		el.setAttribute('title', t(el.dataset.i18nTitle));
	});
}