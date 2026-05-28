// App.js — Étape 1 : position GPS
import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, StyleSheet
} from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [adresse, setAdresse] = useState(null);

  const obtenirPosition = async () => {
    setLoading(true);
    setErreur(null);
    setPosition(null);

    // 1. Demander la permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErreur('Permission de localisation refusée.');
      setLoading(false);
      return;
    }

    try {
      // 2. Obtenir la position
      // accuracy : Balanced = bon compromis vitesse/précision
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPosition(pos);

      // 3. Geocoding inverse
      await geocoderInverse(pos.coords.latitude, pos.coords.longitude);

    } catch (e) {
      setErreur('Impossible d\'obtenir la position : ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const geocoderInverse = async (latitude, longitude) => {
    try {
      // reverseGeocodeAsync retourne un tableau — on prend le premier résultat
      const resultats = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (resultats.length > 0) {
        const r = resultats[0];
        // Construire une adresse lisible à partir des champs retournés
        setAdresse({
          rue: r.street ?? '',
          numero: r.streetNumber ?? '',
          ville: r.city ?? r.subregion ?? '',
          codePostal: r.postalCode ?? '',
          pays: r.country ?? '',
          region: r.region ?? '',
        });
      }
    } catch (e) {
      console.error('Géocodage inverse échoué :', e.message);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Ma Position</Text>

      <TouchableOpacity style={styles.btn} onPress={obtenirPosition}
        disabled={loading}>
        <Text style={styles.btnTxt}>
          {loading ? 'Localisation...' : 'Obtenir ma position'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#23B2A4"
        style={{ marginTop: 24 }} />}

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}

      {position && (
        <View style={styles.card}>
          <Ligne label="Latitude" val={position.coords.latitude.toFixed(6) + '°'} />
          <Ligne label="Longitude" val={position.coords.longitude.toFixed(6) + '°'} />
          <Ligne label="Altitude"
            val={position.coords.altitude
              ? position.coords.altitude.toFixed(1) + ' m'
              : 'Non disponible'} />
          <Ligne label="Précision" val={position.coords.accuracy.toFixed(0) + ' m'} />
        </View>
      )}

      {adresse && (
        <View style={styles.card}>
          <Text style={styles.adresseTitre}>Adresse par Géocodage inverse</Text>
          <Text style={styles.adresseTexte}>
            {adresse.numero} {adresse.rue}
          </Text>
          <Text style={styles.adresseTexte}>
            {adresse.codePostal} {adresse.ville}
          </Text>
          <Text style={styles.adresseTexte}>
            {adresse.region}, {adresse.pays}
          </Text>
        </View>
      )}

    </View>
  );
}

function Ligne({ label, val }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.val}>{val}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 24, backgroundColor: '#F8FAFC'
  },
  titre: {
    fontSize: 28, fontWeight: 'bold', marginBottom: 24,
    color: '#1E293B'
  },
  btn: {
    backgroundColor: '#20232A', padding: 16,
    borderRadius: 12, width: '100%', alignItems: 'center'
  },
  btnTxt: { color: '#23B2A4', fontWeight: 'bold', fontSize: 16 },
  erreur: { color: '#DC2626', marginTop: 16, textAlign: 'center' },
  card: {
    width: '100%', marginTop: 20, backgroundColor: '#FFF',
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  ligne: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  label: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  val: { fontSize: 14, color: '#1E293B', fontWeight: 'bold' },
  adresseTitre: {
    fontSize: 20, fontWeight: 'bold', color: '#1E293B',
    marginBottom: 10
  },
  adresseTexte: {
    fontSize: 24, color: '#475569', paddingVertical: 3
  },
});
