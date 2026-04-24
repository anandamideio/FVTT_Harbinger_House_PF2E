import { log } from '../config';
import { SigilMapLayer } from '../sigil-map';

export class CanvasLayerRegistrar {
	register(): void {
		if (!CONFIG.Canvas?.layers) return;

		CONFIG.Canvas.layers.sigilMap = {
			layerClass: SigilMapLayer,
			group: 'interface',
		};

		log('Sigil Investigation Map canvas layer registered');
	}
}
