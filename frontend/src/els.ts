export const nav = document.querySelector<HTMLElement>('body > nav')!;
export const canvas = document.querySelector<HTMLCanvasElement>('main > canvas')!;
export const colorInput = document.querySelector<HTMLInputElement>('input[name=color]')!;
export const widthInput = document.querySelector<HTMLInputElement>('input[name=width]')!;
export const scaleInput = document.querySelector<HTMLInputElement>('input[name=scale]')!;
export const dialog = document.querySelector<HTMLDialogElement>('body > dialog')!;
export const brush = document.querySelector<HTMLSpanElement>('span.brush')!;

type Replacements = Record<string, string | ((n: HTMLElement) => unknown)>;
type Templates = Record<
	'drawing' | 'buying' | 'negotiating' | 'loading' | 'paying',
	(el: HTMLElement, replace?: Replacements) => void
>;
export const template = Array.from(document.querySelectorAll('template')).reduce(
	(memo, one) => ({
		...memo,
		[one.id]: (el: HTMLElement, replace: Replacements = {}) => {
			el.className = one.id;
			el.innerHTML = '';
			el.appendChild(one.content.cloneNode(true));

			Object.keys(replace).forEach((selector) => {
				const s = el.querySelector<HTMLElement>(selector);
				if (s) {
					const v = replace[selector];
					if (typeof v === 'function') {
						v(s);
					} else {
						s.innerText = v;
					}
				}
			});
		}
	}),
	{} as Templates
);

export function getCoordinates(evt: MouseEvent | TouchEvent) {
	const { pageX, pageY } = evt instanceof TouchEvent ? evt.changedTouches[0] : evt;
	const rect = canvas.getBoundingClientRect();
	const scale = rect.width / canvas.offsetWidth;
	const out = {
		x: (pageX - rect.left) / scale,
		y: (pageY - rect.top) / scale
	};
	return out;
}
