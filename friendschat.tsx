import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "../firebaseConfig"; 
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth } from "../firebaseConfig"; 

export default function FriendsChat() {
  const router = useRouter();
  const { id: chatId } = useLocalSearchParams(); 
  const [messages, setMessages] = useState<{ id: string; text: string; senderId: string }[]>([]); // Chat messages
  const [message, setMessage] = useState("");

  
  const currentUser = auth.currentUser;
  const currentUserId = currentUser?.uid;

  
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "friendsChats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as { id: string; text: string; senderId: string }[];
      setMessages(fetchedMessages);
    });

    return () => unsubscribe(); /
  }, [chatId]);

  const sendMessage = async () => {
    if (message.trim() === "" || !chatId) return;

    try {
      const messagesRef = collection(db, "friendsChats", chatId, "messages");

      await addDoc(messagesRef, {
        text: message,
        senderId: currentUserId,
        timestamp: new Date(),
      });

      setMessage(""); 
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Friends Chat</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.message}>
            {item.senderId === currentUserId ? "You: " : "Friend: "}
            {item.text}
          </Text>
        )}
        style={styles.chatArea}
      />
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          value={message}
          onChangeText={setMessage}
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
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
    padding: 20,
    backgroundColor: "#302b63",
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatArea: {
    flex: 1,
    padding: 20,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#302b63",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#2c2c54",
    borderRadius: 8,
    color: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#6c5ce7",
    borderRadius: 8,
  },
  sendText: {
    color: "#fff",
    fontSize: 16,
  },
});
