import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Modal, Pressable, TextInput,
} from 'react-native';
import { C, R, S, shadow } from '../constants/theme';

// ── Btn ──────────────────────────────────────────────────────────────────────
export function Btn({ label, onPress, variant = 'fill', icon, loading, disabled, style }) {
  const filled   = variant === 'fill';
  const outline  = variant === 'outline';
  const ghost    = variant === 'ghost';
  const danger   = variant === 'danger';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.btn,
        filled  && styles.btnFill,
        outline && styles.btnOutline,
        ghost   && styles.btnGhost,
        danger  && styles.btnDanger,
        (disabled || loading) && { opacity: 0.4 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={filled || danger ? C.bg : C.accent} size="small" />
        : <View style={styles.btnRow}>
            {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
            <Text style={[
              styles.btnLabel,
              outline && { color: C.accent },
              ghost   && { color: C.accent, fontSize: 14 },
              danger  && { color: C.white },
            ]}>
              {label}
            </Text>
          </View>
      }
    </TouchableOpacity>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.78}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Empty ─────────────────────────────────────────────────────────────────────
export function Empty({ icon, title, sub, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {sub && <Text style={styles.emptySub}>{sub}</Text>}
      {onAction && (
        <TouchableOpacity style={styles.emptyBtn} onPress={onAction}>
          <Text style={styles.emptyBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Confirm ───────────────────────────────────────────────────────────────────
export function Confirm({ visible, title, message, onOk, onCancel, danger }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalBg} onPress={onCancel}>
        <Pressable style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMsg}>{message}</Text>
          <View style={styles.modalRow}>
            <TouchableOpacity style={styles.modalCancel} onPress={onCancel}>
              <Text style={styles.modalCancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOk, danger && { backgroundColor: C.red }]}
              onPress={onOk}
            >
              <Text style={styles.modalOkTxt}>{danger ? 'Delete' : 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Spinner Overlay ───────────────────────────────────────────────────────────
export function Spinner({ visible, label }) {
  if (!visible) return null;
  return (
    <View style={styles.spinner}>
      <View style={styles.spinnerBox}>
        <ActivityIndicator color={C.accent} size="large" />
        {label ? <Text style={styles.spinnerLabel}>{label}</Text> : null}
      </View>
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ indent = 0 }) {
  return <View style={[styles.divider, { marginLeft: indent }]} />;
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: R.md, paddingVertical: 14, paddingHorizontal: S.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  btnFill:    { backgroundColor: C.accent, ...shadow },
  btnOutline: { borderWidth: 1.5, borderColor: C.accent },
  btnGhost:   { paddingVertical: 8, paddingHorizontal: S.sm },
  btnDanger:  { backgroundColor: C.red },
  btnRow:     { flexDirection: 'row', alignItems: 'center' },
  btnLabel:   { color: C.bg, fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  card: {
    backgroundColor: C.card, borderRadius: R.lg,
    padding: S.md, borderWidth: 1, borderColor: C.border,
  },

  empty: { alignItems: 'center', paddingVertical: S.xxl, paddingHorizontal: S.xl },
  emptyIcon: {
    width: 72, height: 72, borderRadius: R.xl,
    backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center',
    marginBottom: S.lg, borderWidth: 1, borderColor: C.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.t1, marginBottom: S.xs, textAlign: 'center' },
  emptySub:   { fontSize: 14, color: C.t2, textAlign: 'center', lineHeight: 20, marginBottom: S.lg },
  emptyBtn:   { backgroundColor: C.accentBg, borderRadius: R.pill, paddingHorizontal: S.lg, paddingVertical: 10, borderWidth: 1, borderColor: C.accent + '44' },
  emptyBtnText: { color: C.accent, fontWeight: '700', fontSize: 14 },

  modalBg:  { flex: 1, backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: C.elevated, borderRadius: R.xl, padding: S.lg, width: '82%', borderWidth: 1, borderColor: C.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.t1, marginBottom: S.xs },
  modalMsg:   { fontSize: 14, color: C.t2, lineHeight: 20, marginBottom: S.lg },
  modalRow:   { flexDirection: 'row', gap: S.sm },
  modalCancel:{ flex:1, paddingVertical:12, borderRadius:R.md, borderWidth:1, borderColor:C.border, alignItems:'center' },
  modalCancelTxt: { color: C.t2, fontWeight: '600', fontSize: 15 },
  modalOk:    { flex:1, paddingVertical:12, borderRadius:R.md, backgroundColor:C.accent, alignItems:'center' },
  modalOkTxt: { color: C.bg, fontWeight: '700', fontSize: 15 },

  spinner:    { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlay, alignItems:'center', justifyContent:'center', zIndex:999 },
  spinnerBox: { backgroundColor: C.elevated, borderRadius: R.xl, padding: S.xl, alignItems:'center', gap: S.md, minWidth: 140, borderWidth:1, borderColor:C.border },
  spinnerLabel: { color: C.t2, fontSize: 14, marginTop: S.xs },

  divider: { height: 1, backgroundColor: C.border },
});
