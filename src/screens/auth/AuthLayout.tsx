import React, { type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AuthLayout({
  title,
  description,
  onBack,
  children,
  footer,
  compact = false,
}: {
  title: string;
  description?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.2);
  const bottomSpacing = footer ? 0 : insets.bottom + 24 * scale;
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollViewport}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomSpacing },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              height: compact
                ? Math.max(110 * scale, insets.top + 86 * scale)
                : Math.max(218 * scale, insets.top + 165 * scale),
              borderBottomLeftRadius: 30 * scale,
              borderBottomRightRadius: 30 * scale,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              {
                width: 348 * scale,
                height: 348 * scale,
                borderRadius: 174 * scale,
                borderWidth: 40 * scale,
                left: -174 * scale,
                top: -211 * scale,
              },
            ]}
          />
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBack}
              style={({ pressed }) => [
                styles.back,
                {
                  top: compact
                    ? insets.top + 22 * scale
                    : Math.max(insets.top + 12 * scale, 46 * scale),
                  left: 16 * scale,
                  width: 35 * scale,
                  height: 35 * scale,
                  borderRadius: 10 * scale,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.chevron} />
            </Pressable>
          )}
          <Text
            accessibilityRole="header"
            pointerEvents="none"
            style={[
              styles.heading,
              {
                fontSize: (compact ? 20 : 30) * scale,
                lineHeight: (compact ? 28 : 42) * scale,
                bottom: (compact ? 28 : 58) * scale,
                left: (compact ? 64 : 0) * scale,
                right: (compact ? 64 : 0) * scale,
              },
            ]}
          >
            {title}
          </Text>
        </View>
        <View style={[styles.content, { paddingHorizontal: 27 * scale }]}>
          {description && (
            <Text
              style={[
                styles.description,
                {
                  fontSize: 16 * scale,
                  lineHeight: 24 * scale,
                  marginTop: (title === 'OTP' ? 60 : 40) * scale,
                  paddingHorizontal: 12 * scale,
                },
              ]}
            >
              {description}
            </Text>
          )}
          <View
            style={{
              marginTop:
                (description ? (title === 'OTP' ? 47 : 43) : 30) * scale,
            }}
          >
            {children}
          </View>
        </View>
        {footer && (
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + 18 * scale },
            ]}
          >
            {footer}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthField({
  label,
  error,
  otp = false,
  inputRef,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  otp?: boolean;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
}) {
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.2);
  return (
    <View>
      <Text
        style={[styles.label, { fontSize: 14 * scale, lineHeight: 20 * scale }]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputShell,
          { minHeight: 48 * scale, borderRadius: 28 * scale },
          error ? styles.invalid : undefined,
        ]}
      >
        <TextInput
          ref={inputRef}
          {...props}
          placeholder={otp ? undefined : props.placeholder}
          accessibilityLabel={label === 'OTP' ? '6-digit OTP' : label}
          placeholderTextColor="#8B8B8B"
          selectionColor={otp ? 'transparent' : '#408BF0'}
          caretHidden={otp ? true : props.caretHidden}
          selection={
            otp
              ? {
                  start: props.value?.length ?? 0,
                  end: props.value?.length ?? 0,
                }
              : props.selection
          }
          underlineColorAndroid="transparent"
          autoCorrect={false}
          style={[
            styles.input,
            {
              fontSize: (otp ? 20 : 14) * scale,
              minHeight: 48 * scale,
              paddingHorizontal: 25 * scale,
            },
            otp && styles.otpNativeInput,
          ]}
        />
        {otp && (
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.otpSlots,
              { gap: 9 * scale, borderRadius: 28 * scale },
            ]}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <View
                key={index}
                testID={`otp-slot-${index}`}
                style={[
                  styles.otpSlot,
                  { width: 21 * scale, height: 28 * scale },
                ]}
              >
                {props.value?.[index] ? (
                  <Text
                    accessible={false}
                    style={[
                      styles.otpDigit,
                      { fontSize: 20 * scale, lineHeight: 28 * scale },
                    ]}
                  >
                    {props.value[index]}
                  </Text>
                ) : (
                  <View
                    testID={`otp-line-${index}`}
                    style={[
                      styles.otpLine,
                      index === (props.value?.length ?? 0) &&
                        styles.otpActiveLine,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
      {error && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function AuthSelect({
  label,
  value,
  placeholder,
  disabled = false,
  error,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.2);
  return (
    <View>
      <Text
        style={[styles.label, { fontSize: 14 * scale, lineHeight: 20 * scale }]}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value || placeholder }}
        accessibilityState={{ disabled }}
        accessibilityHint={
          disabled ? 'Select a state first' : `Choose ${label.toLowerCase()}`
        }
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.inputShell,
          styles.select,
          {
            minHeight: 48 * scale,
            borderRadius: 28 * scale,
            paddingHorizontal: 25 * scale,
          },
          error && styles.invalid,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.selectValue, { fontSize: 14 * scale }]}>
          {value || placeholder}
        </Text>
        <View style={styles.selectArrow} />
      </Pressable>
      {error && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function AuthButton({
  label,
  onPress,
  registration = false,
  verification = false,
  spacing,
}: {
  label: string;
  onPress: () => void;
  registration?: boolean;
  verification?: boolean;
  spacing?: number;
}) {
  const { width, fontScale } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.2);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        verification && styles.verifyButton,
        {
          minHeight: 50 * scale * Math.max(1, fontScale / 1.4),
          borderRadius: 30 * scale,
          marginTop: (spacing ?? (registration ? 40 : 32)) * scale,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonLabel, { fontSize: 16 * scale }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function AuthLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Text
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.link}
    >
      {label}
    </Text>
  );
}

export const authTextStyles = StyleSheet.create({
  footer: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 24,
    color: '#080808',
    textAlign: 'center',
  },
  changeNumber: {
    alignItems: 'center',
    marginTop: 32,
    minHeight: 44,
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FEFDFD' },
  scrollViewport: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    overflow: 'hidden',
    backgroundColor: '#4E9BD7',
    backgroundImage: 'linear-gradient(180deg, #5086D3 0%, #4CD6D6 100%)',
  },
  ring: { position: 'absolute', borderColor: 'rgba(255, 255, 255, 0.12)' },
  heading: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    includeFontPadding: false,
  },
  back: {
    zIndex: 1,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  chevron: {
    width: 11,
    height: 11,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  content: { width: '100%' },
  description: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    color: '#080808',
    includeFontPadding: false,
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    color: '#383838',
    includeFontPadding: false,
    marginBottom: 4,
  },
  inputShell: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.06)',
  },
  invalid: { borderColor: '#C54444' },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    fontFamily: 'Poppins-Medium',
    color: '#080808',
    flexShrink: 1,
    paddingVertical: 10,
  },
  selectArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#080808',
    marginLeft: 12,
  },
  disabled: { opacity: 0.55 },
  input: {
    fontFamily: 'Poppins-Medium',
    color: '#242424',
    paddingVertical: 10,
    includeFontPadding: false,
  },
  otpNativeInput: {
    color: 'transparent',
    textAlign: 'left',
  },
  otpSlots: {
    position: 'absolute',
    top: 1,
    bottom: 1,
    left: 1,
    right: 1,
    // Cover native IME composing spans as well as the hidden input's own text.
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpSlot: { alignItems: 'center', justifyContent: 'center' },
  otpDigit: {
    fontFamily: 'Poppins-Medium',
    color: '#242424',
    textAlign: 'center',
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  otpLine: { width: '100%', height: 1, backgroundColor: '#B8B8B8' },
  otpActiveLine: { height: 2, backgroundColor: '#408BF0' },
  error: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#B73535',
    marginTop: 8,
    marginHorizontal: 12,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#408BF0',
    backgroundImage: 'linear-gradient(90deg, #4285EC 0%, #14DEDF 100%)',
  },
  verifyButton: {
    backgroundImage: 'linear-gradient(90deg, #5387D6 0%, #4DD5D5 100%)',
  },
  buttonLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  footer: { marginTop: 'auto', paddingTop: 48, paddingHorizontal: 20 },
  link: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 24,
    textDecorationLine: 'underline',
    color: '#0066D9',
  },
  pressed: { opacity: 0.75 },
});
