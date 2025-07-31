// screens/SplashScreen.js
import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function SplashScreen() {
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  useEffect(() => {
    const timeout = setTimeout(() => navigation.replace('Groups'), 1000)
    return () => clearTimeout(timeout)
  }, [navigation])

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Social_SplashScreen_Asset-02-02.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    backgroundColor: '#FFFFFF',  // o usa theme.colors.background
    justifyContent: 'center',
    alignItems:     'center',
  },
})
