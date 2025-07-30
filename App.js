import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View ,SafeAreaView} from 'react-native';
import Stacki from './Navigation/Stack';
import { NavigationContainer } from '@react-navigation/native';


export default function App() {
  return (
   

    <NavigationContainer>
      
      <Stacki/>
      
    </NavigationContainer>

    
  );
}

const styles = StyleSheet.create();
