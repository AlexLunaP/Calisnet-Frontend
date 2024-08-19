import React from "react";
import { Box, Container, Stack, Text } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box bg="paleYellow" color="charcoalGray">
      <Container
        as={Stack}
        maxW="6xl"
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <Stack direction="row" spacing={6}>
          <Box as="a" href="#">
            Home
          </Box>
        </Stack>
        <Text ml="auto">
          © 2024 Calisnet. This website is licensed under the{" "}
          <a href="https://www.gnu.org/licenses/gpl-3.0.html">
            GNU General Public License v3.0
          </a>
          .
        </Text>
      </Container>
    </Box>
  );
}
