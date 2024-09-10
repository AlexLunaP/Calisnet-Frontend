import React from "react";
import { Box, Container, Stack, Text } from "@chakra-ui/react";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CALISNET_CONTACT_EMAIL;

export default function Footer() {
  return (
    <Box bg="white" color="charcoalGray">
      <Container
        as={Stack}
        maxW="4xl"
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={{ base: "center", md: "flex-end" }}
        align={{ base: "center", md: "center" }}
      >
        <Stack direction="row" spacing={6} align={"center"}>
          <Box as="a" href="/">
            Home
          </Box>
          <Box as="a" href={`mailto:${CONTACT_EMAIL}`}>
            Contact
          </Box>

          <Text ml="auto">
            © 2024 Calisnet. This website is licensed under the{" "}
            <a href="https://www.gnu.org/licenses/gpl-3.0.html">
              GNU General Public License v3.0
            </a>
            .
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
