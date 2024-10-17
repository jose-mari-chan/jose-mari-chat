import { createClient } from "@supabase/supabase-js";
import { getAppAvatar, getAppId, getAppNickname } from "./appIdentity";

// Define your Supabase credentials
export const BASE_ENDPOINT = "https://szolfsvvlwkrulwlvmpz.supabase.co";
export const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6b2xmc3Z2bHdrcnVsd2x2bXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NTkzMzUsImV4cCI6MjA0NDEzNTMzNX0.nvDYmOoDGuPlsKXJob2jHdJE6NpDPhvZL3X817PGfbA"; // Replace with your Supabase API key

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
    // Query the watch party by ID
    const { data, error } = await supabase
      .from("watch-parties")
      .select("*")
      .eq("watch_party_id", watch_party_id)
      .eq("is_active", true)
      .single(); // Assuming you only expect one result

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
