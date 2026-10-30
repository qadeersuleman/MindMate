import React from "react";
import Constants from "expo-constants";
import { StyleSheet, SafeAreaView, Platform, StyleProp, ViewStyle } from "react-native";

export interface ScreenProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Screen: React.FC<ScreenProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
    flex: 1,
    backgroundColor: "white"
  },
});

export default Screen;
