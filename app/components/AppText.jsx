import React from "react";
import { StyleSheet, View, Text } from "react-native";

export default function AppText({ text, style, size = 16, color="black" }) {
  return <Text style={[{ fontSize: size, color: color }, style]}>{text}</Text>;
}



const styles = StyleSheet.create({});
