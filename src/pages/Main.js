import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard //pegar o listem
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  requestPermissionsAsync,
  getCurrentPositionAsync
} from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

import api from "../services/api";
import { connect, disconnect, subscribeToNewDevs } from "../services/socket";

export default function Main({ navigation }) {
  const [devs, setDevs] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [techs, setTechs] = useState("");

  useEffect(() => {
    async function loadInitialPosition() {
      const { granted } = await requestPermissionsAsync();
      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccuracy: true
        });

        const { latitude, longitude } = coords;
        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04
        });
      }
    }

    loadInitialPosition();
  }, []);

  useEffect(() => {
    subscribeToNewDevs(dev => setDevs([...devs, dev]));
  }, [devs]);

  function setupWebsocket() {
    disconnect();
    const { latitude, longitude } = currentRegion;
    connect(latitude, longitude, techs);
  }

  async function loadDev() {
    const { latitude, longitude } = currentRegion;
    await api
      .get("/search", {
        params: {
          latitude,
          longitude,
          techs: "ReactJS, Vue.js"
        }
      })
      .then(({ data }) => {
        setDevs(data);
        setupWebsocket();
      });
  }

  function handleRegionChange(region) {
    setCurrentRegion(region);
  }

  if (!currentRegion) {
    return null;
  }

  return (
    <>
      <MapView
        onRegionChangeComplete={handleRegionChange}
        initialRegion={currentRegion}
        style={styles.map}
      >
        {devs.map(
          ({
            _id,
            location,
            avatar_url,
            github_username,
            name,
            bio,
            techs
          }) => (
            <Marker
              key={_id}
              coordinate={{
                latitude: location.coordinates[1],
                longitude: location.coordinates[0]
              }}
            >
              <Image
                style={styles.avatar}
                source={{
                  uri: avatar_url
                }}
              />
              <Callout
                onPress={() => {
                  navigation.navigate("Profile", {
                    github_username: github_username
                  });
                }}
              >
                <View style={styles.callout}>
                  <Text style={styles.devName}>{name} </Text>
                  <Text style={styles.devBio}>{bio}</Text>
                  <Text style={styles.devTechs}>{techs.join(", ")}</Text>
                </View>
              </Callout>
            </Marker>
          )
        )}
      </MapView>
      <View style={styles.searchForm}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar devs por techs..."
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoCorrect={false}
          value={techs}
          onChangeText={setTechs}
        />
        <TouchableOpacity onPress={loadDev} style={styles.loadButton}>
          <MaterialIcons name="my-location" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
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
  },

  searchForm: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: "row"
  },

  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFF",
    color: "#333",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 4,
      height: 4
    },
    elevation: 4
  },

  loadButton: {
    width: 50,
    height: 50,
    backgroundColor: "#8E4Dff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15
  }
});
