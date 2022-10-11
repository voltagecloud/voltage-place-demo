import rgbHex from 'rgb-hex';

export function hexAtCoords(ctx: CanvasRenderingContext2D, x: number, y: number) {
	const { data } = ctx.getImageData(x, y, 1, 1);
	const [r, g, b] = data;
	return rgbHex(r, g, b);
}

export function hexAtOffset(data: Uint8ClampedArray, i: number) {
	const r = data[i];
	const g = data[i + 1];
	const b = data[i + 2];
	return rgbHex(r, g, b);
}

export type ChangedPixels = Record<string, number[]>;

export function changedPixels(original: ImageData, drawn: ImageData) {
	const changed: ChangedPixels = {};
	for (let i = 0; i < drawn.data.length; i += 4) {
		const dHex = hexAtOffset(drawn.data, i);
		const oHex = hexAtOffset(original.data, i);
		if (oHex !== dHex) {
			const id = i / 4;
			if (changed[dHex]) {
				changed[dHex].push(id);
			} else {
				changed[dHex] = [id];
			}
		}
	}
	return changed;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const eventOnce = (type: string, el: Element | null) =>
	new Promise<Event>((r) => el?.addEventListener(type, r, { once: true }));

export async function postJson<T = unknown>(url: string, data: unknown) {
	const res = await window.fetch(`${import.meta.env.VITE_BACKEND_API}${url}`, {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify(data)
	});

	if (res.ok) {
		const data = await res.json();
		console.log(url, data);
		return data as T;
	} else {
		const message = await res.text();
		throw new Error(`${res.status}: ${message || res.statusText}`);
	}
}
