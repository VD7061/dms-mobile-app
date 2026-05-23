import { StyleSheet, Text, View } from 'react-native';
import { Fonts } from '@/constants/fonts';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dealer Management</Text>
      <Text style={styles.subtitle}>Poppins is working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    marginTop: 8,
    color: '#666',
  },
});
