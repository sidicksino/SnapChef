import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

type AuthTextFieldProps = TextInputProps & {
  label: string;
};

export const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(
  ({ label, ...inputProps }, ref) => {
    return (
      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-400">{label}</Text>
        <TextInput
          ref={ref}
          placeholderTextColor="#6B7280"
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white"
          {...inputProps}
        />
      </View>
    );
  }
);

AuthTextField.displayName = 'AuthTextField';
