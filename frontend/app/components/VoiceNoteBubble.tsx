// import { Ionicons } from "@expo/vector-icons";
// import { useAudioPlayer } from "expo-audio";
// import React, { useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import theme from "../../src/theme";

// type Props = {
//   audioUrl: string;
//   durationMs?: number;
//   isMine?: boolean;
// };

// function formatDuration(durationMs?: number) {
//   if (!durationMs && durationMs !== 0) return "Voice note";

//   const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;

//   return `${minutes}:${String(seconds).padStart(2, "0")}`;
// }

// export default function VoiceNoteBubble({ audioUrl, durationMs, isMine }: Props) {
//   const player = useAudioPlayer(audioUrl, { downloadFirst: true });
//   const [isPlaying, setIsPlaying] = useState(false);

//   const handleTogglePlayback = () => {
//     if (isPlaying) {
//       player.pause();
//       setIsPlaying(false);
//       return;
//     }

//     player.play();
//     setIsPlaying(true);
//   };

//   return (
//     <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
//       <TouchableOpacity style={styles.playButton} onPress={handleTogglePlayback}>
//         <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#fff" />
//       </TouchableOpacity>

//       <View style={styles.meta}>
//         <Text style={[styles.title, isMine && styles.mineText]}>Voice note</Text>
//         <Text style={[styles.duration, isMine && styles.mineSubText]}>
//           {formatDuration(durationMs)}
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: theme.spacing.sm,
//     minWidth: 180,
//   },
//   mine: {},
//   theirs: {},
//   playButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: theme.colors.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   meta: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: theme.colors.text,
//   },
//   duration: {
//     marginTop: 2,
//     fontSize: 12,
//     color: theme.colors.muted,
//   },
//   mineText: {
//     color: "#fff",
//   },
//   mineSubText: {
//     color: "rgba(255,255,255,0.8)",
//   },
// });
