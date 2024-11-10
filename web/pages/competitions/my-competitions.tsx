import React from "react";
import MyCompetitionsGrid from "../../Components/Competition/MyCompetitionsGrid";
import { useSession } from "next-auth/react";
import { Box, Heading } from "@chakra-ui/react";

const MyCompetitionsPage: React.FC = () => {
  const { data: session } = useSession();

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>
        My Competitions
      </Heading>
      <MyCompetitionsGrid userId={session?.userId as string} />
    </Box>
  );
};

export default MyCompetitionsPage;
