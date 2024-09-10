import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, VStack, SimpleGrid, Text } from "@chakra-ui/react";
import UserProfileCard from "../User/UserProfileCard";

interface Participant {
  participant_id: string;
}

interface User {
  user_id: string;
  username: string;
}

interface Competition {
  participant_limit?: number;
}

const CompetitionParticipants = ({
  competitionId,
}: {
  competitionId: string;
}) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantLimit, setParticipantLimit] = useState<number | null>(null);

  useEffect(() => {
    const fetchCompetitionData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competition/get/${competitionId}`
        );
        const competition: Competition = response.data;
        setParticipantLimit(competition.participant_limit || null);
      } catch (error) {
        console.error("Error fetching competition data:", error);
      }
    };
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/participant/competition/${competitionId}`
        );
        const participantIds = response.data.map(
          (participant: Participant) => participant.participant_id
        );

        const userDetailsPromises = participantIds.map(
          (participant_id: string) =>
            axios.get(
              `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/user/get/${participant_id}`
            )
        );

        const userDetailsResponses = await Promise.all(userDetailsPromises);
        const users = userDetailsResponses.map((res) => res.data);

        setParticipants(users);
      } catch (error) {
        console.error("Error fetching participants or user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitionData();
    fetchParticipants();
  }, [competitionId]);

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
