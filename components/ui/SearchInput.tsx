import { forwardRef, useImperativeHandle, useRef, useState } from "react"

import { useColorTheme } from "@hooks/useColorTheme"

import { theme } from "@styles/theme"

import {
  Pressable,
  TextInput as RNTextInput,
  StyleProp,
  View,
  ViewStyle,
  type NativeSyntheticEvent,
  type TextInputFocusEventData
} from "react-native"

import { Button } from "./Button"
import { Icon } from "./Icon"
import { IconButton } from "./IconButton"
import { TextInput, type TextInputProps } from "./TextInput"

import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export type SearchInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>
}

export const SearchInput = forwardRef<RNTextInput, SearchInputProps>(function SearchInput(
  {
    style,
    value,
    placeholderTextColor,
    containerStyle,
    onChangeText,
    onFocus,
    onBlur,
    ...props
  }: SearchInputProps,
  ref
) {
  const { colors } = useColorTheme()

  const inputRef = useRef<RNTextInput>(null)
  useImperativeHandle(ref, () => inputRef.current || ({} as RNTextInput))

  const [cancelWidth, setCancelWidth] = useState<number>(0)

  const isFocused = useSharedValue<number>(0)

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    isFocused.value = withTiming(1, { duration: 300 })
    if (onFocus) onFocus(e)
  }

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    inputRef.current?.blur()
    isFocused.value = withTiming(0, { duration: 300 })
    if (onBlur) onBlur(e)
  }

  const handlePress = () => {
    inputRef.current?.focus()
  }

  const clearStyle = useAnimatedStyle(() => ({
    opacity: isFocused.value
  }))

  const cancelStyle = useAnimatedStyle(() => ({
    opacity: isFocused.value,
    marginRight: interpolate(isFocused.value, [0, 1], [-cancelWidth, 0]),
    marginLeft: interpolate(isFocused.value, [0, 1], [0, theme.styles.spacing.small])
  }))

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(isFocused.value, [0, 1], [colors.muted, colors.primary])
  }))

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <AnimatedPressable
        onPress={handlePress}
        style={[
          {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: theme.styles.spacing.small,
            borderRadius: theme.styles.borderRadius.xSmall,
            borderColor: colors.muted,
            borderWidth: theme.styles.border.thin
          },
          borderStyle,
          containerStyle
        ]}
      >
        <Icon name="Search" size={theme.styles.icon.size.medium} color={colors.foreground} />
        <TextInput
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={placeholderTextColor || colors.mutedForeground}
          style={[
            style,
            {
              flex: 1,
              paddingHorizontal: theme.styles.spacing.xSmall,
              borderWidth: theme.styles.border.none
            }
          ]}
          disableBorderAnimation
          {...props}
        />
        <Animated.View style={clearStyle}>
          <IconButton
            name="X"
            size={theme.styles.icon.size.medium}
            color={colors.foreground}
            onPress={() => {
              if (isFocused.value === 0) {
                handlePress()
                return
              }
              onChangeText ? onChangeText("") : inputRef.current?.clear()
            }}
          />
        </Animated.View>
      </AnimatedPressable>
      <Animated.View
        onLayout={(event) => setCancelWidth(event.nativeEvent.layout.width)}
        style={cancelStyle}
      >
        <Button
          variant="text"
          title="Cancel"
          onPress={() => handleBlur({} as NativeSyntheticEvent<TextInputFocusEventData>)}
          style={{
            paddingRight: theme.styles.spacing.none,
            paddingLeft: theme.styles.spacing.xSmall
          }}
        />
      </Animated.View>
    </View>
  )
})
SearchInput.displayName = "SearchInput"
