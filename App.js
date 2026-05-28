// App.js — Étape 1 : position GPS
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet
} from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  // états pour le géocodage direct (adresse -> coordonnées)
  const [recherche, setRecherche] = useState('');
  const [resultatsGeo, setResultatsGeo] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // adresse --> coordonnées
  const geocoderDirect = async () => {
    if (!recherche.trim()) return;
    setLoadingGeo(true);
    setResultatsGeo([]);

    try {
      // geocodeAsync retourne un tableau de résultats possibles
      const resultats = await Location.geocodeAsync(recherche.trim());
      setResultatsGeo(resultats);
    } catch (e) {
      console.error('Géocodage direct échoué :', e.message);
    } finally {
      setLoadingGeo(false);
    }
  };


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Rechercher une adresse..."
        value={recherche}
        onChangeText={setRecherche}
        onSubmitEditing={geocoderDirect}
        returnKeyType="search"
      />

      <TouchableOpacity style={styles.btn} onPress={geocoderDirect}>
        <Text style={styles.btnTxt}>Rechercher</Text>
      </TouchableOpacity>

      {resultatsGeo.map((r, i) => (
        <TouchableOpacity key={i} style={styles.resultItem}
          onPress={() => {
            // On peut naviguer vers ces coordonnées sur la carte
            console.log('Coordonnées :', r.latitude, r.longitude);
          }}
        >
          <Text style={styles.resultCoords}>
            {r.latitude.toFixed(5)}° / {r.longitude.toFixed(5)}°
          </Text>
        </TouchableOpacity>
      ))}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 24, backgroundColor: '#F8FAFC'
  },
  btn: {
    backgroundColor: '#20232A', padding: 16,
    borderRadius: 12, width: '100%', alignItems: 'center'
  },
  btnTxt: { color: '#23B2A4', fontWeight: 'bold', fontSize: 16 },
  input: {
    width: '100%', backgroundColor: '#FFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, fontSize: 18, marginBottom: 12, color: '#1E293B'
  },
  resultItem: {
    width: '100%', marginTop: 10, backgroundColor: '#FFF',
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  resultCoords: { fontSize: 20, color: '#1E293B', fontWeight: '600' },
});
