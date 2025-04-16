import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { addPoints } from "./streaks"; // Import point tracking functions

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
  name: string;
};

export default function Events() {
  const navigation = useNavigation();
  const router = useRouter();

  // State to track marked dates, events, selected date, and user avatar
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Progress bar state to track user points
  const [totalPoints, setTotalPoints] = useState(0);
  const maxPoints = 1000; // Max points for the progress bar (to be decided)

  // When a date is pressed on the calendar, prompt the user to add an event
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setEventName("");
    Alert.prompt(
      "Add Event",
      `Enter a name for the event on ${day.dateString}:`,
      (text) => {
        if (text) {
          addEvent(day.dateString, text);
        }
      }
    );
  };

  // Adds the event to the selected date
  const addEvent = (date: string, name: string) => {
    const newEvent: Event = {
      id: `${date}-${name}`, // Unique IDs for the events
      date,
      name,
    };

    // Add the events to the list
    setEvents((prevEvents) => [...prevEvents, newEvent]);

    // Adds the little icon to the calendar for dates with events.
    setMarkedDates((prevMarkedDates) => ({
      ...prevMarkedDates,
      [date]: {
        ...prevMarkedDates[date],
        marked: true,
        dotColor: "red",
      },
    }));

    // Save the updated events to asyncStorage (hopefully)
    AsyncStorage.setItem("events", JSON.stringify([...events, newEvent]));
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

    // Save the updated events to AsyncStorage
    AsyncStorage.setItem("events", JSON.stringify(updatedEvents));
  };

  // functionality for the complete button, adds points and removes the event
  const handleCompleteEvent = async (eventId: string) => {
    await addPoints(10); // Add 10 points for completing event for now
    const updatedPoints = await AsyncStorage.getItem("totalPoints");
    setTotalPoints(updatedPoints ? parseInt(updatedPoints, 10) : 0); // Update the progress bar
    removeEvent(eventId); // ovbiously 
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

  // Set up the navigation header with the user's avatar
  useEffect(() => {
    navigation.setOptions({
      title: "Events", // 
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/profile")} // Gos to the profile page
          style={{ marginRight: 15 }}
        >
          <Image
            source={{
              uri: avatar || "https://i.pravatar.cc/150?img=12", // Placeholder avatar
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: "#fff",
            }}
          />
        </Pressable>
      ),
      headerStyle: {
        backgroundColor: "#1b1b3a", // Dark background for the header
      },
      headerTintColor: "#fff", // White text for header
    });
  }, [navigation, avatar]);

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
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <View>
                  <Text style={styles.eventDate}>{item.date}</Text>
                  <Text style={styles.eventName}>{item.name}</Text>
                </View>
                <View style={styles.eventActions}>
                  {/* Complete Button */}
                  <Pressable
                    style={styles.completeButton}
                    onPress={() => handleCompleteEvent(item.id)}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  </Pressable>

                  {/* Trash Button */}
                  <Pressable
                    style={styles.trashButton}
                    onPress={() => removeEvent(item.id)}
                  >
                    <Ionicons name="trash" size={24} color="red" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        </View>
      </View>

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
    marginLeft: 10,
  },
  trashButton: {
    marginLeft: 10,
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
});
