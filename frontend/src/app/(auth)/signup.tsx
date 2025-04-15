import axios from 'axios'; // Install axios with `npm install axios`
import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { Octicons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../components/styles';
import {
    StyledContainer,
    InnerContainer,
    PageTitle,
    SubTitle,
    StyledFormArea,
    LeftIcon,
    StyledInputLabel,
    StyledTextInput,
    RightIcon,
    StyledButton,
    ButtonText,
    Line,
    ExtraText,
    ExtraView,
    TextLink,
    TextLinkContent,
} from '../../components/styles';

const { brand, darkLight } = Colors;

export default function Signup() {
    const [hidePassword, setHidePassword] = useState(true);
    const router = useRouter();
    const handleSignup = async (values) => {
        try {
            const response = await axios.post('http://localhost:3000/signup', {
                email: values.email,
                password: values.password,
                first_name: "John",
                last_name: "Doe",
                phone: "(555) 123-4567",
            });
    
            alert(response.data.message);
            router.push('/(app)/home');  // Redirect to the home page
        } catch (error) {
            alert('Signup failed: ' + (error.response?.data?.message || error.message));
        }
    };



    
    return (
        <ScrollView>
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageTitle>Divvy</PageTitle>
                <SubTitle>Account Signup</SubTitle>

                <Formik
                 initialValues={{first_name: '', last_name: '', email: '', phone: '', password: '', confirmPassword: '' }}
                 onSubmit={handleSignup}  // Use the external handleSignup function
                >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <StyledFormArea>
                      

                            <TextInput
                                label="First Name"
                                placeholder="First Name"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('first_name')}
                                onBlur={handleBlur('first_name')}
                                value={values.first_name}
                                
                            />

                            <TextInput
                                label="Last Name"
                                placeholder="Last Name"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('last_name')}
                                onBlur={handleBlur('last_name')}
                                value={values.last_name}
                                
                            />

                            <TextInput
                                label="Email Address"
                                placeholder="andy@gmail.com"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                keyboardType="email-address"
                            />

                            <TextInput      
                                label="Phone"
                                placeholder="Phone"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('phone')}
                                onBlur={handleBlur('phone')}
                                value={values.phone}
                                keyboardType = "phone-pad"
                            />

                            
                            

                           

                            <TextInput
                                label="Password"
                                placeholder="* * * * * * * *"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                                secureTextEntry={hidePassword}
                                isPassword={true}
                                hidePassword={hidePassword}
                                setHidePassword={setHidePassword}
                            />

                            <TextInput
                                label="Confirm Password"
                                placeholder="* * * * * * * *"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                value={values.confirmPassword}
                                secureTextEntry={hidePassword}
                                isPassword={true}
                                hidePassword={hidePassword}
                                setHidePassword={setHidePassword}
                            />

                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>Signup</ButtonText>
                            </StyledButton>
                            <Line />
                            <ExtraView>
                                <ExtraText>Already have an account? </ExtraText>
                                <TextLink onPress={() => router.push('/(auth)/login')}>
                                    <TextLinkContent>Login</TextLinkContent>
                                </TextLink>
                            </ExtraView>
                        </StyledFormArea>
                    )}
                </Formik>
            </InnerContainer>
        </StyledContainer>
        </ScrollView>
    );
}

const TextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
    return (
        <View>
            <LeftIcon>
                <Octicons name={icon} size={30} color={brand} />
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props} />
            {isPassword && (
                <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darkLight} />
                </RightIcon>
            )}
        </View>
    );
}; 

