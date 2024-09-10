import React from "react";
import Link from "next/link";

import { Image, Center, Button, Box, Spinner, Heading } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

import Hero from "../Components/Hero"; // Adjust the import path as necessary

export default function Home() {
  return (
    <Center minH="50vh" flexDirection="column">
      <Hero />
    </Center>
  );
}
