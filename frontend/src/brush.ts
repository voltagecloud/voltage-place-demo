import './brush.css';
import { canvas, widthInput, brush, scaleInput } from './els';

scaleInput.addEventListener('input', function () {
	const s = Number(this.value);
	const main = canvas.parentElement;
	if (s === 1) {
		main?.classList.remove('scaled');
		canvas.style.transform = '';
	} else {
		main?.classList.add('scaled');
		canvas.style.transform = `scale(${s})`;
	}
	setBrushSize();
});

function setBrushSize() {
	const { width } = canvas.getBoundingClientRect();
	const scale = width / canvas.offsetWidth;
	const size = scale * Number(widthInput.value);
	const v = Math.max(size, 16);
	brush.style.width = `${v}px`;
	brush.style.margin = `-${v / 2}px 0 0 -${v / 2}px`;
}

setBrushSize();
widthInput.addEventListener('change', setBrushSize);

canvas.addEventListener('mousemove', (e) => {
	brush.removeAttribute('hidden');
	brush.style.left = `${e.clientX}px`;
	brush.style.top = `${e.clientY}px`;
});

canvas.addEventListener(
	'touchmove',
	() => {
		brush.setAttribute('hidden', 'hidden');
	},
	{ passive: true }
);
