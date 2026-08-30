import { Pressable, Text } from 'react-native';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

// Matches the "CHIPS / TAGS" component in the design system: filled green
// when selected, subtle outline otherwise.
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={
        selected
          ? 'rounded-full bg-brand-green px-4 py-2 active:opacity-80'
          : 'rounded-full border border-white/15 bg-surface-card px-4 py-2 active:opacity-70'
      }>
      <Text
        className={`font-poppins-medium text-sm ${selected ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
