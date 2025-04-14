import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../app/firebaseConfig"; // Ensure this matches your file location

export default function SettingsScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false); // local toggle simulation

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out", "See you soon!");
      router.replace("/login" as const);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* ACCOUNT SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Pressable
          style={styles.row}
          onPress={() => router.push("/profile" as const)}
        >
          <Text style={styles.rowText}>👤 View Profile</Text>
        </Pressable>

        {/* Add more account items here later */}
      </View>

      {/* PREFERENCES SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>🌓 Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={(val) => setDarkMode(val)}
            thumbColor={darkMode ? "#fff" : "#888"}
            trackColor={{ false: "#555", true: "#4b4b8f" }}
          />
        </View>
      </View>

      {/* SUPPORT SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <Pressable style={styles.row} onPress={() => Alert.alert("Coming soon!")}>
          <Text style={styles.rowText}>📖 Help & FAQ</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={() => Alert.alert("Coming soon!")}>
          <Text style={styles.rowText}>🔒 Privacy Policy</Text>
        </Pressable>
      </View>

      {/* LOG OUT */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1b3a",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 10,
  },
  row: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowText: {
    fontSize: 16,
    color: "#fff",
  },
  logoutButton: {
    paddingVertical: 12,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
  },
});
