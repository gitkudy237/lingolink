import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { connectSocket, disconnectSocket } from "../src/services/socket";

function SocketPresenceManager() {
  useEffect(() => {
    let mounted = true;

    const syncSocketWithAppState = async (state: AppStateStatus) => {
      if (state === "active") {
        try {
          await connectSocket();
        } catch (error) {
          console.log("APP SOCKET CONNECT ERROR", error);
        }
        return;
      }

      disconnectSocket();
    };

    syncSocketWithAppState(AppState.currentState);

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (!mounted) return;
      syncSocketWithAppState(nextState);
    });

    return () => {
      mounted = false;
      subscription.remove();
      disconnectSocket();
    };
  }, []);

  return null;
}

export default function Layout() {
  return (
    <>
      <SocketPresenceManager />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}