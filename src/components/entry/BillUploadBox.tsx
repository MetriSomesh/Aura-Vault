import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, FolderOpen, Receipt, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface BillUploadBoxProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
}

export function BillUploadBox({ imageUri, onImageSelected }: BillUploadBoxProps) {
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch {}
  };

  const handleBrowseFiles = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      {/* Header Row with (Optional) tag */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>BILL / RECEIPT PHOTO</Text>
        <View style={styles.optionalBadge}>
          <Text style={styles.optionalText}>Optional</Text>
        </View>
      </View>

      {/* Main Upload Dropzone / Preview */}
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              Invoice Photo Attached
            </Text>
            <Text style={styles.previewSubtext}>Tap (X) to remove or re-upload</Text>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onImageSelected(null)}
            activeOpacity={0.7}
          >
            <X size={16} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.dropzone}>
          <View style={styles.iconCircle}>
            <Receipt size={20} color={colors.gold.primary} />
          </View>

          <Text style={styles.promptTitle}>
            Attach jeweler invoice or BIS certificate
          </Text>
          <Text style={styles.promptSubtitle}>
            Supports JPG, PNG, PDF up to 10MB • Optional
          </Text>

          {/* Dual Action Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <Camera size={14} color={colors.text.secondary} />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBrowseFiles}
              activeOpacity={0.7}
            >
              <FolderOpen size={14} color={colors.text.secondary} />
              <Text style={styles.actionButtonText}>Browse Files</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  headerLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  optionalBadge: {
    backgroundColor: colors.border.subtle,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  optionalText: {
    color: colors.text.tertiary,
    fontSize: 9,
    fontWeight: '600',
  },
  dropzone: {
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: colors.border.interactive,
    backgroundColor: colors.input,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold.muted,
    borderWidth: 1,
    borderColor: colors.gold.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  promptTitle: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  promptSubtitle: {
    color: colors.text.tertiary,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  actionButtonText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // Preview
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.interactive,
    padding: 10,
    gap: 12,
  },
  previewImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.canvas,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  previewSubtext: {
    color: colors.text.tertiary,
    fontSize: 10,
    marginTop: 2,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
