import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Main function renamed to "Events" for consistency
export default function Events() {
  // Get navigation object from expo-router to manage navigation
  const navigation = useNavigation();

  // Handle when a day on the calendar is pressed
  const handleDayPress = (day: DateData) => {
    console.log("Selected day", day); // Logs the selected date in console
  };

  // Set header options like title and right-side icon
  React.useLayoutEffect(() => {
    navigation.setOptions({
      // Sets the title of the page to "Events"
      title: "Events",
      // Adds a settings icon on the top-right corner
      headerRight: () => (
        <Pressable
          onPress={() => (navigation as any).navigate("settings")} // Navigate to settings page
          style={{ marginRight: 15 }}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </Pressable>
      ),
      // Customizes the header background and text color
      headerStyle: {
        backgroundColor: "#1b1b3a", // Dark blue background for the header
      },
      headerTintColor: "#fff", // White color for text/icons
    });
  }, [navigation]);

  return (
    // LinearGradient for beautiful gradient background
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#8e44ad"]} // Gradient colors
      style={styles.container}
      start={{ x: 0, y: 0 }} // Gradient start position (top-left)
      end={{ x: 1, y: 1 }} // Gradient end position (bottom-right)
    >
      {/* Wrapper to add padding and structure */}
      <View style={styles.calendarWrapper}>
        {/* Calendar component to display dates */}
        <Calendar
          onDayPress={handleDayPress} // Call handleDayPress when date is tapped
          theme={{
            calendarBackground: "transparent", // Transparent calendar background
            dayTextColor: "#fff", // White day numbers
            monthTextColor: "#fff", // White month name
            arrowColor: "#fff", // White arrows for navigation
            todayTextColor: "#ffd700", // Gold color for today's date
            selectedDayBackgroundColor: "#6c5ce7", // Highlighted date background
            selectedDayTextColor: "#fff", // Text color for selected date
          }}
        />
      </View>
    </LinearGradient>
  );
}

// StyleSheet for component styling
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes full height of the screen
  },
  calendarWrapper: {
    flex: 1, // Takes remaining space below the header
    paddingTop: 20, // Add some space at the top
    paddingHorizontal: 10, // Add padding on the sides
  },
});









