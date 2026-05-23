import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      iconColor={{
        default: colors['primary'],
        selected: colors['primary'],
      }}
      labelStyle={{
        default: { color: colors['primary'] },
        selected: { color: colors['primary'] },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inventory">
        <NativeTabs.Trigger.Label>Inventory</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'car', selected: 'car.fill' }}
          md="directions_car"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="customers">
        <NativeTabs.Trigger.Label>Customers</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          md="group"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
