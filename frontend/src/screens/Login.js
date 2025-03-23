import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { Formik } from 'formik';
import { View } from 'react-native';

//Import icons
import { Octicons, Ionicons } from '@expo/vector-icons'

//Import colors
import { Colors } from '../components/styles'
import {
    StyledContainer,
    InnerContainer,
    PageLogo,
    PageTitle,
    SubTitle,
    StyledFormArea,
    LeftIcon,
    StyledInputLabel,
    StyledTextInput,
    RightIcon,
    StyledButton,
    ButtonText,
    MsgBox,
    Line,
    ExtraText,
    ExtraView,
    TextLink,
    TextLinkContent,

} from '../components/styles';
import { DarkTheme } from '@react-navigation/native';

//Colors we need
const { brand, darkLight } = Colors;

const Login = () => {
    const [hidePassword, setHidePassword] = useState(true);
    return (
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/images/flowers.png')} />
                <PageTitle>My Flowers</PageTitle>
                <SubTitle>Account Login</SubTitle>

                <Formik initialValues={{ email: '', password: '' }}
                    onSubmit={(values) => {
                        console.log(values);
                    }}>

                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <StyledFormArea>
                            <MyTextInput
                                label="Email Address"
                                icon="mail"
                                placeholder="myemailaddress@gmail.com"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('emailAddress')}
                                onBlur={handleBlur('emailAddress')}
                                value={values.emailAddress}
                                keyboardType="email-address" />

                            <MyTextInput
                                label="Password"
                                icon="lock"
                                placeholder="* * * * * * "
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                                keyboardType="email-address"
                                secureTextEntry={hidePassword}
                                isPassword={true}
                                hidePassword={hidePassword}
                                setHidePassword={setHidePassword} />

                            <MsgBox>...</MsgBox>
                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>
                                    Login
                                </ButtonText>
                            </StyledButton>

                            <Line />
                            <ExtraView>
                                
                                <ExtraText>Don't have an account already?</ExtraText>
                                <TextLink>
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

const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
    return (
        <View>
            <LeftIcon>
                <Octicons name={icon} size={30} color={brand} />
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props} />
            {isPassword && (<RightIcon onPress={() => setHidePassword(!hidePassword)}>
                            <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darkLight} />
                        </RightIcon>)}
                    </View>
                )
            }

export default Login;