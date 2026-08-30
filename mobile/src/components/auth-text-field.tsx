import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

type AuthTextFieldProps = TextInputProps & {
  label: string;
};

export const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(
  ({ label, ...inputProps }, ref) => {
    return (
      <View className="gap-2">
        <Text className="font-poppins-medium text-sm text-gray-400">{label}</Text>
        <TextInput
          ref={ref}
          placeholderTextColor="#6B7280"
          className="rounded-2xl border border-white/10 bg-surface-card px-5 py-4 font-poppins-regular text-base text-white"
          {...inputProps}
        />
      </View>
    );
  }
);

AuthTextField.displayName = 'AuthTextField';
