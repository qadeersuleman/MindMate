import React from 'react';
import { View } from 'react-native';

export const BlurView = ({ intensity = 50, tint = 'default', style, children, ...props }) => {
  const bg = tint === 'dark' ? 'rgba(0,0,0,0.65)' : tint === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)';
  return (
    <View style={[{ backgroundColor: bg }, style]} {...props}>
      {children}
    </View>
  );
};

export default BlurView;

