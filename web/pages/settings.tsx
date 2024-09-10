import React from "react";
import { Box, Flex, Heading } from "@chakra-ui/react";
import UserProfileForm from "../Components/User/UserProfileForm";

const UserSettings: React.FC = () => {
  return (
    <Flex justifyContent="center" alignItems="center">
      <Box>
        <Heading as="h1" size="md" mt={6} mb={2} textAlign="center">
          Update Profile Information
        </Heading>
        <UserProfileForm />
      </Box>
    </Flex>
  );
};

export default UserSettings;
