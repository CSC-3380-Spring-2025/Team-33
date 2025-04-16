import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateAccount = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        points: 0, // Initialize points to 0
      });

      Alert.alert("Success", "Account created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1b1b3a",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#2c2c54",
    borderRadius: 8,
    color: "#fff",
  },
  button: {
    backgroundColor: "#6c5ce7",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
