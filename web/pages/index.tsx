import React from "react";
import Link from "next/link";

import { Image, Center, Button, Box, Spinner, Heading } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

// We can add a carousel here to display latest events for example
export default function Home() {
  return (
    <Center minH="100vh">
      {/* Placeholder content or simply an empty Box */}
      <Box maxW="sm" overflow="hidden">
        {/* This box can be used for future content */}
      </Box>
    </Center>
  );
}
