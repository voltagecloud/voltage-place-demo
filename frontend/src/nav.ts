import { nav, template } from './els';

export function renderDrawingNav() {
	template.drawing(nav);
	document.querySelectorAll('[hidden]').forEach((one) => one.removeAttribute('hidden'));
}

export function renderBuyingNav(
	pixelCount: number,
	clickBuy: EventListener,
	clickCancel: EventListener
) {
	template.buying(nav, {
		'button.buy': (n) => n.addEventListener('click', clickBuy),
		'button.cancel': (n) => n.addEventListener('click', clickCancel),
		'button.buy > span': pixelCount.toLocaleString()
	});
}

export default nav;
