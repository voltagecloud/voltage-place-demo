import { renderDrawingNav, renderBuyingNav } from './nav';
import { hexAtCoords, changedPixels } from './utils';
import { canvas, colorInput, widthInput, getCoordinates } from './els';
import './brush';
import { handleBuyClicked } from './pay';

const ctx = get2dContext(canvas);

export const image = new Image();

image.addEventListener('load', initCanvas);

function get2dContext(c: HTMLCanvasElement) {
	return c.getContext('2d', { willReadFrequently: true })!;
}

function initCanvas() {
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	renderDrawingNav();
}

let drawing = 0;

type TouchOrMouse = TouchEvent | MouseEvent;

function pickColor(event: TouchOrMouse) {
	const { x, y } = getCoordinates(event);
	colorInput.value = `#${hexAtCoords(ctx, x, y)}`;
	console.info('picked', colorInput.value);
}

function startDrawing(event: TouchOrMouse) {
	const { x, y } = getCoordinates(event);

	if (drawing) {
		return;
	}

	console.log('startDrawing', event.type);
	drawing = 1;
	canvas.classList.add('drawing');
	ctx.beginPath();
	ctx.lineWidth = Number(widthInput.value);
	ctx.strokeStyle = colorInput.value;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.moveTo(x, y);
}

function doDrawing(event: TouchOrMouse) {
	if (!drawing) return;
	event.preventDefault();

	console.log('doDrawing', event.type);
	drawing++;
	const { x, y } = getCoordinates(event);
	ctx.lineTo(x, y);
	ctx.stroke();
}

function stopDrawing(event: TouchOrMouse) {
	if (!drawing) return;
	event.preventDefault();

	console.log('stopDrawing', event.type);

	canvas.classList.remove('drawing');
	if (drawing === 1 && ['touchend', 'mouseup'].includes(event.type)) {
		pickColor(event);
	}
	drawing = 0;

	const changed = compareCanvii();
	const count = Object.values(changed).reduce((m, a) => m + a.length, 0);
	if (count) {
		renderBuyingNav(
			count,
			() => {
				handleBuyClicked(changed);
			},
			initCanvas
		);
	}
}

function skipMulti(handler: (e: TouchOrMouse) => void) {
	return (event: TouchEvent) => {
		if (event.touches.length === 1) {
			return handler(event);
		}
	};
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', doDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('touchstart', skipMulti(startDrawing));
canvas.addEventListener('touchmove', skipMulti(doDrawing));
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

function compareCanvii() {
	const { height, width } = canvas;

	const o = get2dContext(canvas.cloneNode() as HTMLCanvasElement);
	o.drawImage(image, 0, 0, height, width);

	const old = o.getImageData(0, 0, height, width);
	const art = ctx.getImageData(0, 0, height, width);

	return changedPixels(old, art);
}
