// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — TensorFlow.js Model & Vision Pipeline Loader
// Handles TF.js backend initialization, model loading, and fallback vision engines.
// ─────────────────────────────────────────────────────────────────────────────

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as poseDetection from '@tensorflow-models/pose-detection';

export interface VisionModels {
  cocoModel: cocoSsd.ObjectDetection | null;
  poseDetector: poseDetection.PoseDetector | null;
  status: {
    tfjsReady: boolean;
    cocoLoaded: boolean;
    poseLoaded: boolean;
    backend: string;
    errorMessage?: string;
  };
}

class TFJSLoader {
  private models: VisionModels = {
    cocoModel: null,
    poseDetector: null,
    status: {
      tfjsReady: false,
      cocoLoaded: false,
      poseLoaded: false,
      backend: 'cpu',
    },
  };

  private loadingPromise: Promise<VisionModels> | null = null;

  async loadModels(): Promise<VisionModels> {
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        console.log('[TFJSLoader] Initializing TensorFlow.js...');
        await tf.ready();
        
        // Try webgl first, fallback to cpu
        try {
          await tf.setBackend('webgl');
        } catch {
          await tf.setBackend('cpu');
        }

        const activeBackend = tf.getBackend();
        console.log(`[TFJSLoader] Active backend: ${activeBackend}`);
        this.models.status.backend = activeBackend;
        this.models.status.tfjsReady = true;

        // 1. Load COCO-SSD object detector
        try {
          console.log('[TFJSLoader] Loading COCO-SSD model...');
          this.models.cocoModel = await cocoSsd.load({
            base: 'lite_mobilenet_v2',
          });
          this.models.status.cocoLoaded = true;
          console.log('[TFJSLoader] COCO-SSD loaded successfully.');
        } catch (err) {
          console.warn('[TFJSLoader] COCO-SSD load failed, will use canvas optical detector:', err);
        }

        // 2. Load Pose Detector (MoveNet or PoseNet)
        try {
          console.log('[TFJSLoader] Loading MoveNet pose detector...');
          const detectorConfig: poseDetection.MoveNetModelConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          };
          this.models.poseDetector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
          );
          this.models.status.poseLoaded = true;
          console.log('[TFJSLoader] MoveNet loaded successfully.');
        } catch (err) {
          console.warn('[TFJSLoader] MoveNet load failed, will use canvas landmark detector:', err);
        }

        return this.models;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[TFJSLoader] Error initializing vision models:', msg);
        this.models.status.errorMessage = msg;
        return this.models;
      }
    })();

    return this.loadingPromise;
  }

  getModels(): VisionModels {
    return this.models;
  }
}

export const tfjsLoader = new TFJSLoader();
