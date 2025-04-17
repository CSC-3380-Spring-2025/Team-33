import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  FlatList,
  Alert,
  Image,
  Modal,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { addPoints } from "./streaks"; // Import point tracking functions
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    customStyles?: {
      container?: ViewStyle;
      text?: TextStyle;
    };
  };
};

type Event = {
  id: string;
  date: string;
  time: string; // New property for event time
  name: string;
  isFriendEvent?: boolean;
  friendName?: string;
  friendEmail?: string;
  chatId?: string;
};

const sortEvents = (a: Event, b: Event) => {
  if (a.date === b.date) {
    return a.time.localeCompare(b.time); // Sort by time if dates are the same
  }
  return a.date.localeCompare(b.date); // Sort by date
};

export default function Events() {
  const navigation = useNavigation();
  const router = useRouter();

  // State to track marked dates, events, selected date, and user avatar
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [friendsEvents, setFriendsEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false); // Track user authentication state
  const [userId, setUserId] = useState<string | null>(null); // Track user ID
  const [userEmail, setUserEmail] = useState<string | null>(null); // Track user email

  // Progress bar state to track user points
  const [totalPoints, setTotalPoints] = useState(0);
  const maxPoints = 1000; // Max points for the progress bar

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsSignedIn(true);
        setAvatar("https://via.placeholder.com/150/FFA500"); // Orange profile picture
        setUserId(user.uid);
        setUserEmail(user.email); // Set the user's email

        // Load user data from Firestore
        await loadUserData(user.uid);
      } else {
        // Save events to Firestore before clearing local data
        if (userId) {
          try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, {
              events,
            });
          } catch (error) {
            console.error("Error saving events on logout:", error);
          }
        }

        setIsSignedIn(false);
        setAvatar(null); // Blank profile picture
        setUserId(null);
        setUserEmail(null); // Clear the email when signed out

        // Clear local data for non-logged-in users
        setEvents([]);
        setMarkedDates({});
        setTotalPoints(0);
        await AsyncStorage.clear(); // Clear AsyncStorage when logged out
      }
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, []);

  // Load events and marked dates from Firestore when the app starts
  useEffect(() => {
    if (userId) {
      loadUserData(userId); // Load data only for logged-in users
    }
  }, [userId]);

  // Load user and friends' events from Firestore
  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userEvents = userData.events || [];
        setEvents(userEvents); // Set user's own events
        setTotalPoints(userData.points || 0);
        setMarkedDates(generateMarkedDates(userEvents, "red")); // Mark user's events in red

        // Fetch friends' events
        const friendIds = userData.friends || [];
        const friendsEvents = await fetchFriendsEvents(friendIds);
        setFriendsEvents(friendsEvents); // Store friends' events
        setMarkedDates((prevMarkedDates) =>
          generateMarkedDates(friendsEvents, "blue", prevMarkedDates) // Mark friends' events in blue
        );
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Fetch events created by friends
  const fetchFriendsEvents = async (friendIds: string[]) => {
    try {
      const friendsEvents: Event[] = [];
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, "users", friendId));
        if (friendDoc.exists()) {
          const friendData = friendDoc.data();
          const friendEmail = friendData.email || "Unknown Friend"; // Use email or fallback
          const friendEvents = friendData.events || [];
          friendsEvents.push(
            ...friendEvents.map((event: Event) => ({
              ...event,
              isFriendEvent: true, // Mark as a friend's event
              friendEmail, // Include the friend's email
            }))
          );
        }
      }
      return friendsEvents;
    } catch (error) {
      console.error("Error fetching friends' events:", error);
      return [];
    }
  };

  // Generate marked dates for the calendar
  const generateMarkedDates = (
    events: Event[],
    dotColor: string,
    existingMarkedDates: MarkedDates = {}
  ) => {
    const newMarkedDates = { ...existingMarkedDates };
    events.forEach((event) => {
      newMarkedDates[event.date] = {
        ...newMarkedDates[event.date],
        marked: true,
        dotColor, // Use the specified color for the dot
      };
    });
    return newMarkedDates;
  };

  // Save user data to Firestore
  const saveUserData = async () => {
    if (userId) {
      try {
        await updateDoc(doc(db, "users", userId), {
          events,
          points: totalPoints,
          markedDates, // Save marked dates to Firestore
        });
      } catch (error) {
        console.error("Error saving user data:", error);
      }
    }
  };

  // When a date is pressed on the calendar, prompt the user to add an event
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setEventName("");
    Alert.prompt(
      "Add Event",
      `Enter a name for the event on ${day.dateString}:`,
      (text) => {
        if (text) {
          Alert.prompt(
            "Set Time",
            "",
            (time) => {
              if (time) {
                addEvent(day.dateString, text, time);
              }
            }
          );
        }
      }
    );
  };

  // Add an event to the selected date
  const addEvent = async (date: string, name: string, time: string) => {
    const newEvent: Event = {
      id: `${date}-${name}-${time}`, // Unique event ID
      date,
      time, // Add time to the event
      name,
      chatId: `${date}-${name}`, // Use the event ID as the chatId
    };

    // Add the event to the local list
    setEvents((prevEvents) => [...prevEvents, newEvent].sort(sortEvents));

    // Add the red dot to the calendar for this date
    setMarkedDates((prevMarkedDates) => ({
      ...prevMarkedDates,
      [date]: {
        ...prevMarkedDates[date],
        marked: true,
        dotColor: "red",
      },
    }));

    // Save the event to Firestore
    if (userId) {
      try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          events: [...events, newEvent].sort(sortEvents), // Append and sort events
        });
      } catch (error) {
        console.error("Error saving event to Firestore:", error);
      }
    }
  };

  // Remove event from the list and update calendar
  const removeEvent = (eventId: string) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);

    // Update marked days on the calendar
    const updatedMarkedDates = { ...markedDates };

    // Clear red dots for dates with no events for real this time.
    Object.keys(markedDates).forEach((date) => {
      if (!updatedEvents.some((event) => event.date === date)) {
        delete updatedMarkedDates[date]; // Remove the dot if no events remain for this date
      }
    });

    setMarkedDates(updatedMarkedDates);
  };

  // functionality for the complete button, adds points and removes the event
  const handleCompleteEvent = async (eventId: string) => {
    await addPoints(10); // Add 10 points for completing event for now
    const updatedPoints = await AsyncStorage.getItem("totalPoints");
    setTotalPoints(updatedPoints ? parseInt(updatedPoints, 10) : 0); // Update the progress bar
    removeEvent(eventId); // ovbiously 
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  // Load events and marked dates from AsyncStorage when the app starts
  useEffect(() => {
    const loadEvents = async () => {
      const storedEvents = await AsyncStorage.getItem("events");
      const avatarUrl = await AsyncStorage.getItem("avatar");

      if (storedEvents) {
        const parsedEvents: Event[] = JSON.parse(storedEvents);
        setEvents(parsedEvents);

        // Add red dots for all the events
        const newMarkedDates: MarkedDates = {};
        parsedEvents.forEach((event) => {
          newMarkedDates[event.date] = {
            marked: true,
            dotColor: "red",
          };
        });
        setMarkedDates(newMarkedDates);
      }

      if (avatarUrl) setAvatar(avatarUrl); // Load the user avatar
    };

    loadEvents();
  }, []);

  // Set up the navigation header with the user's avatar and email
  useEffect(() => {
    navigation.setOptions({
      title: "Events",
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {userEmail && (
            <Text style={{ color: "#fff", marginRight: 10, fontSize: 14 }}>
              {userEmail}
            </Text>
          )}
          <Pressable
            onPress={() => router.push("/profile")}
            style={{ marginRight: 15 }}
          >
            <Image
              source={{
                uri: avatar || "https://via.placeholder.com/150/FFFFFF", // Blank profile picture if not signed in
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: isSignedIn ? "#FFA500" : "#fff", // Orange border if signed in
              }}
            />
          </Pressable>
        </View>
      ),
      headerStyle: {
        backgroundColor: "#1b1b3a",
      },
      headerTintColor: "#fff",
    });
  }, [navigation, avatar, isSignedIn, userEmail]);

  // Calculate progress bar width
  const progressPercent = Math.min((totalPoints / maxPoints) * 100, 100);

  return (
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#8e44ad"]} // Fancy Gradient background
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.calendarWrapper}>
        {/* Calendar with red dots for events */}
        <Calendar
          onDayPress={handleDayPress}
          markingType="dot"
          markedDates={markedDates}
          theme={{
            calendarBackground: "transparent",
            dayTextColor: "#fff",
            monthTextColor: "#fff",
            arrowColor: "#fff",
            todayTextColor: "#ffd700", // Highlight today's date
            selectedDayBackgroundColor: "#6c5ce7",
            selectedDayTextColor: "#fff",
          }}
        />

        {/* Progress Bar */}
        <View style={styles.progressOverlay}>
          <Text style={styles.progressLabel}>
            {totalPoints} / {maxPoints} points
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Event List */}
        <View style={styles.eventList}>
          <Text style={styles.eventListTitle}>Events</Text>
          <FlatList
            data={[...events, ...friendsEvents].sort(sortEvents)} // Combine and sort events
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleEventPress(item)}>
                <View style={styles.eventItem}>
                  <View>
                    <Text style={styles.eventDate}>
                      {item.date} {item.time} {item.isFriendEvent && `- ${item.friendEmail}`} {/* Display time and friend's email */}
                    </Text>
                    <Text
                      style={[
                        styles.eventName,
                        item.isFriendEvent && { color: "blue" }, // Different color for friends' events
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      </View>

      {/* Modal for Event Details */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                <Text style={styles.modalDate}>{selectedEvent.date}</Text>

                {/* Buttons */}
                <View style={styles.modalButtons}>
                  {/* Complete Event Button (only for the creator and if the date matches today's date) */}
                  {!selectedEvent.isFriendEvent &&
                    selectedEvent.date === dayjs().format("YYYY-MM-DD") && (
                      <Pressable
                        style={styles.completeButton}
                        onPress={() => {
                          handleCompleteEvent(selectedEvent.id);
                          setIsModalVisible(false);
                        }}
                      >
                        <Text style={styles.buttonText}>Complete Event</Text>
                      </Pressable>
                    )}

                  {/* Remove Event Button (only for the creator) */}
                  {!selectedEvent.isFriendEvent && (
                    <Pressable
                      style={styles.trashButton}
                      onPress={() => {
                        removeEvent(selectedEvent.id);
                        setIsModalVisible(false);
                      }}
                    >
                      <Text style={styles.buttonText}>Remove Event</Text>
                    </Pressable>
                  )}

                  {/* Chat Button */}
                  <Pressable
                    style={styles.chatButton}
                    onPress={() => {
                      setIsModalVisible(false);
                      router.push(`/chat/${selectedEvent.chatId}`); // Navigate to the chat for the event
                    }}
                  >
                    <Text style={styles.buttonText}>Go to Chat</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Dashboard at the bottom */}
      <View style={styles.dashboard}>
        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.push("/friends")} // Nav to the friends list
        >
          <Ionicons name="people" size={24} color="#fff" />
          <Text style={styles.dashboardText}>Friends</Text>
        </Pressable>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.push("/map")} // Nav to the map page
        >
          <Ionicons name="earth" size={24} color="#fff" />
          <Text style={styles.dashboardText}>Map</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

// Style stuff dont touch pls
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarWrapper: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  progressOverlay: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  progressLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    width: "100%",
    backgroundColor: "#444",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6c5ce7",
  },
  eventList: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  eventListTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  eventDate: {
    color: "#fff",
    fontSize: 14,
  },
  eventName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  eventActions: {
    flexDirection: "row",
  },
  completeButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  trashButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  chatButton: {
    backgroundColor: "#6c5ce7",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  dashboard: {
    flexDirection: "row",
    justifyContent: "space-around", // Space out buttons evenly
    alignItems: "center",
    backgroundColor: "#1b1b3a",
    paddingVertical: 20,
  },
  dashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dashboardText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1b1b3a",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDate: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    width: "100%",
    marginTop: 10,
  },
});





