import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type TouchableOpacityProps,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  type?: "default" | "primary" | "secondary" | "danger";
};

export function ThemedButton({
  style,
  title,
  type = "default",
  ...rest
}: ThemedButtonProps) {
  // Fetch theme-aware colors for background and text
  const backgroundColor = useThemeColor(
    {},
    type === "primary" ? "tint" : "background" // Use tint for primary buttons, background for others
  );
  const textColor = useThemeColor({}, "text"); // Dynamic text color based on theme

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor,
          paddingVertical: 0,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
        },
        style, // Allow external styles to override
      ]}
      {...rest}
    >
      <Text style={[{ color: textColor, fontSize: 16, fontWeight: "bold" }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
