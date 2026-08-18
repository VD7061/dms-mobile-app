import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheet } from '@/components/ui';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export type VehiclePhoto = {
  uri: string;
  name?: string | null;
  type?: string | null;
};

type VehiclePhotosPickerProps = {
  photos: VehiclePhoto[];
  onChange: (photos: VehiclePhoto[]) => void;
};

export function VehiclePhotosPicker({ photos, onChange }: VehiclePhotosPickerProps) {
  const { colors } = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);

  const addPhoto = (asset: ImagePicker.ImagePickerAsset) => {
    onChange([...photos, { uri: asset.uri, name: asset.fileName, type: asset.mimeType }]);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Please allow camera access to take a vehicle photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });

    if (!result.canceled && result.assets[0]) {
      addPhoto(result.assets[0]);
    }
  };

  const handleChooseFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Please allow photo access to select vehicle photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      result.assets.forEach(addPhoto);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        {photos.map((photo, index) => (
          <View key={`${photo.uri}-${index}`} style={styles.tile}>
            <Image source={{ uri: photo.uri }} style={styles.image} />
            <Pressable
              onPress={() => removePhoto(index)}
              hitSlop={6}
              style={[styles.removeBadge, { backgroundColor: colors.error }]}>
              <Ionicons name="close" size={12} color={colors['on-error']} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => setPickerVisible(true)}
          style={[styles.tile, styles.addTile, { borderColor: colors.primary }]}>
          <Ionicons name="add" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <BottomSheet visible={pickerVisible} onClose={() => setPickerVisible(false)}>
        <Text style={[Typography.title, styles.sheetTitle, { color: colors['on-background'] }]}>
          Add photo
        </Text>

        <View style={styles.sheetOptions}>
          {[
            {
              key: 'camera',
              icon: 'camera-outline' as const,
              label: 'Take photo',
              onPress: handleTakePhoto,
            },
            {
              key: 'library',
              icon: 'images-outline' as const,
              label: 'Choose from library',
              onPress: handleChooseFromLibrary,
            },
          ].map((option) => (
            <Pressable
              key={option.key}
              onPress={() => {
                setPickerVisible(false);
                option.onPress();
              }}
              style={({ pressed }) => [
                styles.sheetOption,
                {
                  backgroundColor: colors['surface-container-low'],
                  borderColor: colors['outline-variant'],
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <View style={[styles.sheetOptionIcon, { backgroundColor: colors['surface-container'] }]}>
                <Ionicons name={option.icon} size={22} color={colors.primary} />
              </View>
              <Text style={[Typography.body, styles.sheetOptionLabel, { color: colors['on-surface'] }]}>
                {option.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors['on-surface-variant']} />
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const TILE_SIZE = 77;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    borderWidth: 1.4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  sheetOptions: {
    gap: 12,
  },
  sheetOption: {
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionLabel: {
    flex: 1,
  },
});
