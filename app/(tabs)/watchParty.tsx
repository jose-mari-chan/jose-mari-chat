import React, { useState, useEffect, useRef } from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { getWatchParty, supabase } from "../../lib/supabase";
import {
  getAppAvatar,
  getAppId,
  getAppNickname,
  setAppNickname,
} from "../../lib/appIdentity";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Message {
  message_id: string;
  message_contents: string;
  sender_id: string;
  sender_nickname: string;
  sender_avatar: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);
  const messageBackgroundColor = useThemeColor({}, "tint");
  const watchPartyId = getWatchParty()?.id; // Fetch the watch party id
  const appId = getAppId();
  const appNickname = getAppNickname();
  const appAvatar = getAppAvatar();

  const fetchMessages = async () => {
    if (!watchPartyId) return;

    const newMessage: Message = {
      message_id: "99999999",
      message_contents:
        "Use command /nickname or /nn to set your nickname. Let others know who you are!",
      sender_id: "SYSTEM",
      sender_nickname: "Jose Mari Chat",
      sender_avatar:
        "https://jose-mari-chan.github.io/jose-mari-chat/assets/jmc-logo.png",
    };
    const { data: fetchedMessages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("watch_party_id", watchPartyId)
      .order("sent_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages([newMessage, ...fetchedMessages]);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.startsWith("/nickname ") || inputValue.startsWith("/nn ")) {
      const newNickname = inputValue.split(" ")[1].trim();
      if (newNickname.length == 0) {
        setInputValue("");
        return;
      }
      const { data: newMessage, error } = await supabase
        .from("messages")
        .insert([
          {
            message_contents: `${getAppNickname()}'s nickname has been set to \"${newNickname}\"`,
            watch_party_id: watchPartyId,
            sender_id: "SYSTEM",
            sender_nickname: "Jose Mari Chat",
            sender_avatar:
              "https://jose-mari-chan.github.io/jose-mari-chat/assets/jmc-logo.png",
          },
        ]);
      setAppNickname(newNickname);
      setInputValue("");
      return;
    }
    if (inputValue.trim()) {
      const { data: newMessage, error } = await supabase
        .from("messages")
        .insert([
          {
            message_contents: inputValue,
            watch_party_id: watchPartyId,
            sender_id: appId,
            sender_nickname: appNickname,
            sender_avatar: appAvatar,
          },
        ]);

      if (error) {
        console.error("Error sending message:", error);
      } else {
        setInputValue("");
      }
    }
  };

  useEffect(() => {
    if (!watchPartyId) return;

    fetchMessages();

    const messageChannel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `watch_party_id=eq.${watchPartyId}`,
        },
        (payload) => {
          const newMessage: Message = {
            message_id: payload.new.message_id,
            message_contents: payload.new.message_contents,
            sender_id: payload.new.sender_id,
            sender_nickname: payload.new.sender_nickname,
            sender_avatar: payload.new.sender_avatar,
          };

          setMessages((prevMessages) => [newMessage, ...prevMessages]);
          flatListRef.current?.scrollToIndex({ animated: true, index: 0 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [watchPartyId]);

  const renderItem = ({ item }: { item: Message }) => (
    <ThemedView
      style={[
        item.sender_id == getAppId() ? styles.you : styles.messageWrapper,
        item.sender_id == "SYSTEM" ? styles.systemMessage : {},
      ]}
    >
      {item.sender_avatar && (
        <Image
          source={{ uri: item.sender_avatar }}
          style={[
            item.sender_id == "SYSTEM"
              ? styles.systemMessageOmit
              : styles.avatar,
          ]}
        />
      )}
      <ThemedView style={styles.messageContainer}>
        <ThemedView
          style={[
            item.sender_id == getAppId()
              ? styles.yourHeader
              : styles.messageHeader,
            item.sender_id == "SYSTEM" ? styles.systemMessageOmit : {},
          ]}
        >
          <ThemedText style={styles.nickname}>
            {item.sender_nickname}
          </ThemedText>
        </ThemedView>
        <ThemedText
          style={[
            item.sender_id == getAppId() ? styles.yourMessage : styles.message,
            item.sender_id == "SYSTEM" ? styles.systemMessageContent : {},
          ]}
        >
          {item.message_contents}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  if (!watchPartyId) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>You are not in a watch party.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          { backgroundColor: messageBackgroundColor },
          styles.currentlyWatching,
        ]}
      >
        <ThemedText style={[styles.bold, styles.whiteText]}>
          Watching "{getWatchParty().watch_args.movie.title}"
        </ThemedText>
      </ThemedView>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.message_id}
        contentContainerStyle={styles.list}
        inverted
        showsVerticalScrollIndicator={false}
      />
      <ThemedView style={styles.horizontalContainer}>
        <ThemedTextInput
          style={styles.flex}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSendMessage}
          placeholder="Type a message..."
        />
        <ThemedButton type="primary" title="Send" onPress={handleSendMessage} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  systemMessage: {
    opacity: 0.8,
    justifyContent: "center",
    alignContent: "center",
    marginEnd: 0,
  },
  systemMessageOmit: {
    display: "none",
  },
  systemMessageContent: {
    opacity: 0.5,
    fontSize: 12,
  },
  whiteText: {
    color: "#ECEDEE",
  },
  you: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  currentlyWatching: {
    padding: 12,
    borderRadius: 12,
  },
  bold: {
    fontWeight: "bold",
  },
  horizontalContainer: {
    flexDirection: "row",
    gap: 8,
  },
  messageWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 48,
    padding: 16,
    gap: 24,
  },
  list: {
    justifyContent: "flex-start",
  },
  messageContainer: {
    borderRadius: 5,
    flexShrink: 1,
  },
  messageHeader: {
    flexDirection: "row",
  },
  yourHeader: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nickname: {
    opacity: 0.5,
    fontSize: 12,
  },
  message: {
    borderRadius: 12,
    flexDirection: "row",
  },
  yourMessage: {
    borderRadius: 12,
    flexDirection: "row-reverse",
    textAlign: "right",
  },
});
