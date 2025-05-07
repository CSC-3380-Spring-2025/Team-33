import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RewardsScreen() {
  const [points, setPoints] = useState(0);
  const [freezeCount, setFreezeCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const savedPoints = await AsyncStorage.getItem("totalPoints");
      const savedFreezes = await AsyncStorage.getItem("streakFreezes");
      if (savedPoints) setPoints(parseInt(savedPoints));
      if (savedFreezes) setFreezeCount(parseInt(savedFreezes));
    };
    loadData();
  }, []);

  const redeemFreeze = async () => {
    if (points < 50) {
      Alert.alert("Not enough points", "You need 50 points to unlock a Streak Freeze.");
      return;
    }

    const newPoints = points - 50;
    const newFreezeCount = freezeCount + 1;

    setPoints(newPoints);
    setFreezeCount(newFreezeCount);

    await AsyncStorage.setItem("totalPoints", newPoints.toString());
    await AsyncStorage.setItem("streakFreezes", newFreezeCount.toString());

    Alert.alert("✅ Streak Freeze unlocked!", "You now have a freeze ready to use.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎁 Rewards</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧊 Streak Freeze</Text>
        <Text style={styles.cardDesc}>Use this to prevent losing your streak if you miss a day.</Text>
        <Text style={styles.cardCost}>Cost: 50 points</Text>

        <Pressable style={styles.button} onPress={redeemFreeze}>
          <Text style={styles.buttonText}>Unlock Freeze</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>🪙 Points: {points} | 🧊 Freezes: {freezeCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1b3a",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#2c2c54",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 6,
    fontWeight: "bold",
  },
  cardDesc: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 10,
  },
  cardCost: {
    fontSize: 14,
    color: "#ffd700",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4b4b8f",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  footer: {
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
  },
});
