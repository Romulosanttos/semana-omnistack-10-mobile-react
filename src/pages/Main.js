import React, { useEffect, useState } from "react";
import { StyleSheet, Image, View, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  requestPermissionsAsync,
  getCurrentPositionAsync
} from "expo-location";

export default function Main() {
  const [currentRegion, setCurrentregion] = useState(null);

  useEffect(() => {
    async function loadInitialPosition() {
      const { granted } = await requestPermissionsAsync();
      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccuracy: true
        });

        const { latitude, longitude } = coords;
        setCurrentregion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04
        });
      }
    }

    loadInitialPosition();
  }, []);

  if (!currentRegion) {
    return null;
  }

  return (
    <>
      <MapView initialRegion={currentRegion} style={styles.map}>
        <Marker coordinate={{ latitude: -5.8838733, longitude: -35.2043035 }}>
          <Image
            style={styles.avatar}
            source={{
              uri: "https://avatars0.githubusercontent.com/u/11372354?s=460&v=4"
            }}
          />
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.devName}>Romulo </Text>
              <Text style={styles.devBio}>Bio aqui louca </Text>
              <Text style={styles.devTechs}>ReactJs, React Native </Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: "#FFF"
  },
  callout: {
    width: 260
  },
  devBio: {
    color: "#666",
    marginTop: 5
  },
  devName: {
    fontWeight: "bold",
    fontSize: 16
  },
  devTechs: {
    marginTop: 5
  }
});
