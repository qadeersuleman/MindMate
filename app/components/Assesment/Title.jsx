// components/Common/AnimatedTitle.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const Title = ({ children, style, subtitle }) => {
  return (
    <Animated.View
      style={styles.container}
      entering={FadeInDown.duration(600).springify()}
    >
      <Animated.Text style={[styles.title, style]}>
        {children}
      </Animated.Text>
      {subtitle ? (
        <Animated.Text style={styles.subtitle}>
          {subtitle}
        </Animated.Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
    fontFamily: 'Poppins-Bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default Title;
