import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, TextInput, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
import { ChevronLeft, RotateCw, FileText } from 'lucide-react-native';
import { C, R, S, shadow } from '../constants/theme';
import { Btn, Card, Spinner } from '../components/UI';
import { buildPdf, QUALITY } from '../utils/pdf';
import { saveDoc, uid } from '../utils/storage';

const FILTERS = [
  { id: 'none',      label: 'Original' },
  { id: 'grayscale', label: 'B & W' },
  { id: 'enhance',   label: 'Enhance' },
];

export default function EditScreen() {
  const nav = useNavigation();
  const { params } = useRoute();
  const [images, setImages] = useState(params?.pages ?? []);
  const [name, setName] = useState(`Scan ${new Date().toLocaleDateString()}`);
  const [filter, setFilter] = useState('none');
  const [quality, setQuality] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState('');

  const rotate = useCallback(async (idx) => {
    try {
      const r = await ImageManipulator.manipulateAsync(
        images[idx], [{ rotate: 90 }],
        { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImages(prev => { const n = [...prev]; n[idx] = r.uri; return n; });
    } catch (e) { Alert.alert('Error', e.message); }
  }, [images]);

  const save = useCallback(async () => {
    if (!images.length) { Alert.alert('No pages', 'Nothing to save.'); return; }
    setBusy(true); setBusyMsg('Building PDF…');
    try {
      const uri = await buildPdf({ images, name: name.trim() || 'Untitled', filter, quality });
      setBusyMsg('Saving…');
      await saveDoc({ id: uid(), name: name.trim() || 'Untitled', uri, pages: images.length, createdAt: new Date().toISOString(), type: 'scan', filter, quality });
      nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e) {
      Alert.alert('Failed', e.message);
    } finally { setBusy(false); }
  }, [images, name, filter, quality, nav]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => nav.goBack()}>
          <ChevronLeft size={22} color={C.t1} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Edit & Save</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnTxt}>Save PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Page carousel */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {images.map((uri, i) => (
            <View key={i} style={styles.pageCard}>
              <Image source={{ uri }} style={styles.pageImg} resizeMode="contain" />
              {filter === 'grayscale' && <View style={styles.bwLayer} pointerEvents="none" />}
              <TouchableOpacity style={styles.rotateBtn} onPress={() => rotate(i)}>
                <RotateCw size={15} color={C.t1} />
              </TouchableOpacity>
              <View style={styles.pageNum}><Text style={styles.pageNumTxt}>{i + 1}/{images.length}</Text></View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.form}>
          {/* Name */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Document Name</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter name…"
              placeholderTextColor={C.t3}
              maxLength={80}
              selectionColor={C.accent}
            />
          </Card>

          {/* Filter */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Filter</Text>
            <View style={styles.row}>
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, filter === f.id && styles.chipActive]}
                  onPress={() => setFilter(f.id)}
                >
                  <Text style={[styles.chipTxt, filter === f.id && styles.chipTxtActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Quality */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Quality</Text>
            {Object.entries(QUALITY).map(([k, v]) => (
              <TouchableOpacity
                key={k}
                style={[styles.qualRow, quality === k && styles.qualRowActive]}
                onPress={() => setQuality(k)}
              >
                <View style={[styles.radio, quality === k && styles.radioActive]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.qualName, quality === k && { color: C.accent }]}>{v.label}</Text>
                  <Text style={styles.qualDesc}>{v.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Summary */}
          <View style={styles.summary}>
            <FileText size={14} color={C.t3} />
            <Text style={styles.summaryTxt}>
              {images.length} page{images.length !== 1 ? 's' : ''} · {QUALITY[quality].label}
            </Text>
          </View>

          <Btn label="Save as PDF" onPress={save} loading={busy} style={{ marginTop: S.sm }} />
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>

      <Spinner visible={busy} label={busyMsg} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingTop: Platform.OS === 'ios' ? 58 : 38,
    paddingBottom: S.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  iconBtn: { width: 38, height: 38, borderRadius: R.pill, backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' },
  headerTxt: { fontSize: 17, fontWeight: '700', color: C.t1 },
  saveBtn: { backgroundColor: C.accent, borderRadius: R.pill, paddingHorizontal: S.md, paddingVertical: 8 },
  saveBtnTxt: { color: C.bg, fontWeight: '700', fontSize: 14 },

  carousel: { paddingHorizontal: S.md, paddingVertical: S.lg, gap: S.sm },
  pageCard: {
    width: 190, height: 250, borderRadius: R.lg, overflow: 'hidden',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, position: 'relative',
  },
  pageImg: { width: '100%', height: '100%' },
  bwLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0)', opacity: 0 },
  rotateBtn: {
    position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: R.pill,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  pageNum: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 2 },
  pageNumTxt: { color: C.white, fontSize: 11, fontWeight: '700' },

  form: { padding: S.md, gap: S.md },
  section: { gap: S.sm },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.t3, letterSpacing: 1, textTransform: 'uppercase' },

  nameInput: {
    backgroundColor: C.elevated, borderRadius: R.md, borderWidth: 1,
    borderColor: C.border, color: C.t1, fontSize: 15,
    paddingHorizontal: S.md, paddingVertical: 11,
  },

  row: { flexDirection: 'row', gap: S.sm },
  chip: {
    flex: 1, paddingVertical: 10, borderRadius: R.md, borderWidth: 1,
    borderColor: C.border, alignItems: 'center', backgroundColor: C.elevated,
  },
  chipActive: { borderColor: C.accent, backgroundColor: C.accentBg },
  chipTxt: { color: C.t2, fontSize: 13, fontWeight: '600' },
  chipTxtActive: { color: C.accent },

  qualRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: S.sm, borderRadius: R.md, gap: S.sm },
  qualRowActive: { backgroundColor: C.accentBg },
  radio: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.t3 },
  radioActive: { borderColor: C.accent, backgroundColor: C.accent },
  qualName: { fontSize: 14, color: C.t1, fontWeight: '600' },
  qualDesc: { fontSize: 12, color: C.t3, marginTop: 1 },

  summary: { flexDirection: 'row', alignItems: 'center', gap: S.xs, justifyContent: 'center', paddingVertical: S.xs },
  summaryTxt: { fontSize: 13, color: C.t3 },
});
