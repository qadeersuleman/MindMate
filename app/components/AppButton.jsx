import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '../assets/colors';

const AppButton = ({ 
  text = "Continue", 
  onPress, 
  style = {},
  textStyle = {},
  activeOpacity = 0.8,
  enteringAnimation = FadeIn.delay(300)
}) => {
  const mergedButtonStyles = useMemo(() => [
    styles.button,
    styles.buttonActive,
    style
  ], [style]);

  const mergedTextStyles = useMemo(() => [
    styles.text,
    textStyle
  ], [textStyle]);

  return (
    <Animated.View entering={enteringAnimation}>
      <TouchableOpacity
        style={mergedButtonStyles}
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        <Text style={mergedTextStyles}>
          {text}
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
});

export default React.memo(AppButton);