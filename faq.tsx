import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const faqData = [
  {
    question: "How do I add an event?",
    answer: "Tap on a date in the calendar and follow the prompts to enter the event name and time.",
  },
  {
    question: "What is the Rewards system?",
    answer: "You earn points by completing events. Redeem them for perks like streak protection or calendar themes.",
  },
  {
    question: "How do I enable dark mode?",
    answer: "Go to Settings > Preferences and toggle the Dark Mode switch.",
  },
  {
    question: "Can I edit my profile?",
    answer: "Yes! Head to your profile page and tap the Edit button to change your username, bio, or avatar.",
  },
];

export default function FAQScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📖 Help & FAQ</Text>
      {faqData.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <Pressable onPress={() => toggleAnswer(index)} style={styles.questionRow}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.toggleIcon}>
              {openIndex === index ? "▲" : "▼"}
            </Text>
          </Pressable>
          {openIndex === index && (
            <Text style={styles.answer}>{item.answer}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0c29",
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 10,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    color: "#ffd700",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  toggleIcon: {
    color: "#ffd700",
    fontSize: 16,
    paddingLeft: 10,
  },
  answer: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
