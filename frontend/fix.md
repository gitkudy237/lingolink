# Fix Report

## 1. Broken Signup Toast import
- File: `app/signup/signup.tsx`
- Issue: `import Toast from "./components/Modal";` points to a non-existent relative path.
- Cause: `app/components/Modal.tsx` is the real location, not `app/signup/components/Modal`.
- Effect: app will crash or fail to bundle when opening the signup screen.
- Fix: change to `import Toast from "../components/Modal";` or move the component into the correct folder.

## 2. Auth flow inconsistency
- Files: `app/signup/signup.tsx`, `app/login.tsx`, `src/services/authService.ts`
- Issue: signup/login screens use local `expo-secure-store` storage, while `src/services/authService.ts` defines remote API calls that are never used.
- Cause: partial implementation of server auth, but UI still treats auth as local.
- Effect: users created locally will not match server data; the `authService` module is misleading and unused; multi-device login and real auth are broken.
- Fix: either fully migrate signup/login to `src/services/authService.ts` and use server tokens, or remove/rename the unused API service if the app should remain local-only.

## 3. Plaintext credential storage
- Files: `app/signup/signup.tsx`, `app/login.tsx`
- Issue: `password` is stored in SecureStore as part of the saved user object.
- Cause: app saves user password directly instead of storing a token or hash.
- Effect: sensitive data is exposed on the device and may be compromised.
- Fix: stop storing raw passwords; use server-issued access tokens or at minimum derive a secure session key.

## 4. API URL hard-coded to local IP
- File: `src/services/authService.ts`
- Issue: `API_BASE_URL` is fixed to `http://192.168.43.142:4000/api/auth`.
- Cause: development-only configuration baked into source.
- Effect: auth requests will fail on other networks and environments.
- Fix: use environment variables or app config for the base URL.

## 5. Credential shape mismatch
- Files: `app/login.tsx`, `src/services/authService.ts`
- Issue: login screen authenticates against phone/password, while `authService.login()` expects email/password.
- Cause: inconsistent field expectations between local login UI and API client.
- Effect: migrating to server auth will fail unless the payload is realigned.
- Fix: unify the login form and service API contract around either phone or email.

## 6. Duplicate validation and constants
- Files: `app/login.tsx`, `app/signup/signup.tsx`
- Issue: same validation logic and country/language lists are duplicated in multiple screens.
- Cause: duplication across components.
- Effect: harder maintenance and risk of inconsistent behavior.
- Fix: centralize validation utilities and shared constants in `src/utils` or `src/constants`.

## Suggested structure improvements
- Introduce an `AuthContext` / provider to centralize auth state and reduce repeated SecureStore usage.
- Use a shared `storage` wrapper for SecureStore keys and typed access.
- Create a shared `api/axios.ts` instance and a config file for `API_BASE_URL`.
- Move repeated UI utilities into shared components and modules.
