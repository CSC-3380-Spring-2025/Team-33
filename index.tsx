import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  TextStyle,
  ViewStyle,
  Image,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo

// Custom type for marking streak days on the calendar
type MarkedDates = {
  [date: string]: {
    customStyles: {
      container?: ViewStyle;
      text?: TextStyle;
    };
  };
};

export default function Events() {
  const navigation = useNavigation();
  const router = useRouter();

  // Streak data
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streakDates, setStreakDates] = useState<string[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  // User avatar image URL
  const [avatar, setAvatar] = useState<string | null>(null);

  // Threshold for full progress bar (e.g. unlock reward)
  const maxPoints = 1000;

  // Load streak, points, calendar marks, and avatar from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const streak = await AsyncStorage.getItem("streak");
      const points = await AsyncStorage.getItem("totalPoints");
      const storedDates = await AsyncStorage.getItem("streakDates");
      const avatarUrl = await AsyncStorage.getItem("avatar");

      if (streak) setCurrentStreak(parseInt(streak));
      if (points) setTotalPoints(parseInt(points));
      if (storedDates) {
        const parsed = JSON.parse(storedDates);
        setStreakDates(parsed);
        updateMarkedDates(parsed);
      }
      if (avatarUrl) setAvatar(avatarUrl);
    };

    loadData();
  }, []);

  // Create calendar marking object for highlighted streak dates
  const updateMarkedDates = (dates: string[]) => {
    const marks: MarkedDates = {};
    dates.forEach((date) => {
      marks[date] = {
        customStyles: {
          container: {
            backgroundColor: "#6c5ce7",
            borderRadius: 6,
          },
          text: {
            color: "#fff",
            fontWeight: "bold",
          },
        },
      };
    });
    setMarkedDates(marks);
  };

  // Handle daily check-in logic
  const handleDayPress = async (day: DateData) => {
    const today = dayjs().format("YYYY-MM-DD");

    // Only allow today's check-in
    if (day.dateString !== today) return;

    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const lastDate = streakDates[streakDates.length - 1];

    let newStreak = currentStreak;
    let newPoints = totalPoints;
    let newDates: string[] = [];

    // Streak logic: continue, reset, or do nothing
    if (!lastDate) {
      newStreak = 1;
      newDates = [today];
    } else if (lastDate === yesterday) {
      newStreak += 1;
      newDates = [...streakDates, today];
    } else if (lastDate === today) {
      return; // already checked in today
    } else {
      newStreak = 1;
      newDates = [today];
    }

    newPoints += 10;

    // Update local state
    setCurrentStreak(newStreak);
    setTotalPoints(newPoints);
    setStreakDates(newDates);
    updateMarkedDates(newDates);

    // Persist new streak and points
    await AsyncStorage.setItem("streak", newStreak.toString());
    await AsyncStorage.setItem("totalPoints", newPoints.toString());
    await AsyncStorage.setItem("streakDates", JSON.stringify(newDates));
  };

  // Set navigation header with user's avatar in top right corner
  useEffect(() => {
    navigation.setOptions({
      title: "Events",
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/profile" as const)}
          style={{ marginRight: 15 }}
        >
          <Image
            source={{
              uri: avatar || "https://i.pravatar.cc/150?img=12", // Fallback image
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
        backgroundColor: "#1b1b3a",
      },
      headerTintColor: "#fff",
    });
  }, [navigation, avatar]);

  // Calculate progress bar width based on points
  const progressPercent = Math.min((totalPoints / maxPoints) * 100, 100);

  return (
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#8e44ad"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.calendarWrapper}>
        {/* Calendar with streak marking and dimmed other-month dates */}
        <Calendar
          onDayPress={handleDayPress}
          markingType="custom"
          markedDates={markedDates}
          theme={{
            calendarBackground: "transparent",
            dayTextColor: "#fff",
            monthTextColor: "#fff",
            arrowColor: "#fff",
            todayTextColor: "#ffd700",
            selectedDayBackgroundColor: "#6c5ce7",
            selectedDayTextColor: "#fff",
          }}
          dayComponent={({
            date,
            state,
          }: {
            date: { dateString: string; day: number };
            state: "disabled" | "inactive" | "today" | undefined;
          }) => {
            const isDimmed = state === "disabled";
            const mark = markedDates[date.dateString];

            return (
              <View
                style={{
                  backgroundColor: mark?.customStyles?.container?.backgroundColor || "transparent",
                  borderRadius: 6,
                  padding: 6,
                }}
              >
                <Text
                  style={{
                    color: isDimmed
                      ? "#666"
                      : mark?.customStyles?.text?.color || "#fff",
                    fontWeight: mark?.customStyles?.text?.fontWeight || "normal",
                    opacity: isDimmed ? 0.5 : 1,
                    textAlign: "center",
                  }}
                >
                  {date.day}
                </Text>
              </View>
            );
          }}
        />

        {/* Progress bar section under the calendar */}
        <View style={styles.progressOverlay}>
          <Text style={styles.progressLabel}> {totalPoints} / {maxPoints} points</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <Pressable
            style={styles.rewardsButton}
            onPress={() => router.push("/rewards" as const)}
          >
            <Text style={styles.rewardsText}> View Rewards</Text>
          </Pressable>
        </View>
      </View>

      {/* Dashboard at the bottom */}
      <View style={styles.dashboard}>
        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.push("/friends" as const)} // Navigate to friends list
        >
          <Ionicons name="people" size={24} color="#fff" />
          <Text style={styles.dashboardText}>Friends</Text>
        </Pressable>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.push("/map" as const)} // Navigate to map page
        >
          <Ionicons name="earth" size={24} color="#fff" />
          <Text style={styles.dashboardText}>Map</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

// Component styles
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
    paddingBottom: 20,
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
  rewardsButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#4b4b8f",
    borderRadius: 8,
  },
  rewardsText: {
    color: "#fff",
    fontSize: 14,
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








