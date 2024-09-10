// pages/competitions.tsx
import React from "react";
import CompetitionsGrid from "../../Components/Competition/CompetitionsGrid";
import { Box, Heading } from "@chakra-ui/react";

const CompetitionsPage: React.FC = () => {
  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>
        Latest Competitions
      </Heading>
      <CompetitionsGrid />
    </Box>
  );
};

export default CompetitionsPage;
