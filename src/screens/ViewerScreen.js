import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { ChevronLeft, Share2, Printer, FileText, Calendar, Layers, Star } from 'lucide-react-native';
import { C, R, S, shadow, shadowAccent } from '../constants/theme';

export default function ViewerScreen() {
  const nav = useNavigation();
  const { params } = useRoute();
  const doc = params?.doc;

  const share = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(doc.uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: doc.name,
        });
      } else {
        Alert.alert('Not available', 'Sharing is not supported on this device.');
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const print = async () => {
    try { await Print.printAsync({ uri: doc.uri }); }
    catch (e) { Alert.alert('Print failed', e.message); }
  };

  if (!doc) {
    return (
      <View style={styles.center}>
        <FileText size={44} color={C.t3} />
        <Text style={styles.errTxt}>Document not found</Text>
      </View>
    );
  }

  const date = new Date(doc.createdAt);
  const typeLabel = doc.type === 'photo' ? 'Photo PDF' : doc.type === 'imported' ? 'Imported' : doc.type === 'compressed' ? 'Compressed' : 'Scanned';
  const typeColor = doc.type === 'photo' ? C.amber : doc.type === 'imported' ? C.blue : C.accent;

  const meta = [
    { icon: <Layers size={15} color={C.t3} />, label: 'Pages', value: String(doc.pages) },
    { icon: <Calendar size={15} color={C.t3} />, label: 'Date', value: date.toLocaleDateString() },
    { icon: <Star size={15} color={C.t3} />, label: 'Quality', value: doc.quality || 'medium' },
  ];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => nav.goBack()}>
          <ChevronLeft size={22} color={C.t1} />
        </TouchableOpacity>
        <Text style={styles.headerTxt} numberOfLines={1}>{doc.name}</Text>
        <TouchableOpacity style={styles.shareIconBtn} onPress={share}>
          <Share2 size={18} color={C.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Document card */}
        <View style={styles.docCard}>
          <View style={[styles.docIconWrap, { backgroundColor: typeColor + '18', borderColor: typeColor + '33' }]}>
            <FileText size={52} color={typeColor} />
          </View>
          <Text style={styles.docName}>{doc.name}</Text>
          <View style={[styles.typePill, { backgroundColor: typeColor + '18' }]}>
            <Text style={[styles.typePillTxt, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>

        {/* Meta rows */}
        <View style={styles.metaCard}>
          {meta.map((m, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.metaDivider} />}
              <View style={styles.metaRow}>
                <View style={styles.metaLeft}>
                  {m.icon}
                  <Text style={styles.metaLabel}>{m.label}</Text>
                </View>
                <Text style={styles.metaValue}>{m.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={share}>
          <Share2 size={18} color={C.bg} />
          <Text style={styles.primaryBtnTxt}>Share / Open In…</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={print}>
          <Printer size={18} color={C.t1} />
          <Text style={styles.secondaryBtnTxt}>Print</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Tap "Share / Open In…" to view in Files, Acrobat, or any PDF app on your device.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: S.sm },
  errTxt: { fontSize: 16, color: C.t2 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingTop: Platform.OS === 'ios' ? 58 : 38,
    paddingBottom: S.md,
    borderBottomWidth: 1, borderBottomColor: C.border, gap: S.sm,
  },
  iconBtn: { width: 38, height: 38, borderRadius: R.pill, backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' },
  shareIconBtn: { width: 38, height: 38, borderRadius: R.pill, backgroundColor: C.accentBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.accent + '33' },
  headerTxt: { flex: 1, fontSize: 15, fontWeight: '700', color: C.t1, textAlign: 'center' },

  content: { padding: S.md, gap: S.md, paddingBottom: 60 },

  docCard: {
    backgroundColor: C.card, borderRadius: R.xl, padding: S.xl,
    alignItems: 'center', gap: S.sm, borderWidth: 1, borderColor: C.border,
  },
  docIconWrap: { width: 96, height: 96, borderRadius: R.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: S.xs },
  docName: { fontSize: 18, fontWeight: '800', color: C.t1, textAlign: 'center', letterSpacing: -0.3 },
  typePill: { borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 4 },
  typePillTxt: { fontSize: 12, fontWeight: '700' },

  metaCard: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: S.md },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  metaLabel: { fontSize: 14, color: C.t2 },
  metaValue: { fontSize: 14, fontWeight: '700', color: C.t1 },
  metaDivider: { height: 1, backgroundColor: C.border, marginLeft: S.md },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: S.sm, backgroundColor: C.accent, borderRadius: R.lg,
    paddingVertical: 15, ...shadowAccent,
  },
  primaryBtnTxt: { color: C.bg, fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: S.sm, backgroundColor: C.elevated, borderRadius: R.lg,
    paddingVertical: 14, borderWidth: 1, borderColor: C.border,
  },
  secondaryBtnTxt: { color: C.t1, fontWeight: '600', fontSize: 15 },

  hint: { fontSize: 12, color: C.t3, textAlign: 'center', lineHeight: 18, marginTop: S.xs },
});
