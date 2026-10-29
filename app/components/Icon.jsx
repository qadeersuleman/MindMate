import React from 'react'
import { StyleSheet, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function Icon({name, size = 40, bgColor = "none", iconColor = "#fff", style

}) {
  return (
    <View style={[styles.icon,style,{backgroundColor: bgColor}]}>
        <MaterialCommunityIcons name={name} size={size} color={iconColor} />
    </View>
  )
}

const styles = StyleSheet.create({
    icon : {
        width: 30,
        height: 30,
        borderRadius: 40 / 2,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
