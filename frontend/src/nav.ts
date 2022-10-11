import { nav, template } from './els';

export function renderDrawingNav() {
	if (nav.className !== 'drawing') {
		template.drawing(nav);
		document.querySelectorAll('[hidden]').forEach((one) => one.removeAttribute('hidden'));
	}
}

export function renderBuyingNav(
	pixelCount: number,
	clickBuy: EventListener,
	clickCancel: EventListener
) {
	if (nav.className !== 'buying') {
		template.buying(nav, {
			'button.buy': (n) => n.addEventListener('click', clickBuy),
			'button.cancel': (n) => n.addEventListener('click', clickCancel),
			'button.buy > span': pixelCount.toLocaleString()
		});
	}
}

export default nav;
