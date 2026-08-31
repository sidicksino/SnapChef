import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia';
import { loadTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';

import { INGREDIENT_LABELS } from '@/constants/ingredient-labels';

// assets/models/best_int8.tflite is a YOLOv8n object-detection model, read
// straight from its own tensor graph (no bundled metadata exists):
//   input:  [1, 3, 320, 320]  — 320x320 RGB, channel-first (NCHW)
//   output: [1, 124, 2100]    — 4 box channels + 120 class channels, 2100
//                                anchors (matches 320x320: 40²+20²+10²)
// Both tensors are float32 — the quantized int8 math is wrapped internally
// with quantize/dequantize ops, so this file never touches int8 directly.
const MODEL_INPUT_SIZE = 320;
const NUM_CLASSES = INGREDIENT_LABELS.length; // 120
const BOX_CHANNELS = 4;

// A class only needs to clear this once, on any anchor, to count as
// "present" — see the note on detectIngredients below for why this skips
// spatial NMS entirely.
const CONFIDENCE_THRESHOLD = 0.45;

export type Detection = {
  label: string;
  confidence: number;
};

let modelPromise: Promise<TensorflowModel> | null = null;

function getModel(): Promise<TensorflowModel> {
  if (!modelPromise) {
    modelPromise = loadTensorflowModel(require('../../assets/models/best_int8.tflite'), []).then(
      (model) => {
        assertExpectedShape(model);
        return model;
      }
    );
  }
  return modelPromise;
}

function assertExpectedShape(model: TensorflowModel) {
  const input = model.inputs[0];
  const output = model.outputs[0];
  const inputOk = input?.shape[2] === MODEL_INPUT_SIZE && input?.shape[3] === MODEL_INPUT_SIZE;
  const outputOk = output?.shape[1] === BOX_CHANNELS + NUM_CLASSES;
  if (!inputOk || !outputOk) {
    throw new Error(
      `best_int8.tflite has an unexpected shape (input ${input?.shape}, output ${output?.shape}) — ` +
        'ingredient-labels.ts was written for a 320x320 / 120-class model and needs updating to match.'
    );
  }
}

// Decodes the photo at `uri`, stretch-resizes it to the model's 320x320
// input (matching the "Stretch to" preprocessing the training dataset used,
// not a letterboxed/aspect-preserving resize), and packs it into a planar
// (NCHW) normalized float32 buffer.
async function preprocessImage(uri: string): Promise<Float32Array> {
  const data = await Skia.Data.fromURI(uri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) {
    throw new Error('Could not decode this photo.');
  }

  const surface = Skia.Surface.Make(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  if (!surface) {
    throw new Error('Could not create an offscreen surface to resize this photo.');
  }
  const canvas = surface.getCanvas();
  canvas.drawImageRect(
    image,
    Skia.XYWHRect(0, 0, image.width(), image.height()),
    Skia.XYWHRect(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE),
    Skia.Paint()
  );

  const pixels = surface.makeImageSnapshot().readPixels(0, 0, {
    width: MODEL_INPUT_SIZE,
    height: MODEL_INPUT_SIZE,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!(pixels instanceof Uint8Array)) {
    throw new Error('Could not read pixel data from the resized photo.');
  }

  const plane = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const nchw = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    const o = i * 4; // RGBA_8888 is 4 bytes/pixel; alpha (o+3) is dropped
    nchw[i] = pixels[o] / 255; // R plane
    nchw[plane + i] = pixels[o + 1] / 255; // G plane
    nchw[plane * 2 + i] = pixels[o + 2] / 255; // B plane
  }
  return nchw;
}

// Detects which of the 120 trained ingredient classes appear anywhere in the
// photo. This deliberately skips box decoding and NMS: the app only needs a
// *list* of ingredients (for the recipe-generation flow), not their
// locations or how many of each are on screen, so "did any anchor score this
// class above the threshold" is the whole detection rule — the max score for
// a class across all 2100 anchors is a legitimate per-class confidence.
export async function detectIngredients(uri: string): Promise<Detection[]> {
  const [model, input] = await Promise.all([getModel(), preprocessImage(uri)]);
  const [outputBuffer] = model.runSync([input.buffer as ArrayBuffer]);
  const output = new Float32Array(outputBuffer);
  const numAnchors = output.length / (BOX_CHANNELS + NUM_CLASSES);

  const detections: Detection[] = [];
  for (let c = 0; c < NUM_CLASSES; c++) {
    const rowOffset = (BOX_CHANNELS + c) * numAnchors;
    let max = 0;
    for (let a = 0; a < numAnchors; a++) {
      const score = output[rowOffset + a];
      if (score > max) max = score;
    }
    if (max >= CONFIDENCE_THRESHOLD) {
      detections.push({ label: INGREDIENT_LABELS[c], confidence: max });
    }
  }

  return detections.sort((a, b) => b.confidence - a.confidence);
}
