import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

export default function ExerciseCameraView({ onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [facing, setFacing] = useState('front');
  const cameraRef = useRef(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.permissionText}>Camera access denied</Text>
        <Text style={styles.permissionSubtext}>Enable camera in your device settings to use this feature.</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.overlayTitle}>Form Check</Text>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
            >
              <Ionicons name="camera-reverse-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.poseGuide}>
            <View style={styles.guideCornerTL} />
            <View style={styles.guideCornerTR} />
            <View style={styles.guideCornerBL} />
            <View style={styles.guideCornerBR} />
          </View>

          <View style={styles.bottomBar}>
            <Text style={styles.formTip}>Position yourself so your full body is visible</Text>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseGuide: {
    width: 200,
    height: 320,
    alignSelf: 'center',
    position: 'relative',
  },
  guideCornerTL: { position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.primary },
  guideCornerTR: { position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.primary },
  guideCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.primary },
  guideCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.primary },
  bottomBar: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  formTip: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  permissionText: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionSubtext: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
