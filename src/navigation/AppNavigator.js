import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/theme';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ScheduleScreen from '../screens/Schedule/ScheduleScreen';
import TodoScreen from '../screens/Todo/TodoScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E3A8A', // 남색 계열 컬러로 변경
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: '가족 스케줄러' }}
        />
        <Stack.Screen 
          name="Schedule" 
          component={ScheduleScreen} 
          options={{ title: '일정 관리', presentation: 'modal' }}
        />
        <Stack.Screen 
          name="Todo" 
          component={TodoScreen} 
          options={{ title: '할 일 목록' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
