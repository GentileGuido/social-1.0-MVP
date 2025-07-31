// App.js
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
// Usamos el stack JS puro en vez de native-stack
import { createStackNavigator } from '@react-navigation/stack'

import { GroupsProvider } from './contexts/GroupsContext'
import { NamesProvider }  from './contexts/NamesContext'

import SplashScreen from './screens/SplashScreen'
import GroupsScreen from './screens/GroupsScreen'
import NamesScreen  from './screens/NamesScreen'

const Stack = createStackNavigator()

export default function App() {
  return (
    <GroupsProvider>
      <NamesProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Groups" component={GroupsScreen} />
            <Stack.Screen name="Names"  component={NamesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </NamesProvider>
    </GroupsProvider>
  )
}
