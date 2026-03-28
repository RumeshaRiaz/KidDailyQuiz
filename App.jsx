import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultScreen from './src/screens/ResultScreen';
import RewardsScreen from './src/screens/RewardsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubscriptionProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          >
            <Stack.Screen name="Home"    component={HomeScreen} />
            <Stack.Screen name="Quiz"    component={QuizScreen} />
            <Stack.Screen name="Result"  component={ResultScreen} />
            <Stack.Screen name="Rewards" component={RewardsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SubscriptionProvider>
    </GestureHandlerRootView>
  );
}
