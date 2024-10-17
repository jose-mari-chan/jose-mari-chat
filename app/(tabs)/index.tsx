import { Image, StyleSheet, Platform } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { HelloWave } from "@/components/PartyWiggle";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedButton } from "@/components/ThemedButton";
import { joinWatchParty, setWatchParty } from "../lib/supabase";
import { generateHexCode, generateNickname } from "../lib/appIdentity";

export default function HomeScreen() {
  const router = useRouter();
  async function tryJoinWatchParty() {
    setWatchParty(await joinWatchParty(text));
    router.push("./(tabs)/watchParty");
  }
  const [text, onChangeText] = React.useState("");

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#B00326", dark: "#B00326" }}
      headerImage={
        <Image
          source={require("@/assets/images/jmc-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Join a watch party!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">How to join:</ThemedText>
        <ThemedText>
          Copy and paste the code that your host gives you. It should be an
          8-digit code.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.horizontalContainer}>
        <ThemedTextInput
          maxLength={8}
          onChangeText={onChangeText}
          value={text}
          onSubmitEditing={tryJoinWatchParty}
          placeholder="ABCD5678"
          style={styles.textInput}
        ></ThemedTextInput>
        <ThemedButton
          onPress={tryJoinWatchParty}
          title="Enter"
          type="primary"
        ></ThemedButton>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 290,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  horizontalContainer: {
    flexDirection: "row",
    gap: 8,
  },
  textInput: {
    flex: 1,
  },
});
