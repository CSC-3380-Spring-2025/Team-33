import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebaseConfig"; // Firebase instance

// Main settings screen
export default function SettingsScreen() {
  const router = useRouter();

  // Simulated dark mode toggle (doesn't change actual theme yet)
  const [darkMode, setDarkMode] = useState(false);

  // Controls visibility of user's profile (true = private, false = public)
  const [isPrivate, setIsPrivate] = useState(false);

  // Load privacy preference from local storage when screen mounts
  useEffect(() => {
    const loadPrivacy = async () => {
      const stored = await AsyncStorage.getItem("privateProfile");
      if (stored) setIsPrivate(stored === "true");
    };
    loadPrivacy();
  }, []);

  // Update local state and persist setting
  const togglePrivacy = async (value: boolean) => {
    setIsPrivate(value);
    await AsyncStorage.setItem("privateProfile", value.toString());
  };

  // Sign user out of Firebase and redirect to login screen
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out", "See you soon!");
      router.replace("/login" as const);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Load additional settings from the original settings file
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const storedNotifications = await AsyncStorage.getItem("notificationsEnabled");
      const storedLocation = await AsyncStorage.getItem("locationEnabled");
      if (storedNotifications) setNotificationsEnabled(storedNotifications === "true");
      if (storedLocation) setLocationEnabled(storedLocation === "true");
    };
    loadSettings();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem("notificationsEnabled", value.toString());
  };

  const toggleLocation = async (value: boolean) => {
    setLocationEnabled(value);
    await AsyncStorage.setItem("locationEnabled", value.toString());
  };

  return (
    <View style={styles.container}>
      {/* Scrollable content so sections don’t get clipped on smaller screens */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Settings</Text>

        {/* ACCOUNT SECTION  */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* View Profile */}
          <Pressable style={styles.row} onPress={() => router.push("/profile")}>
            <Text style={styles.rowText}>View Profile</Text>
          </Pressable>

          {/* Navigate to Edit Profile screen */}
          <Pressable style={styles.row} onPress={() => router.push("/profile")}>
            <Text style={styles.rowText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* PRIVACY SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          {/* Toggle for making the profile private or public */}
          <View style={styles.row}>
            <Text style={styles.rowText}>Private Profile</Text>
            <Switch
              value={isPrivate}
              onValueChange={togglePrivacy}
              thumbColor={isPrivate ? "#fff" : "#888"}
              trackColor={{ false: "#555", true: "#4b4b8f" }}
            />
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Dark mode switch — purely visual for now */}
          <View style={styles.row}>
            <Text style={styles.rowText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={(val) => setDarkMode(val)}
              thumbColor={darkMode ? "#fff" : "#888"}
              trackColor={{ false: "#555", true: "#4b4b8f" }}
            />
          </View>

          {/* Notifications toggle */}
          <View style={styles.row}>
            <Text style={styles.rowText}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              thumbColor={notificationsEnabled ? "#fff" : "#888"}
              trackColor={{ false: "#555", true: "#4b4b8f" }}
            />
          </View>

          {/* Location toggle */}
          <View style={styles.row}>
            <Text style={styles.rowText}>Enable Location</Text>
            <Switch
              value={locationEnabled}
              onValueChange={toggleLocation}
              thumbColor={locationEnabled ? "#fff" : "#888"}
              trackColor={{ false: "#555", true: "#4b4b8f" }}
            />
          </View>
        </View>

        {/* SUPPORT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          {/* Placeholder support/help screen */}
          <Pressable style={styles.row} onPress={() => Alert.alert("Coming soon!")}>
            <Text style={styles.rowText}>Help & FAQ</Text>
          </Pressable>

          {/* Placeholder privacy policy link */}
          <Pressable style={styles.row} onPress={() => Alert.alert("Coming soon!")}>
            <Text style={styles.rowText}>Privacy Policy</Text>
          </Pressable>
        </View>

        {/* LOG OUT BUTTON */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// All styling for layout, colors, spacing, etc.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1b3a", // dark purple background
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingRight: 10, // space from scrollbar
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
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 4, // spacing away from edge + scrollbar
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowText: {
    fontSize: 16,
    color: "#fff",
  },
  logoutButton: {
    paddingVertical: 14,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
