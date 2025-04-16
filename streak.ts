import { useEffect } from "react";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_POINTS = 1000; // Maximum points for the progress bar

// Function to get the current total points
export const getTotalPoints = async (): Promise<number> => {
  const points = await AsyncStorage.getItem("totalPoints");
  return points ? parseInt(points, 10) : 0;
};

// Function to add points
export const addPoints = async (pointsToAdd: number): Promise<number> => {
  const currentPoints = await getTotalPoints();
  const newPoints = Math.min(currentPoints + pointsToAdd, MAX_POINTS); // Ensure points cannot exceed MAX_POINTS
  await AsyncStorage.setItem("totalPoints", newPoints.toString());
  return newPoints;
};

// Function to reset points (if needed)
export const resetPoints = async (): Promise<void> => {
  await AsyncStorage.setItem("totalPoints", "0");
};

function useStreak() {
    const [Streak, setStreak] = useState(0);

    useEffect(() => {
        const currentDate: string = new Date().toDateString(); // Get the current date in string format
        
        const getStreak = async () => { // Function to get the streak from AsyncStorage
            const lastDate: string | null = await AsyncStorage.getItem("lastDate");
            const savedStreak: string | null = await AsyncStorage.getItem("streak");
            const currentStreak: number = savedStreak ? parseInt(savedStreak) : 0;

            if (currentStreak === null) { // Check if currentStreak is null
                await AsyncStorage.setItem("streak", "0"); // Initialize streak to 0
                setStreak(0);
            }
            else {
                const parsedStreak: number = Number(savedStreak); // Parse the saved streak to a number
                setStreak(currentStreak);
            }

            if (lastDate === null) { // Check if lastDate is null
                await AsyncStorage.setItem("lastDate", currentDate); 
            } else if (lastDate !== currentDate){ // Check if lastDate is not equal to currentDate
                const lastStreak: number = Number(savedStreak) || 0; 
                const newStreak: number = lastStreak + 1;

                setStreak(newStreak); // Update the streak in state
                await AsyncStorage.setItem("streak", newStreak.toString()); // Update the streak in AsyncStorage
                await AsyncStorage.setItem("lastDate", currentDate);
            }
        }
        getStreak(); // Call the function to get the streak
    }
    , []); // Empty dependency array to run only once on mount
    
    return Streak; // Return the streak value
}

export default useStreak; // Custom hook to manage streaks
