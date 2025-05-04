import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router"; // Import useRouter for navigation

export default function Profile({ onSignIn, onSignOut }: { onSignIn: (userId: string) => void; onSignOut: () => void }) {
  const router = useRouter(); // Initialize router for navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [userId, setUserId] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);

        // Load user data, including points
        await loadUserData(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserId(null);

        // Clear local data only after saving to Firestore
        setTotalPoints(0);
      }
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, []);

  const handleCreateAccount = async () => {
    if (!email || !password) {
      return; // Do nothing if email or password is missing
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email.toLowerCase(),
        points: 0,
        friends: [],
      });

      onSignIn(user.uid);
    } catch (error: any) {
      console.error("Error creating account:", error.message); // Log the error instead of showing an alert
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      return; // Do nothing if email or password is missing
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        onSignIn(user.uid);
        loadUserData(user.uid); // Load user data when user signs in
      }
    } catch (error: any) {
      console.error("Error signing in:", error.message); // Log the error instead of showing an alert
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onSignOut();
    } catch (error: any) {
      console.error("Error signing out:", error.message); // Log the error instead of showing an alert
    }
  };

  const addPoints = async (pointsToAdd: number) => {
    if (!userId) return;

    try {
      const newTotalPoints = totalPoints + pointsToAdd;

      // Update points in Firestore
      await updateDoc(doc(db, "users", userId), {
        points: newTotalPoints,
      });

      // Update local state
      setTotalPoints(newTotalPoints);
    } catch (error) {
      console.error("Error updating points in Firestore:", error);
    }
  };

  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userPoints = userData.points || 0; // Default to 0 if points are not set
        setTotalPoints(userPoints); // Set points from Firestore
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>⬅️ Back</Text>
      </Pressable>

      <Text style={styles.title}>Account Management</Text>

      {/* Show inputs and buttons only if the user is not logged in */}
      {!isLoggedIn && (
        <>
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
          <Pressable style={styles.button} onPress={handleCreateAccount} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </Pressable>
          <Pressable style={[styles.button, styles.signInButton]} onPress={handleSignIn} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </Pressable>
        </>
      )}

      {/* Show the sign-out button only if the user is logged in */}
      {isLoggedIn && (
        <Pressable style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      )}
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4b4b8f",
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
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
    marginTop: 10,
  },
  signInButton: {
    backgroundColor: "#3498db",
  },
  signOutButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
