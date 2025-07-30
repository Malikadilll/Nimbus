import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LogBox } from "react-native";

import HomeScreen from "../Screens/Home";

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export default function Stacki(){
    return(
         <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} />
        
        </Stack.Navigator>


    ) 
    



}