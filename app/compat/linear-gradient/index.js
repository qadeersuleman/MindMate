import React, { forwardRef } from 'react';
import RNLinearGradient from 'react-native-linear-gradient';

const normalizeCoord = (val, fallback) => {
  return typeof val === 'number' && !isNaN(val) ? val : fallback;
};

const normalizePoint = (point, fallback) => {
  if (Array.isArray(point) && point.length >= 2) {
    return {
      x: normalizeCoord(point[0], fallback.x),
      y: normalizeCoord(point[1], fallback.y),
    };
  }
  if (point && typeof point === 'object') {
    return {
      x: normalizeCoord(point.x, fallback.x),
      y: normalizeCoord(point.y, fallback.y),
    };
  }
  return fallback;
};

export const LinearGradient = forwardRef(({ start, end, colors, style, children, ...props }, ref) => {
  const safeStart = normalizePoint(start, { x: 0.5, y: 0.0 });
  const safeEnd = normalizePoint(end, { x: 0.5, y: 1.0 });
  const safeColors = Array.isArray(colors) && colors.length >= 2 ? colors : ['#5A8DEE', '#7B61FF'];

  return (
    <RNLinearGradient
      ref={ref}
      {...props}
      style={style}
      colors={safeColors}
      start={safeStart}
      end={safeEnd}
    >
      {children}
    </RNLinearGradient>
  );
});

export default LinearGradient;
