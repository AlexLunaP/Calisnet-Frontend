import React from "react";
import UserCompetitionsGrid from "../../Components/Competition/UserCompetitionsGrid";
import { useSession } from "next-auth/react";
import { Box, Heading } from "@chakra-ui/react";

const UserCompetitionsPage: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>
        My Competitions
      </Heading>
      <UserCompetitionsGrid userId={session?.userId as string} />
    </Box>
  );
};

export default UserCompetitionsPage;
