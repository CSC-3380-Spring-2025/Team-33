import { useEffect } from "react";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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