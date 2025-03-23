import {Loader} from "google.maps/js-api-loader";
import {useEffect, useState} from "react";
import {GoogleMapsApiKey} from "./config";

const API_KEY = "put key here";

const GoogleMap = () => {
    const mapRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const loader = new Loader({
        apiKey: API_KEY,
        version: "weekly",
      });
  
      loader.load().then(() => {
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 0, lng: 0 },
            zoom: 12,
          });
  
          navigator.geolocation.getCurrentPosition((position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
  
            map.setCenter(userLocation);
  
            new google.maps.Marker({
              position: userLocation,
              map,
              title: "Location",
            });
          });
        }
      });
    }, []);
  
    return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
  };
  
  export default GoogleMap;
