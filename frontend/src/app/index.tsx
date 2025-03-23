import { Text, View } from "react-native";

//Import Login screen
// In your src/app/index.tsx file
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import {ScrollView} from 'react-native';

export default function Index() {
  return (
      <ScrollView>
      <Signup />
      </ScrollView>
  );
}


