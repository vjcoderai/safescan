import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2, Shield, Package, HardDrive, ChevronRight, FileText } from 'lucide-react-native';
import { C, R, S } from '../constants/theme';
import { Confirm, Divider } from '../components/UI';
import { getDocs, clearAllDocs } from '../utils/storage';

function Row({ icon, label, sub, value, onPress, danger }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, danger && { color: C.red }]}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {value !== undefined
        ? <Text style={styles.rowVal}>{value}</Text>
        : onPress ? <ChevronRight size={15} color={C.t3} /> : null}
    </TouchableOpacity>
  );
}

function Section({ label, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const [count, setCount] = useState(0);
  const [clearing, setClearing] = useState(false);

  useFocusEffect(useCallback(() => {
    getDocs().then(d => setCount(d.length));
  }, []));

  const handleClear = async () => {
    await clearAllDocs();
    setCount(0);
    setClearing(false);
    Alert.alert('Done', 'All documents deleted.');
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section label="STORAGE">
          <Row
            icon={<FileText size={17} color={C.accent} />}
            label="Saved Documents"
            value={`${count}`}
          />
          <Divider indent={S.md + 36 + S.md} />
          <Row
            icon={<HardDrive size={17} color={C.blue} />}
            label="Storage Location"
            value="Device"
          />
        </Section>

        <Section label="ABOUT">
          <Row icon={<Package size={17} color={C.amber} />} label="SafeScan" value="v1.0.0" />
          <Divider indent={S.md + 36 + S.md} />
          <Row
            icon={<Shield size={17} color={C.green} />}
            label="Privacy"
            sub="100% offline — no internet required, no data uploaded"
          />
        </Section>

        <Section label="DANGER ZONE">
          <Row
            icon={<Trash2 size={17} color={C.red} />}
            label="Delete All Documents"
            sub="Permanently removes all saved PDFs"
            onPress={() => setClearing(true)}
            danger
          />
        </Section>

        <Text style={styles.footer}>
          SafeScan keeps all PDFs on your device.{'\n'}No account. No cloud. No tracking.
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Confirm
        visible={clearing}
        title="Delete Everything"
        message="All saved PDFs will be permanently deleted. This cannot be undone."
        onOk={handleClear}
        onCancel={() => setClearing(false)}
        danger
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: S.md, paddingTop: Platform.OS === 'ios' ? 58 : 38, paddingBottom: S.sm },
  title: { fontSize: 28, fontWeight: '800', color: C.t1, letterSpacing: -0.5 },

  content: { padding: S.md, gap: S.md },

  section: { gap: S.xs },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.t3, letterSpacing: 1.2, marginLeft: 2 },
  sectionCard: { backgroundColor: C.card, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.border },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: S.md, gap: S.md, minHeight: 52 },
  rowIcon: { width: 34, height: 34, borderRadius: R.sm, backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' },
  rowIconDanger: { backgroundColor: C.red + '18' },
  rowText: { flex: 1, gap: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: C.t1 },
  rowSub: { fontSize: 12, color: C.t3, lineHeight: 16 },
  rowVal: { fontSize: 13, color: C.t2, fontWeight: '500' },

  footer: { fontSize: 12, color: C.t3, textAlign: 'center', lineHeight: 18, marginTop: S.sm },
});
