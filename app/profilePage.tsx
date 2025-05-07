import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore"; // Import Firestore functions
import { auth, db } from "./firebaseConfig"; // Import Firebase configuration
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions

export default function ProfileScreen() {
  const router = useRouter();
  const storage = getStorage(); // Initialize Firebase Storage

  // Editable profile state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const [loading, setLoading] = useState(false);      // For save loading spinner
  const [editing, setEditing] = useState(false);      // Toggle between view/edit mode

  // Keep original profile to allow cancel
  const [originalProfile, setOriginalProfile] = useState({
    name: "",
    username: "",
    bio: "",
    avatar: "",
  });

  // Load saved profile info when screen mounts
  useEffect(() => {
    const loadProfile = async () => {
      const savedName = await AsyncStorage.getItem("name");
      const savedUsername = await AsyncStorage.getItem("username");
      const savedBio = await AsyncStorage.getItem("bio");
      const savedAvatar = await AsyncStorage.getItem("avatar");

      const initialProfile = {
        name: savedName || "",
        username: savedUsername || "",
        bio: savedBio || "",
        avatar: savedAvatar || "",
      };

      setOriginalProfile(initialProfile);
      setName(initialProfile.name);
      setUsername(initialProfile.username);
      setBio(initialProfile.bio);
      setAvatar(initialProfile.avatar);
    };

    loadProfile();
  }, []);

  // Save current input to AsyncStorage
  const saveProfile = async () => {
    await AsyncStorage.setItem("name", name);
    await AsyncStorage.setItem("username", username);
    await AsyncStorage.setItem("bio", bio);
    await AsyncStorage.setItem("avatar", avatar);
  };

  // Show toast message when profile is saved
  const showToast = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show("✅ Profile saved!", ToastAndroid.SHORT);
    } else {
      Alert.alert("✅ Profile saved!");
    }
  };

  // Handle image selection from gallery and upload to Firebase Storage
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      const imageUri = result.assets[0].uri;

      try {
        // Upload image to Firebase Storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `avatars/${auth.currentUser?.uid}`);
        await uploadBytes(storageRef, blob);

        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(storageRef);
        setAvatar(downloadURL); // Update avatar state with the download URL
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Error", "Failed to upload image. Please try again.");
      }
    }
  };

  // Save profile and update original profile snapshot
  const handleSave = async () => {
    setLoading(true);

    try {
      // Check if the user is logged in
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User is not logged in.");
      }

      // Save profile data to Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        username,
        bio,
        avatar, // Save the avatar URL to Firestore
      });

      // Show success message
      showToast();

      // Update the original profile snapshot
      setOriginalProfile({ username, bio, avatar });
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Revert edits and exit edit mode
  const handleCancel = () => {
    setName(originalProfile.name);
    setUsername(originalProfile.username);
    setBio(originalProfile.bio);
    setAvatar(originalProfile.avatar);
    setEditing(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {/* Profile picture */}
      <Pressable onPress={editing ? pickImage : undefined}>
        <Image
          source={{ uri: avatar || "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        {editing && (
          <Text style={styles.editAvatar}>Tap to change photo</Text>
        )}
      </Pressable>

      {/* Display editable fields when in edit mode */}
      {editing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Enter your bio"
            placeholderTextColor="#aaa"
            value={bio}
            onChangeText={setBio}
            multiline
          />
          <Pressable
            style={[styles.saveButton, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>💾 Save</Text>
            )}
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* Display non-editable fields when not in edit mode */}
          <Text style={styles.username}>
            {username ? `@${username}` : "No username set"}
          </Text>
          <Text style={styles.bio}>{bio || "No bio yet"}</Text>
          <Pressable
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editText}>✏️ Edit Profile</Text>
          </Pressable>
        </>
      )}

      {/* Link to settings page */}
      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push("/settings" as const)}
      >
        <Text style={styles.settingsText}>⚙️ Settings</Text>
      </Pressable>

      {/* Link to profile.tsx */}
      <Pressable
        style={styles.profileButton}
        onPress={() => router.push("/profile")} // Navigate to profile.tsx
      >
        <Text style={styles.profileButtonText}>🔧 Account Management</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

// StyleSheet for profile layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1b3a",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#fff",
  },
  editAvatar: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 20,
    textAlign: "center",
  },
  name: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#ddd",
    textAlign: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#2c2c54",
    color: "#fff",
    fontSize: 16,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#4b4b8f",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: "#ccc",
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#2c2c54",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  editText: {
    color: "#fff",
    fontSize: 16,
  },
  settingsButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  settingsText: {
    color: "#ccc",
    fontSize: 16,
  },
  profileButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4b4b8f",
    borderRadius: 10,
    marginTop: 10,
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
