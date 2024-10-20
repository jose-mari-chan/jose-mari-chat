import { TextInput, StyleSheet, type TextInputProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedTextInputProps) {
  // Dynamically get colors based on the current theme
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "secondary"
  );
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const cursorColor = useThemeColor({}, "tint");

  return (
    <TextInput
      style={[
        { backgroundColor, color: textColor, padding: 10, borderRadius: 8 },
        style,
      ]}
      selectionColor={cursorColor}
      placeholderTextColor={textColor + "40"}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // You can define additional shared styles here if needed
});
