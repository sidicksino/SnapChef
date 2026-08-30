import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'text';

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

const containerByVariant: Record<ButtonVariant, string> = {
  primary:
    'flex-row items-center justify-center rounded-full bg-brand-green py-4 active:opacity-80 disabled:opacity-40',
  outline:
    'flex-row items-center justify-center rounded-full border border-brand-green bg-transparent py-4 active:opacity-70 disabled:opacity-40',
  secondary:
    'flex-row items-center justify-center rounded-full bg-surface-elevated py-4 active:opacity-70 disabled:opacity-40',
  text: 'flex-row items-center justify-center gap-1 py-2 active:opacity-60 disabled:opacity-40',
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: 'font-poppins-semibold text-lg text-white',
  outline: 'font-poppins-semibold text-lg text-brand-green',
  secondary: 'font-poppins-semibold text-lg text-white',
  text: 'font-poppins-medium text-base text-gray-300',
};

// Primary/Outline/Secondary/Text button variants from the SnapChef design
// system (mobile/assets/images/design-system.png "COMPONENTS" section).
export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`${containerByVariant[variant]}${className ? ` ${className}` : ''}`}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? '#ffffff' : '#22C55E'}
        />
      ) : (
        <Text className={labelByVariant[variant]}>{title}</Text>
      )}
      {variant === 'text' && !loading && (
        <SymbolView
          tintColor="#D1D5DB"
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={14}
        />
      )}
    </Pressable>
  );
}
