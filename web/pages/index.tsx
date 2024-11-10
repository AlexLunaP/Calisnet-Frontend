import React from "react";
import { Center } from "@chakra-ui/react";
import Hero from "../Components/Hero";

export default function Home() {
  return (
    <Center minH="50vh" flexDirection="column">
      <Hero />
    </Center>
  );
}
