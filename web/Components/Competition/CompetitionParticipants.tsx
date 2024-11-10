import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, VStack, SimpleGrid, Text, useToast } from "@chakra-ui/react";
import UserProfileCard from "../User/UserProfileCard";

interface Participant {
  participant_id: string;
}

interface User {
  user_id: string;
  username: string;
}

interface CompetitionParticipantsProps {
  participantsList: Participant[];
  participantLimit?: number;
}

const CompetitionParticipants: React.FC<CompetitionParticipantsProps> = ({
  participantsList,
  participantLimit,
}) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const participantIds = participantsList.map(
          (participant: Participant) => participant.participant_id
        );

        const userDetailsPromises = participantIds.map(
          (participant_id: string) =>
            axios.get(
              `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/${participant_id}`
            )
        );

        const userDetailsResponses = await Promise.all(userDetailsPromises);
        const users: User[] = userDetailsResponses.map(
          (res: { data: User }) => res.data
        );

        setParticipants(users);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          toast({
            title: "No participants found for this competition",
            status: "error",
            duration: 5000,
            isClosable: true,
            containerStyle: {
              marginBottom: "100px",
            },
          });
        } else {
          toast({
            title: "Error fetching participants or user details",
            status: "error",
            duration: 5000,
            isClosable: true,
            containerStyle: {
              marginBottom: "100px",
            },
          });
        }
      } finally {
        setLoading(false);
        setParticipants([]);
      }
    };

    fetchParticipants();
  }, [participantsList]);

  return (
    <Box>
      <Text fontSize="xl" mb={4}>
        Participants: {participants.length}
        {participantLimit !== null && ` / ${participantLimit}`}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6} w="100%">
        {participants.map((participant) => (
          <UserProfileCard
            key={participant.user_id}
            user_id={participant.user_id}
            username={participant.username}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CompetitionParticipants;
