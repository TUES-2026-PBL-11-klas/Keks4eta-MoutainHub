import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ImageBackground, 
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, Link } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* 1. VECTOR LINES BACKGROUND */}
            {/* Replace the required image here with your vector file e.g., require('../assets/images/vector-lines.png') */}
            <ImageBackground 
                source={{ uri: 'https://via.placeholder.com/800x1200/f5f7fa/e2e8f0?text=Background+Vector+Lines' }} 
                style={styles.vectorBackground}
                resizeMode="cover"
            >
                {/* 2. TOP NAVIGATION BAR */}
                <View style={styles.navBar}>
                    {/* Left: Logo Mark (the mountain shape) */}
                    <Image 
                        source={{ uri: 'https://via.placeholder.com/50x50/cccccc/000000?text=Logo' }} 
                        style={styles.logoMark} 
                        resizeMode="contain" 
                    />
                    
                    {/* Center: Text Logo ("Mountain Hub.") */}
                    <Image 
                        source={{ uri: 'https://via.placeholder.com/150x50/cccccc/000000?text=Mountain+Hub.' }} 
                        style={styles.logoText} 
                        resizeMode="contain" 
                    />

                    {/* Right: Search and Profile Icons */}
                    <View style={styles.navRightIcons}>
                        <TouchableOpacity>
                            <Ionicons name="search" size={24} color="black" />
                        </TouchableOpacity>
                        <View style={styles.profilePlaceholder} />
                    </View>
                </View>

                {/* 3. MAIN CONTENT AREA */}
                <View style={styles.mainContent}>
                    {/* 4. MOUNTAIN PICTURE BACKGROUND */}
                    {/* Replace the source below with your actual mountain background image */}
                    <ImageBackground
                        source={{ uri: 'https://via.placeholder.com/800x600/808080/ffffff?text=Mountain+Picture' }}
                        style={styles.mountainBackgroundContainer}
                        imageStyle={styles.mountainBackgroundImage}
                    >
                        {/* 5. WHITE LOGIN FORM CARD */}
                        <View style={styles.loginCard}>
                            <Text style={styles.welcomeText}>Welcome back!</Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.passwordInputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons 
                                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                            size={20} 
                                            color="#4f75a6" 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.optionsRow}>
                                <TouchableOpacity 
                                    style={styles.checkboxContainer} 
                                    onPress={() => setRememberMe(!rememberMe)}
                                >
                                    <Ionicons 
                                        name={rememberMe ? "checkmark-circle" : "ellipse-outline"} 
                                        size={20} 
                                        color={rememberMe ? "#4f75a6" : "#A0B5D7"} 
                                    />
                                    <Text style={styles.rememberMeText}>Remember me</Text>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.loginButton}>
                                <Text style={styles.loginButtonText}>Log In</Text>
                            </TouchableOpacity>

                            <View style={styles.signupRow}>
                                <Text style={styles.noAccountText}>Don't have an account? </Text>
                                {/* Update the href to link to your actual signup page if it exists */}
                                <Link href="/" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.signupText}>Sign up</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    vectorBackground: {
        flex: 1,
        width: '100%',
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60, // approximate status bar height spacing
        paddingBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // subtle transparent background for the nav bar
    },
    logoMark: {
        width: 45,
        height: 45,
    },
    logoText: {
        width: 140,
        height: 40,
    },
    navRightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    profilePlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000', // Black circle from the mockup
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    mountainBackgroundContainer: {
        width: '100%',
        maxWidth: 800, // To avoid looking overly stretched on web/tablets
        paddingTop: 80, // Space to show the mountain behind the top of the card
        paddingHorizontal: 20,
        paddingBottom: 0,
        alignItems: 'center',
    },
    mountainBackgroundImage: {
        borderRadius: 24,
    },
    loginCard: {
        width: '100%',
        maxWidth: 450,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 30,
        // The drop shadow for the card
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,

        // To make it slightly overlap the bottom of the mountain image:
        transform: [{ translateY: 40 }], 
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: '800',
        color: '#34558b', // darker blue from the design
        textAlign: 'center',
        marginBottom: 25,
    },
    inputContainer: {
        marginBottom: 15,
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#658bc6', // light blue from the design
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#eff4fa',
        borderWidth: 1.5,
        borderColor: '#a3bdf0',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff4fa',
        borderWidth: 1.5,
        borderColor: '#a3bdf0',
        borderRadius: 30,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 14,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
        paddingHorizontal: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rememberMeText: {
        fontSize: 14,
        color: '#658bc6',
        fontWeight: '500',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#658bc6',
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#4470ad',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#4470ad',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    noAccountText: {
        fontSize: 14,
        color: '#8faadd',
    },
    signupText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#34558b',
    },
});
