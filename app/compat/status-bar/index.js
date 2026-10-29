import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';

export const StatusBar = ({ style = 'auto', hidden = false, translucent = true, backgroundColor = 'transparent', ...props }) => {
  const barStyle = style === 'light' ? 'light-content' : style === 'dark' ? 'dark-content' : 'default';
  return (
    <RNStatusBar
      barStyle={barStyle}
      hidden={hidden}
      translucent={translucent}
      backgroundColor={backgroundColor}
      {...props}
    />
  );
};

export default StatusBar;

