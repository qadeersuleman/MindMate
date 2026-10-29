// components/Common/AnimatedTitle.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '../../assets/colors';

const Title = ({ children }) => {
  return (
    <Animated.Text
      style={[styles.title, { color: Colors.brand.primary }]}
      entering={FadeInUp.duration(1000).springify()}
    >
      {children}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 50,
  },
});

export default Title;
