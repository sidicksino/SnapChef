import { Modal, Text, View } from 'react-native';

import { Button } from '@/components/button';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  loading?: boolean;
};

// A real in-app confirmation for hard-to-reverse actions (deleting a
// recipe, eventually anything else destructive) — not the native `Alert`,
// which this app deliberately avoids everywhere else (see the toast/
// FormError work earlier in this project) for the same reason: `Alert` is a
// complete no-op on web, and a dark modal card matches the rest of the
// app's visual language instead of looking like a bare system dialog.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        <View className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface-card p-6">
          <Text className="mb-2 font-poppins-bold text-lg text-white">{title}</Text>
          <Text className="mb-6 font-poppins-regular text-sm text-gray-300">{message}</Text>
          <Button
            title={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
          />
          <Button title="Cancel" variant="text" onPress={onCancel} className="mt-1 self-center" disabled={loading} />
        </View>
      </View>
    </Modal>
  );
}
