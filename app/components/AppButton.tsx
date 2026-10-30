import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '../assets/colors';

export interface AppButtonProps {
  text?: string;
  title?: string;
  gradient?: any;
  icon?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
  enteringAnimation?: any;
}

const AppButton: React.FC<AppButtonProps> = ({ 
  text = "Continue", 
  title,
  disabled = false,
  onPress, 
  style = {},
  textStyle = {},
  activeOpacity = 0.8,
  enteringAnimation = FadeIn.delay(300)
}) => {
  const displayText = title || text;
  const mergedButtonStyles = useMemo(() => [
    styles.button,
    styles.buttonActive,
    disabled ? styles.buttonDisabled : null,
    style
  ], [style, disabled]);

  const mergedTextStyles = useMemo(() => [
    styles.text,
    textStyle
  ], [textStyle]);

  return (
    <Animated.View entering={enteringAnimation}>
      <TouchableOpacity
        style={mergedButtonStyles}
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : activeOpacity}
        disabled={disabled}
      >
        <Text style={mergedTextStyles}>
          {displayText}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 18,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.brand.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
    color: Colors.text.inverted,
  },
  buttonActive: {
    backgroundColor: Colors.brand.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.text.disabled,
    opacity: 0.6,
  },
});

export default React.memo(AppButton);
