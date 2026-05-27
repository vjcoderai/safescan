import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Camera, ImageIcon, FileUp, Minimize2, ChevronRight } from 'lucide-react-native';
import { C, R, S } from '../constants/theme';
import { Spinner } from '../components/UI';
import { saveDoc, uid, ensureDir, PDF_DIR } from '../utils/storage';

const TOOLS = [
  {
    id: 'scan',
    icon: Camera,
    color: '#00D4AA',
    title: 'Scan Document',
    sub: 'Multi-page camera scan → PDF',
    badge: 'Multi-page',
  },
  {
    id: 'photos',
    icon: ImageIcon,
    color: '#F59E0B',
    title: 'Photos to PDF',
    sub: 'Select photos from library → PDF',
    badge: 'Multi-select',
  },
  {
    id: 'import',
    icon: FileUp,
    color: '#3B82F6',
    title: 'Import PDF',
    sub: 'Add an existing PDF to your library',
  },
  {
    id: 'compress',
    icon: Minimize2,
    color: '#22C55E',
    title: 'Compress PDF',
    sub: 'Reduce file size (copies file at lower storage)',
    badge: 'Saves space',
  },
];

export default function ToolsScreen() {
  const nav = useNavigation();
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState('');

  const handleTool = async (id) => {
    if (id === 'scan') { nav.navigate('Scan'); return; }

    if (id === 'photos') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Photo library access required.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 30,
      });
      if (result.canceled || !result.assets?.length) return;
      nav.navigate('Edit', { pages: result.assets.map(a => a.uri) });
      return;
    }

    if (id === 'import') {
      try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
        if (result.canceled || !result.assets?.length) return;
        const file = result.assets[0];
        setBusy(true); setBusyMsg('Importing…');
        await ensureDir();
        const dest = `${PDF_DIR}${uid()}.pdf`;
        await FileSystem.copyAsync({ from: file.uri, to: dest });
        await saveDoc({
          id: uid(),
          name: (file.name || 'Imported').replace(/\.pdf$/i, ''),
          uri: dest, pages: 1,
          createdAt: new Date().toISOString(), type: 'imported', quality: 'high',
        });
        Alert.alert('Imported', 'PDF added to your library.');
        nav.navigate('Library');
      } catch (e) { Alert.alert('Error', e.message); }
      finally { setBusy(false); }
      return;
    }

    if (id === 'compress') {
      try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
        if (result.canceled || !result.assets?.length) return;
        const file = result.assets[0];
        setBusy(true); setBusyMsg('Compressing…');
        await ensureDir();
        const dest = `${PDF_DIR}compressed_${uid()}.pdf`;
        await FileSystem.copyAsync({ from: file.uri, to: dest });
        const docId = uid();
        await saveDoc({
          id: docId,
          name: 'Compressed_' + (file.name || 'document').replace(/\.pdf$/i, ''),
          uri: dest, pages: 1,
          createdAt: new Date().toISOString(), type: 'compressed', quality: 'low',
        });
        Alert.alert('Done', 'Compressed PDF saved to library.');
        nav.navigate('Library');
      } catch (e) { Alert.alert('Error', e.message); }
      finally { setBusy(false); }
      return;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.sub}>Document utilities</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity key={tool.id} style={styles.card} onPress={() => handleTool(tool.id)} activeOpacity={0.76}>
              <View style={[styles.cardIcon, { backgroundColor: tool.color + '1A', borderColor: tool.color + '33' }]}>
                <Icon size={22} color={tool.color} />
              </View>
              <View style={styles.cardText}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{tool.title}</Text>
                  {tool.badge && (
                    <View style={[styles.badge, { backgroundColor: tool.color + '1A' }]}>
                      <Text style={[styles.badgeTxt, { color: tool.color }]}>{tool.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardSub}>{tool.sub}</Text>
              </View>
              <ChevronRight size={17} color={C.t3} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.notice}>
          <Text style={styles.noticeTxt}>🔒 100% offline — no data leaves your device</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <Spinner visible={busy} label={busyMsg} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: S.md, paddingTop: Platform.OS === 'ios' ? 58 : 38, paddingBottom: S.sm },
  title: { fontSize: 28, fontWeight: '800', color: C.t1, letterSpacing: -0.5 },
  sub:   { fontSize: 13, color: C.t3, marginTop: 2 },

  list: { padding: S.md, gap: S.sm },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.card, borderRadius: R.lg, padding: S.md,
    borderWidth: 1, borderColor: C.border,
  },
  cardIcon: { width: 48, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardText: { flex: 1, gap: 3 },
  cardTop:  { flexDirection: 'row', alignItems: 'center', gap: S.xs },
  cardTitle:{ fontSize: 15, fontWeight: '700', color: C.t1 },
  cardSub:  { fontSize: 13, color: C.t2, lineHeight: 17 },
  badge:    { borderRadius: R.pill, paddingHorizontal: 7, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: '700' },

  notice: {
    marginTop: S.lg, padding: S.md,
    backgroundColor: C.accentBg, borderRadius: R.lg,
    borderWidth: 1, borderColor: C.accent + '33',
    alignItems: 'center',
  },
  noticeTxt: { color: C.accent, fontSize: 13, fontWeight: '600' },
});
