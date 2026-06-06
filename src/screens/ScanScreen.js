import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ScrollView, Alert, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { X, Zap, ZapOff, Check, Plus, Trash2, ChevronRight, Camera } from 'lucide-react-native';
import { C, R, S, shadow } from '../constants/theme';
import { Spinner } from '../components/UI';

export default function ScanScreen() {
  const nav = useNavigation();
  const cameraRef = useRef();
  const [permission, requestPermission] = useCameraPermissions();
  const [pages, setPages] = useState([]);
  const [flash, setFlash] = useState('off');
  const [busy, setBusy] = useState(false);
  const [showPages, setShowPages] = useState(false);

  const shoot = useCallback(async () => {
  if (!cameraRef.current || busy) return;
  setBusy(true);
  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.85,
      skipProcessing: true,        // Faster on mobile
    });
    
    if (!photo || !photo.uri) {
      Alert.alert('Capture failed', 'Could not capture image');
      setBusy(false);
      return;
    }

    const processed = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 1400 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
    );

    setPages(p => [...p, { uri: processed.uri, id: String(Date.now()) }]);
  } catch (e) {
    console.error('Capture error:', e);
    Alert.alert('Capture failed', e.message || 'Unknown error');
  } finally {
    setBusy(false);
  }
}, [busy]);
      
      if (!photo || !photo.uri) {
        Alert.alert('Capture failed', 'Could not capture image');
        setBusy(false);
        return;
      }

      const processed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1400 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPages(p => [...p, { uri: processed.uri, id: String(Date.now()) }]);
    } catch (e) {
      console.error('Capture error:', e);
      Alert.alert('Capture failed', e.message || 'Unknown error');
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const goEdit = () => {
    if (!pages.length) { Alert.alert('No pages', 'Take at least one photo first.'); return; }
    nav.navigate('Edit', { pages: pages.map(p => p.uri) });
  };

  // ── Permission gates ───────────────────────────────────────────────────────
  if (!permission) {
    return <View style={styles.center}><Text style={styles.t2}>Checking permission…</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Camera size={44} color={C.t3} style={{ marginBottom: S.md }} />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSub}>SafeScan needs camera access to scan documents.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnTxt}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backBtnTxt}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Pages preview mode ──────────────────────────────────────────────────────
  if (showPages) {
    return (
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowPages(false)}>
            <X size={20} color={C.t1} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{pages.length} Page{pages.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={goEdit}>
            <Text style={styles.nextBtnTxt}>Next</Text>
            <ChevronRight size={15} color={C.bg} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.grid}>
          {pages.map((p, i) => (
            <View key={p.id} style={styles.thumb}>
              <Image source={{ uri: p.uri }} style={styles.thumbImg} />
              <View style={styles.thumbNum}><Text style={styles.thumbNumTxt}>{i + 1}</Text></View>
              <TouchableOpacity
                style={styles.thumbDel}
                onPress={() => setPages(prev => prev.filter(x => x.id !== p.id))}
              >
                <Trash2 size={13} color={C.white} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addThumb} onPress={() => setShowPages(false)}>
            <Plus size={26} color={C.accent} />
            <Text style={styles.addTxt}>Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Camera view ─────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash} autofocus="on">
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => nav.goBack()}>
            <X size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>
            {pages.length > 0 ? `${pages.length} page${pages.length !== 1 ? 's' : ''}` : 'Scan Document'}
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}>
            {flash === 'on' ? <Zap size={20} color={C.amber} /> : <ZapOff size={20} color={C.white} />}
          </TouchableOpacity>
        </View>

        {/* Corner guides */}
        <View style={styles.guide} pointerEvents="none">
          <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
          <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
          <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
          <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {/* Last page thumbnail */}
          {pages.length > 0 ? (
            <TouchableOpacity onPress={() => setShowPages(true)}>
              <View style={styles.miniThumb}>
                <Image source={{ uri: pages[pages.length - 1].uri }} style={styles.miniThumbImg} />
                {pages.length > 1 && (
                  <View style={styles.miniCount}><Text style={styles.miniCountTxt}>{pages.length}</Text></View>
                )}
              </View>
            </TouchableOpacity>
          ) : <View style={{ width: 52 }} />}

          {/* Shutter */}
          <TouchableOpacity
            style={[styles.shutter, busy && { borderColor: C.accent }]}
            onPress={shoot}
            disabled={busy}
          >
            <View style={[styles.shutterInner, busy && { backgroundColor: C.accent }]} />
          </TouchableOpacity>

          {/* Done */}
          {pages.length > 0 ? (
            <TouchableOpacity style={styles.doneBtn} onPress={goEdit}>
              <Check size={20} color={C.white} />
            </TouchableOpacity>
          ) : <View style={{ width: 52 }} />}
        </View>
      </CameraView>

      <Spinner visible={busy} label="Processing…" />
    </View>
  );
}

const CORNER = 22;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  camera: { flex: 1 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: S.xl },
  t2: { color: C.t2 },

  permTitle: { fontSize: 20, fontWeight: '700', color: C.t1, textAlign: 'center', marginBottom: S.sm },
  permSub:   { fontSize: 14, color: C.t2, textAlign: 'center', lineHeight: 20, marginBottom: S.lg },
  permBtn:   { backgroundColor: C.accent, borderRadius: R.pill, paddingHorizontal: S.xl, paddingVertical: 13, marginBottom: S.sm },
  permBtnTxt:{ color: C.bg, fontWeight: '700', fontSize: 15 },
  backBtn:   { paddingVertical: 10 },
  backBtnTxt:{ color: C.t2, fontSize: 14 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingTop: Platform.OS === 'ios' ? 58 : 18,
    paddingBottom: S.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  iconBtn: { width: 38, height: 38, borderRadius: R.pill, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: C.white, fontSize: 15, fontWeight: '600' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accent, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 7 },
  nextBtnTxt: { color: C.bg, fontWeight: '700', fontSize: 14 },

  guide: { position: 'absolute', top: '18%', left: '7%', right: '7%', bottom: '20%' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: C.accent },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.xl, paddingBottom: Platform.OS === 'ios' ? 42 : 24,
    paddingTop: S.md, backgroundColor: 'rgba(0,0,0,0.55)',
  },

  shutter: { width: 70, height: 70, borderRadius: 35, borderWidth: 3.5, borderColor: C.white, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.white },

  miniThumb: { position: 'relative' },
  miniThumbImg: { width: 52, height: 52, borderRadius: R.sm, borderWidth: 2, borderColor: C.accent },
  miniCount: { position: 'absolute', bottom: -5, right: -5, backgroundColor: C.accent, borderRadius: R.pill, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  miniCountTxt: { color: C.bg, fontSize: 11, fontWeight: '800' },

  doneBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', ...shadow },

  // Pages preview
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: S.md, gap: S.sm, paddingBottom: 100 },
  thumb: { width: '30%', aspectRatio: 0.72, position: 'relative' },
  thumbImg: { width: '100%', height: '100%', borderRadius: R.sm, borderWidth: 1, borderColor: C.border },
  thumbNum: { position: 'absolute', top: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: R.pill, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  thumbNumTxt: { color: C.white, fontSize: 11, fontWeight: '800' },
  thumbDel: { position: 'absolute', top: -7, right: -7, backgroundColor: C.red, borderRadius: R.pill, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  addThumb: { width: '30%', aspectRatio: 0.72, borderRadius: R.sm, borderWidth: 2, borderStyle: 'dashed', borderColor: C.accent + '55', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addTxt: { color: C.accent, fontSize: 12, fontWeight: '600' },
});
