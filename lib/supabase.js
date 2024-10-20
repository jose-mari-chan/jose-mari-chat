import { createClient } from "@supabase/supabase-js";
import { getAppAvatar, getAppId, getAppNickname } from "./appIdentity";

// Define your Supabase credentials
export const BASE_ENDPOINT = "https://lpmsudplkqejqjfdoojh.supabase.co";
export const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbXN1ZHBsa3FlanFqZmRvb2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNTI0MDYsImV4cCI6MjA0NDkyODQwNn0.BmLwTm65hnZK2ePAke85ljjA4O1HdK4e2q-03DYjX3I";

export const supabase = createClient(BASE_ENDPOINT, API_KEY);

let watchParty = null;
export function setWatchParty(w) {
  console.log(w);
  watchParty = w;
}
export function getWatchParty() {
  return watchParty;
}

export async function joinWatchParty(watch_party_id) {
  try {
    const { data, error } = await supabase
      .from("watch-parties")
      .select("*")
      .eq("id", watch_party_id)
      .eq("is_active", true)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error joining watch party:", error.message);
    throw error;
  }
}

// Fetch messages from the messages table
export async function fetchMessages(watchPartyId) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("watch_party_id", watchPartyId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    throw error;
  }
}

// Insert a message into the messages table
export async function insertMessage(watchPartyId, messageText) {
  try {
    const messageData = {
      message_contents: messageText,
      watch_party_id: watchPartyId,
      sender_id: getAppId(),
      sender_nickname: getAppNickname(),
      sender_avatar: getAppAvatar(),
    };

    const { data, error } = await supabase
      .from("messages")
      .insert([messageData])
      .select(); // This will return the inserted message

    if (error) {
      throw error;
    }

    return data[0]; // Return the inserted message
  } catch (error) {
    console.error("Error inserting message:", error.message);
    throw error;
  }
}

// Setting up real-time message subscription
export function subscribeToMessages(watchPartyId, callback) {
  return supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `watch_party_id=eq.${watchPartyId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}
