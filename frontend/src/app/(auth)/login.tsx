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

export default function Login() {
    const [hidePassword, setHidePassword] = useState(true);
    const router = useRouter();

    return (
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageTitle>Divvy</PageTitle>
                <SubTitle>Account Login</SubTitle>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={(values) => {
                        console.log(values);
                        router.push('/(app)/home');
                    }}
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

                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>Login</ButtonText>
                            </StyledButton>
                            <Line />
                            <ExtraView>
                                <ExtraText>Don't have an account? </ExtraText>
                                <TextLink onPress={() => router.push('/(auth)/signup')}>
                                    <TextLinkContent>Signup</TextLinkContent>
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