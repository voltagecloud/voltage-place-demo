import './main.css';
import { image } from './drawing';

image.src = import.meta.env.DEV ? '/tabconf.png' : `${import.meta.env.VITE_BACKEND_API}/image.png`;
