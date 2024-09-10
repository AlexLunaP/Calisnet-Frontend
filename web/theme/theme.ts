import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  initialColorMode: "light",
  useSystemColorMode: false,
  fonts: {
    heading: `'Montserrat', sans-serif`,
    body: `'Montserrat', sans-serif`,
  },
  colors: {
    deepOrange: "#FF7D29",
    warmYellow: "#F9A825",
    lightGray: "gray.600",
    charcoalGray: "#333333",
    softPeach: "#FFBF78",
    paleYellow: "#FEFFD2",
    lightOrange: "#FFEEA9",
  },
  styles: {
    global: {
      body: {
        bg: "lightGray",
        color: "charcoalGray",
      },
    },
  },
});

export default theme;
