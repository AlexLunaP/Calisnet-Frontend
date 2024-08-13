import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Montserrat', sans-serif`,
    body: `'Montserrat', sans-serif`,
  },
  colors: {
    deepOrange: "#FF6F00",
    warmYellow: "#F9A825",
    lightGray: "gray.600",
    charcoalGray: "#333333",
    softPeach: "#FFAB91",
    paleYellow: "#FFF9C4",
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
