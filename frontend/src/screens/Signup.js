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

const Signup = () => {
    const [hidePassword, setHidePassword] = useState(true);
    return (
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>

                <PageTitle>Signup</PageTitle>


                <Formik initialValues={{ fullName: '', email: '', dateOfBirth: '', password: '', confirmPassword: '' }}
                    onSubmit={(values) => {
                        console.log(values);
                    }}>

                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <StyledFormArea>

                            <MyTextInput
                                label="First Name"
                                icon="person"
                                placeholder="First Name"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('firstName')}
                                onBlur={handleBlur('firstName')}
                                value={values.firstName}
                            />
                            <MyTextInput
                                label="Last Name"
                                icon="person"
                                placeholder="Last Name"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('lastName')}
                                onBlur={handleBlur('lastName')}
                                value={values.lastName}
                            />

                            <MyTextInput
                                label="Username"
                                icon="person"
                                placeholder="Username"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('userName')}
                                onBlur={handleBlur('userName')}
                                value={values.userName}
                                keyboardType="email-address" />

                            <MyTextInput
                                label="Email Address"
                                icon="mail"
                                placeholder="Email Address"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('emailAddress')}
                                onBlur={handleBlur('emailAddress')}
                                value={values.emailAddress}
                                keyboardType="email-address" />

                            <MyTextInput
                                label="Phone Number"
                                icon="telephone"
                                placeholder="Phone Number"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('phoneNumber')}
                                onBlur={handleBlur('phoneNumber')}
                                value={values.phoneNumber}
                                keyboardType="phone-pad" />



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

                            <MyTextInput
                                label="Confirm Password"
                                icon="lock"
                                placeholder="* * * * * * "
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                value={values.confirmPassword}
                                keyboardType="email-address"
                                secureTextEntry={hidePassword}
                                isPassword={true}
                                hidePassword={hidePassword}
                                setHidePassword={setHidePassword} />

                            <MsgBox>...</MsgBox>
                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>
                                    Signup
                                </ButtonText>
                            </StyledButton>

                            <Line />
                            <ExtraView>

                                
                                <ExtraText>Already have an account?</ExtraText>
                                <TextLink>
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

export default Signup;