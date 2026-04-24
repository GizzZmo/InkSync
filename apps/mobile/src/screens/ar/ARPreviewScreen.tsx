import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// AR camera screen – scaffolded for ARKit/ARCore integration
// Full AR integration requires @viro-community/react-viro or expo-camera native modules

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { designUrl?: string } };
};

export default function ARPreviewScreen({ navigation, route }: Props) {
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const [overlaySize, setOverlaySize] = useState(150);
  const designUrl = route.params?.designUrl;

  return (
    <View style={styles.container}>
      {/* AR Camera placeholder */}
      <View style={styles.cameraView}>
        <Text style={styles.cameraPlaceholder}>📷 Camera View</Text>
        <Text style={styles.cameraHint}>(AR preview requires device camera)</Text>

        {designUrl && (
          <Image
            source={{ uri: designUrl }}
            style={[styles.overlayImage, { width: overlaySize, height: overlaySize, opacity: overlayOpacity }]}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.controlLabel}>Opacity: {Math.round(overlayOpacity * 100)}%</Text>
        <View style={styles.sliderRow}>
          <TouchableOpacity style={styles.btn} onPress={() => setOverlayOpacity(Math.max(0.1, overlayOpacity - 0.1))}>
            <Text style={styles.btnText}>−</Text>
          </TouchableOpacity>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${overlayOpacity * 100}%` }]} />
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => setOverlayOpacity(Math.min(1, overlayOpacity + 0.1))}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.controlLabel}>Size: {overlaySize}px</Text>
        <View style={styles.sliderRow}>
          <TouchableOpacity style={styles.btn} onPress={() => setOverlaySize(Math.max(50, overlaySize - 20))}>
            <Text style={styles.btnText}>−</Text>
          </TouchableOpacity>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${((overlaySize - 50) / 250) * 100}%` }]} />
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => setOverlaySize(Math.min(300, overlaySize + 20))}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('Saved!', 'AR preview saved to your gallery')}>
          <Text style={styles.saveBtnText}>Save Preview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraView: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  cameraPlaceholder: { color: '#fff', fontSize: 48, marginBottom: 8 },
  cameraHint: { color: '#888', fontSize: 12 },
  overlayImage: { position: 'absolute', borderRadius: 8 },
  controls: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  controlLabel: { fontWeight: '600', marginBottom: 8, color: '#333' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  btn: { width: 36, height: 36, backgroundColor: '#6366f1', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sliderTrack: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, marginHorizontal: 12, overflow: 'hidden' },
  sliderFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 4 },
  saveBtn: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
