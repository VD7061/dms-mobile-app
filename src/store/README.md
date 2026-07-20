# Store Layer

Use `sessionStore` for the real app session.

## `sessionStore`

Owns:

- onboarding state
- auth step: `phone`, `otp`, `profile`
- access and refresh tokens
- current profile name and phone number
- all showroom-role pairs from `GET /user/me`
- active showroom and active role

Components should not decide role manually. Use hooks:

```ts
import { useActiveRole } from '@/hooks/useActiveRole';
import { useActiveShowroom } from '@/hooks/useActiveShowroom';
import { useCan } from '@/hooks/useCan';

const role = useActiveRole();
const showroom = useActiveShowroom();
const canCreateVehicle = useCan('vehicles.create');
```

## Flow

```text
sendOtp/login/register
  -> verifyOtp
  -> save tokens
  -> getProfile
  -> save showroom_roles
  -> use active showroom role everywhere
```

Keep `authStore` only for old code until everything is migrated.
