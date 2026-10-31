# Lab UI

Shared, scoped controls and Canvas lifecycle for Kiochan Lab packages. No Next.js or shadcn dependency. Colors come from packages/theme semantic tokens.

useCanvas owns one animation loop, bounds frame deltas, skips hidden-document updates, observes theme changes, and cancels its loop and observer on unmount. The caller owns simulation state and whether it is running. Canvas dimensions define logical coordinates; pointerPosition maps displayed pointer coordinates to that logical space.

Do not add project engines or global styles here. Individual projects remain separate packages.
