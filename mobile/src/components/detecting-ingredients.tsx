import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

const RING_SIZE = 180;
const STROKE_WIDTH = 14;

// Full-screen "processing" state shown while on-device detection runs.
// There's no real granular progress from a single synchronous TFLite
// runSync() call, so this animates toward a soft cap (never claiming
// "done" on its own) — the caller unmounts this screen the moment
// detection actually resolves, whatever the displayed percentage is.
export function DetectingIngredients() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const SOFT_CAP = 92;
    const DURATION_MS = 2200;
    const interval = setInterval(() => {
      const t = Math.min((Date.now() - start) / DURATION_MS, 1);
      const eased = 1 - (1 - t) ** 2; // ease-out, so it slows as it approaches the cap
      setProgress(Math.round(eased * SOFT_CAP));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // A full circular path, starting at 12 o'clock — the declarative <Path>
  // below trims it to [0, progress/100] via its own start/end props rather
  // than this component recomputing arc angles on every tick.
  const ringPath = useMemo(() => {
    const inset = STROKE_WIDTH / 2;
    return Skia.PathBuilder.Make()
      .addArc(Skia.XYWHRect(inset, inset, RING_SIZE - STROKE_WIDTH, RING_SIZE - STROKE_WIDTH), -90, 360)
      .detach();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-bg-primary px-8">
      <View style={{ width: RING_SIZE, height: RING_SIZE }}>
        <Canvas style={{ width: RING_SIZE, height: RING_SIZE }}>
          <Path
            path={ringPath}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            strokeCap="round"
            color="rgba(255,255,255,0.1)"
          />
          <Path
            path={ringPath}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            strokeCap="round"
            color="#22C55E"
            start={0}
            end={progress / 100}
          />
        </Canvas>
        <View className="absolute inset-0 items-center justify-center">
          <Text className="font-poppins-bold text-3xl text-white">{progress}%</Text>
        </View>
      </View>
      <Text className="mt-8 font-poppins-semibold text-xl text-white">Detecting ingredients…</Text>
      <Text className="mt-1 font-poppins-regular text-sm text-gray-400">
        This may take a few seconds
      </Text>
    </View>
  );
}
