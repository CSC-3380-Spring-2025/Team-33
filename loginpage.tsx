import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState(null); // State to store user data

    const router = useRouter();

    // Load user data from user.json
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = require("../assets/user.json"); // Adjust the path to your user.json
                setUserData(data);
            } catch (error) {
                console.error("Error loading user data:", error);
                Alert.alert("Error", "Failed to load user data.");
            }
        };

        loadUserData();
    }, []);

    const handleLogin = () => {
        if (!username || !password) {
            Alert.alert("Error", "Please enter both username and password.");
            return;
        }

        if (userData) {
            const { username: storedUsername, password: storedPassword } = userData;

            if (username === storedUsername && password === storedPassword) {
                Alert.alert("Success", "Login successful!");
                setIsLoading(true);

                // Simulate a login process
                setTimeout(() => {
                    setIsLoading(false);
                    router.push("/"); // Navigate to the main app tabs
                }, 2000);
            } else {
                Alert.alert("Error", "Invalid username or password.");
            }
        } else {
            Alert.alert("Error", "User data not loaded.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Ionicons name="calendar-outline" size={160} color="black" />
                <Text style={styles.title}>Welcome to Waypoint</Text>
            </View>
            <View style={styles.formInputWrapper}>
                <Ionicons name="person-outline" size={24} color="black" />
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={"#000"}
                    value={username}
                    onChangeText={setUsername}
                />
            </View>
            <View style={styles.formInputWrapper}>
                <Ionicons name="lock-closed-outline" size={24} color="black" />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={"#000"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                />
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="black" />
                </Pressable>
            </View>
            <Pressable
                style={{ ...styles.loginButton, backgroundColor: "#000" }}
                onPress={handleLogin}
            >
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    formInputWrapper: {
        width: "90%",
        height: 55,
        backgroundColor: "#f7f9ef",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 8,
        marginBottom: 16,
    },
    input: {
        width: "80%",
        height: "100%",
        marginLeft: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    logo: {
        marginBottom: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    loginButton: {
        width: "75%",
        height: 55,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
