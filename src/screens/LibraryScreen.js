import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, TextInput, Modal, Pressable, RefreshControl, Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { FileText, Search, Share2, Trash2, Edit3, MoreVertical, FolderOpen } from 'lucide-react-native';
import { C, R, S } from '../constants/theme';
import { Empty, Confirm, Divider } from '../components/UI';
import { getDocs, deleteDoc, renameDoc } from '../utils/storage';

export default function LibraryScreen() {
  const nav = useNavigation();
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [menuDoc, setMenuDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [renamingDoc, setRenamingDoc] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  const load = useCallback(async () => {
    setDocs(await getDocs());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = query.trim()
    ? docs.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
    : docs;

  async function share(doc) {
    setMenuDoc(null);
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(doc.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      } else {
        Alert.alert('Not available', 'Sharing is not supported on this device.');
      }
    } catch (e) { Alert.alert('Error', e.message); }
  }

  async function confirmDelete() {
    try { await deleteDoc(deletingDoc.id); } catch {}
    setDeletingDoc(null);
    load();
  }

  async function confirmRename() {
    if (renameVal.trim()) {
      await renameDoc(renamingDoc.id, renameVal.trim());
      setRenamingDoc(null);
      load();
    }
  }

  const renderDoc = ({ item }) => {
    const date = new Date(item.createdAt);
    const typeColor = item.type === 'photo' ? C.amber : item.type === 'imported' ? C.blue : C.accent;
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => nav.navigate('Viewer', { doc: item })}
        activeOpacity={0.75}
      >
        <View style={[styles.rowIcon, { backgroundColor: typeColor + '1A', borderColor: typeColor + '33' }]}>
          <FileText size={22} color={typeColor} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rowMeta}>
            {item.pages} pg · {date.toLocaleDateString()} · {item.quality || 'medium'}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuDoc(item)}>
          <MoreVertical size={18} color={C.t3} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.count}>{docs.length} document{docs.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={15} color={C.t3} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search…"
          placeholderTextColor={C.t3}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        renderItem={renderDoc}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <Divider indent={S.md + 48 + S.md} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor={C.accent}
          />
        }
        ListEmptyComponent={
          <Empty
            icon={<FolderOpen size={30} color={C.t3} />}
            title="No documents yet"
            sub="Use the scan button or Tools to create your first PDF."
          />
        }
      />

      {/* Action Menu */}
      <Modal visible={!!menuDoc} transparent animationType="slide">
        <Pressable style={styles.sheetBg} onPress={() => setMenuDoc(null)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetName} numberOfLines={1}>{menuDoc?.name}</Text>
            {[
              { icon: <Share2 size={18} color={C.accent} />, label: 'Share', onPress: () => share(menuDoc) },
              { icon: <Edit3 size={18} color={C.amber} />, label: 'Rename', onPress: () => { setRenameVal(menuDoc.name); setRenamingDoc(menuDoc); setMenuDoc(null); } },
              { icon: <Trash2 size={18} color={C.red} />, label: 'Delete', onPress: () => { setDeletingDoc(menuDoc); setMenuDoc(null); }, danger: true },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.sheetRow} onPress={a.onPress}>
                {a.icon}
                <Text style={[styles.sheetLabel, a.danger && { color: C.red }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setMenuDoc(null)}>
              <Text style={styles.sheetCancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Confirm
        visible={!!deletingDoc}
        title="Delete Document"
        message={`"${deletingDoc?.name}" will be permanently deleted.`}
        onOk={confirmDelete}
        onCancel={() => setDeletingDoc(null)}
        danger
      />

      {/* Rename Modal */}
      <Modal visible={!!renamingDoc} transparent animationType="fade">
        <Pressable style={styles.renameBg} onPress={() => setRenamingDoc(null)}>
          <Pressable style={styles.renameBox}>
            <Text style={styles.renameTitle}>Rename</Text>
            <TextInput
              style={styles.renameInput}
              value={renameVal}
              onChangeText={setRenameVal}
              autoFocus
              maxLength={80}
              placeholderTextColor={C.t3}
              selectionColor={C.accent}
            />
            <View style={styles.renameRow}>
              <TouchableOpacity style={styles.renameCancel} onPress={() => setRenamingDoc(null)}>
                <Text style={styles.renameCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.renameOk} onPress={confirmRename}>
                <Text style={styles.renameOkTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: S.md, paddingTop: Platform.OS === 'ios' ? 58 : 38, paddingBottom: S.xs },
  title: { fontSize: 28, fontWeight: '800', color: C.t1, letterSpacing: -0.5 },
  count: { fontSize: 13, color: C.t3, marginTop: 2 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: C.card, borderRadius: R.md, margin: S.md,
    paddingHorizontal: S.md, paddingVertical: 10,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, color: C.t1, fontSize: 15 },

  list: { paddingBottom: 110 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: S.md, paddingVertical: 14, gap: S.md,
  },
  rowIcon: {
    width: 48, height: 48, borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  rowText: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: C.t1, marginBottom: 3 },
  rowMeta: { fontSize: 12, color: C.t3 },
  moreBtn: { padding: S.xs },

  sheetBg: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.elevated, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl,
    paddingHorizontal: S.md, paddingBottom: Platform.OS === 'ios' ? 40 : S.lg,
    borderTopWidth: 1, borderColor: C.border,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginVertical: S.sm },
  sheetName: { fontSize: 14, fontWeight: '600', color: C.t2, marginBottom: S.sm, textAlign: 'center' },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: C.border,
  },
  sheetLabel: { fontSize: 15, color: C.t1, fontWeight: '500' },
  sheetCancel: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border, marginTop: S.xs },
  sheetCancelTxt: { color: C.t2, fontWeight: '600', fontSize: 15 },

  renameBg: { flex: 1, backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center' },
  renameBox: {
    backgroundColor: C.elevated, borderRadius: R.xl, padding: S.lg,
    width: '84%', borderWidth: 1, borderColor: C.border, gap: S.md,
  },
  renameTitle: { fontSize: 17, fontWeight: '700', color: C.t1 },
  renameInput: {
    backgroundColor: C.card, borderRadius: R.md, borderWidth: 1,
    borderColor: C.border, color: C.t1, fontSize: 15,
    paddingHorizontal: S.md, paddingVertical: 12,
  },
  renameRow: { flexDirection: 'row', gap: S.sm },
  renameCancel: { flex: 1, paddingVertical: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  renameCancelTxt: { color: C.t2, fontWeight: '600', fontSize: 15 },
  renameOk: { flex: 1, paddingVertical: 12, borderRadius: R.md, backgroundColor: C.accent, alignItems: 'center' },
  renameOkTxt: { color: C.bg, fontWeight: '700', fontSize: 15 },
});
