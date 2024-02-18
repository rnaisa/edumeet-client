/**
 * ML Backend: TF Lite
 * Copyright 2018 Google LLC
 * License: Apache 2.0
 * https://github.com/google-coral/tflite/blob/master/LICENSE
 * 
 * Model: MediaPipe Selfie Segmentation
 * Copyright 2021 Google LLC
 * License: Apache 2.0
 * https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf
 */

import EventEmitter from 'events';
import { Logger, timeoutPromise } from 'edumeet-common';
import { BlurBackgroundNotSupportedError, BlurTrack } from '../utils/blurbackground/BlurTrack';
import { EffectsTrack } from '../utils/types';

const logger = new Logger('EffectsService');

declare function createTFLiteModule(): Promise<TFLite>
declare function createTFLiteSIMDModule(): Promise<TFLite>

export interface TFLite {
  _getModelBufferMemoryOffset(): number
  _getInputMemoryOffset(): number
  _getInputHeight(): number
  _getInputWidth(): number
  _getInputChannelCount(): number
  _getOutputMemoryOffset(): number
  _getOutputHeight(): number
  _getOutputWidth(): number
  _getOutputChannelCount(): number
  // eslint-disable-next-line no-unused-vars
  _loadModel(bufferSize: number): number
  _runInference(): number
  /* eslint-disable @typescript-eslint/no-explicit-any */
  HEAPU8: any
  HEAPF32: any
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
	
export const modelConfig = {
	path: '/model/selfie_segmenter_landscape.tflite',
	width: 256,
	height: 144
};

/**
 * A service that handles tensorflow and mediapipe effects on the video stream, and RNNoise on the audio stream.
 */
export class EffectsService extends EventEmitter {
	private effectTracks = new Map<string, EffectsTrack>();
	private model?: ArrayBuffer;
	public webGLSupport = false;

	public async applyEffect(track: MediaStreamTrack): Promise<MediaStreamTrack> {
		logger.debug('applyEffect() [track.id %s, kind: %s]', track.id, track.kind);
		if (track.kind !== 'video')
			throw new Error('Audio effects are not yet implemented.');

		const MLBackend = await this.createMLBackend();

		if (!this.model) this.model = await this.createModel();

		const effectTrack = new BlurTrack(MLBackend, this.model, track, this.webGLSupport);

		this.effectTracks.set(effectTrack.outputTrack.id, effectTrack);

		return effectTrack.outputTrack;
	}

	public stop(trackId?: string): void {
		logger.debug('stop() [trackId %s]', trackId);
		if (trackId) {
			const track = this.effectTracks.get(trackId);

			if (track) {
				track.stop();
				this.effectTracks.delete(trackId);
			}
		} else {
			this.effectTracks.forEach((track) => track.stop());

			this.effectTracks.clear();
		}
	}

	private async createMLBackend() {
		let MLBackend: TFLite | undefined;
		const LOAD_BACKEND_TIMEOUT = 10000;

		// Try if browser has SIMD-support.
		try {
			MLBackend = await timeoutPromise(createTFLiteSIMDModule(), LOAD_BACKEND_TIMEOUT);
			if (!MLBackend) throw new Error('No ML Backend');
		} catch (error) {
			logger.error(error);
		}

		// If not, try without SIMD support.
		if (!MLBackend) {
			try {
				MLBackend = await timeoutPromise(createTFLiteModule(), LOAD_BACKEND_TIMEOUT);
				if (!MLBackend) throw new Error('No ML Backend');
			} catch (error) {
				logger.error(error);
			} 
		}

		if (!MLBackend) {
			throw new BlurBackgroundNotSupportedError('Could not create ML Backend');
		}

		return MLBackend;	
	}

	private async createModel() {
		const response = await fetch(modelConfig.path);

		if (!response.ok) throw new BlurBackgroundNotSupportedError('Could not load model');

		return await response.arrayBuffer();
	}
}