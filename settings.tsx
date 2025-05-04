import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../app/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(3); // Default radius

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("event_radius_miles");
      if (saved) setRadiusMiles(parseInt(saved));
    })();
  }, []);

  const handleRadiusChange = (delta: number) => {
    let newRadius = Math.min(5, Math.max(1, radiusMiles + delta));
    setRadiusMiles(newRadius);
    AsyncStorage.setItem("event_radius_miles", newRadius.toString());
  };

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

        <View style={styles.row}>
          <Text style={styles.rowText}>📍 Event Radius</Text>
          <View style={styles.radiusControls}>
            <Pressable
              style={styles.radiusButton}
              onPress={() => handleRadiusChange(-1)}
            >
              <Text style={styles.radiusText}>-</Text>
            </Pressable>
            <Text style={styles.radiusValue}>{radiusMiles} mi</Text>
            <Pressable
              style={styles.radiusButton}
              onPress={() => handleRadiusChange(1)}
            >
              <Text style={styles.radiusText}>+</Text>
            </Pressable>
          </View>
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
  radiusControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#4b4b8f",
    borderRadius: 5,
  },
  radiusText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  radiusValue: {
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 8,
  },
});
