# Permissions

All role access rules live in `permissions.ts`.

Use permission keys in screens and components instead of checking role strings
directly.

```ts
import { useCan } from '@/hooks/useCan';

const canCreateVehicle = useCan('vehicles.create');
```

When backend adds a new role, add it to `ROLES` and update the permission list.
