import * as React from "react";
import {
  Container,
  chakra,
  Stack,
  Text,
  Button,
  Box,
  Link,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";

const HeroSection = () => {
  const { data: session } = useSession();

  return (
    <Container p={{ base: 8, sm: 14 }} mt={0}>
      <Stack direction="column" spacing={6} alignItems="center">
        <chakra.h1
          fontSize={{ base: "3xl", sm: "4xl" }}
          fontWeight="bold"
          textAlign="center"
          maxW="600px"
          mb={4}
        >
          Welcome to{" "}
          <chakra.span
            color="deepOrange"
            bg="linear-gradient(transparent 50%, #FFEEA9 50%)"
          >
            Calisnet !
          </chakra.span>
        </chakra.h1>
        <Stack
          direction={{ base: "column", sm: "row" }}
          w={{ base: "100%", sm: "auto" }}
          spacing={5}
        >
          <Link href="/competition/competitions">
            <Button
              as="a"
              colorScheme="orange"
              variant="outline"
              rounded="md"
              size="lg"
              height="3.5rem"
              fontSize="1.2rem"
            >
              Explore Competitions
            </Button>
          </Link>
          <Link href={session ? "/competition/create" : "/login"}>
            <Button
              as="a"
              colorScheme="gray"
              variant="outline"
              rounded="md"
              size="lg"
              height="3.5rem"
              fontSize="1.2rem"
            >
              Create New Competition
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Container>
  );
};

export default HeroSection;
