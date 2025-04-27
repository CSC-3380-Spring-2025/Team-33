import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, FlatList, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

type Friend = {
  id: string;
  email: string;
};

export default function Friends() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]); // List of friends with their IDs and emails
  const [userId, setUserId] = useState<string | null>(null); // Current user's ID

  // Load the current user's friends list from Firestore 
  const loadFriends = () => {
    if (!userId) return;

    const userDocRef = doc(db, "users", userId);

    // Set up a real-time listener for the user's document
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const friendIds = userData.friends || [];

        // Fetch friend details (email) for each friend ID
        Promise.all(
          friendIds.map(async (friendId: string) => {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            if (friendDoc.exists()) {
              const friendData = friendDoc.data();
              return { id: friendId, email: friendData.email };
            }
            return null;
          })
        )
          .then((friendDetails) => {
            // Filter out any null results and update the state
            setFriends(friendDetails.filter((friend) => friend !== null) as Friend[]);
          })
          .catch((error) => {
            console.error("Error fetching friend details:", error);
          });
      }
    });

    return unsubscribe; // Return the unsubscribe function to clean up the listener
  };

  // Add a friend by email
  const handleAddFriend = async () => {
    Alert.prompt(
      "Add Friend",
      "Enter the email of the user you want to add:",
      async (email) => {
        if (!email) {
          Alert.alert("Error", "Please enter a valid email.");
          return;
        }

        try {
          // Query the users collection to find a user with the matching email
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", email.toLowerCase()));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            Alert.alert("Error", "No user found with this email.");
            return;
          }

          // Get the friend's user ID from the query result
          const friendDoc = querySnapshot.docs[0];
          const friendId = friendDoc.id;

          if (!userId) {
            Alert.alert("Error", "You must be logged in to add a friend.");
            return;
          }

          // Add the friend's user ID to the current user's friends list
          await updateDoc(doc(db, "users", userId), {
            friends: arrayUnion(friendId),
          });

          // Add the current user's ID to the friend's friends list
          await updateDoc(doc(db, "users", friendId), {
            friends: arrayUnion(userId),
          });

          Alert.alert("Success", "Friend added successfully!");
        } catch (error) {
          console.error("Error adding friend:", error);
          Alert.alert("Error", "An error occurred while adding the friend.");
        }
      }
    );
  };

  // Monitor authentication state to get the current user's ID
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setFriends([]); // Clear friends list when signed out
      }
    });

    return unsubscribeAuth;
  }, []);

  // Set up a real-time listener for the user's friends list
  useEffect(() => {
    if (userId) {
      const unsubscribeFriends = loadFriends();
      return () => unsubscribeFriends(); // Clean up the listener on unmount
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Friends</Text>
        <Pressable onPress={handleAddFriend}>
          <Ionicons name="person-add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Friends List */}
      <View style={styles.content}>
        {friends.length > 0 ? (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.friendItem}
                onPress={() => router.push(`/chat/friendsChat?id=${item.id}`)} // Navigate to the friends chat
              >
                <Image
                  source={{ uri: "https://via.placeholder.com/50/FFFFFF" }} // Blank profile picture
                  style={styles.profilePicture}
                />
                <Text style={styles.friendName}>{item.email}</Text>
              </Pressable>
            )}
          />
        ) : (
          <Text style={styles.text}>You have no friends yet. Add some!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1b3a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#302b63",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#2c2c54",
    borderRadius: 8,
    marginBottom: 10,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendName: {
    color: "#fff",
    fontSize: 16,
  },
});
