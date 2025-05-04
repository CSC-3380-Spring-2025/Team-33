import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text, Pressable } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import haversine from 'haversine-distance';

const DEFAULT_RADIUS_METERS = 5000; // This will be replaced with a setting

const MapScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      fetchPublicEvents(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchPublicEvents = async (userLat: number, userLon: number) => {
    try {
      const snapshot = await getDocs(collection(db, 'publicEvents'));
      const fetchedEvents = snapshot.docs.map(doc => doc.data());

      const filtered = fetchedEvents.filter(event => {
        const distance = haversine(
          { lat: userLat, lon: userLon },
          { lat: event.latitude, lon: event.longitude }
        );
        return distance <= DEFAULT_RADIUS_METERS;
      });

      setEvents(filtered);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  if (!region) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Map</Text>
      </View>

      {/* Map */}
      <MapView style={styles.map} region={region} showsUserLocation={true}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You're here"
          />
        )}

        {events.map((event, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: event.latitude, longitude: event.longitude }}
            title={event.name}
            pinColor="orange"
          />
        ))}
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    position: "absolute",
    left: '50%',
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
