import { ChangedPixels, eventOnce, postJson, sleep } from './utils';
import './pay.css';
import { dialog, template } from './els';
import { qrcanvas } from 'qrcanvas';

export async function handleBuyClicked(changed: ChangedPixels) {
	template.loading(dialog);
	dialog.showModal();

	try {
		const { purchaseId, numPixels } = await fetchPurchase(changed);

		template.negotiating(dialog, {
			code: purchaseId
		});
		const input = dialog.querySelector('input')!;
		const v = String(numPixels);
		input.value = v;
		input.setAttribute('min', v);

		await eventOnce('click', dialog.querySelector('button.bolt11'));
		const price = input.value;

		template.loading(dialog);
		const payment = await fetchInvoice(purchaseId, Number(price));
		console.debug(payment.request);

		template.paying(dialog, {
			pre: payment.request,
			a: (a) => a.setAttribute('href', `lightning://${payment.request}`),
			canvas: (c) => qrcanvas({
				data: payment.request,
				size: 300,
				canvas: c as HTMLCanvasElement
			})
		});

		await sleep(10_000);
		await pollForPayment(payment.hash);
	} catch (e) {
		alert('Something went wrong, check console');
		console.error(e);
		dialog.close();
	}
}

async function fetchPurchase(pixels: ChangedPixels) {
	console.log('fetchPurchase');
	return postJson<{
		purchaseId: string;
		numPixels: number;
	}>('/purchase', {
		order: Object.keys(pixels).map((color) => ({ color: `#${color}`, pixels: pixels[color] }))
	});
}

async function fetchInvoice(purchaseId: string, amount = 1) {
	console.log('fetchInvoice', purchaseId, amount);
	return postJson<{
		hash: string;
		request: string;
	}>('/payment/create', {
		purchaseId,
		amount
	});
}

function checkPayment(hash: string) {
	console.log('checkPayment', hash);
	return postJson<{ paid: boolean }>('/payment/check', { hash });
}

async function pollForPayment(hash: string, delay = 5000, maxAttempts = 5) {
	const p = dialog.querySelector<HTMLParagraphElement>('p.poll')!;
	for (let a = 1; a <= maxAttempts; a++) {
		if (!dialog.open) {
			return;
		}
		p.innerText = `(${a}/${maxAttempts}) Checking...`; 
		const { paid } = await checkPayment(hash);
		if (paid) {
			template.loading(dialog, {
				h6: 'Payment detected!',
				small: 'The page will reload shortly'
			});
			await sleep(1000);
			location.reload();
			return true;
		} else if(a < maxAttempts) {
			p.innerText = `(${a}/${maxAttempts}) Not paid yet.`; 
			await sleep(delay);
		}
	}
	p.innerHTML = `Stopped polling. <a href="#">Continue</a>.`; 
	p.querySelector('a')?.addEventListener('click', (e) => {
		e.preventDefault();
		pollForPayment(hash, delay, maxAttempts * 2);
	}, { once: true })
	return false;
}
