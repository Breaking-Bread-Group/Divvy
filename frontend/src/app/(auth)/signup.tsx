import axios from 'axios'; // Install axios with `npm install axios`
import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
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
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageTitle>Divvy</PageTitle>
                <SubTitle>Account Signup</SubTitle>

                <Formik
                 initialValues={{ email: '', password: '', confirmPassword: '' }}
                 onSubmit={handleSignup}  // Use the external handleSignup function
                >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <StyledFormArea>
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

