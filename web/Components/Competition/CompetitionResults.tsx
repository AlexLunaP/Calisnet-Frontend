import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  Input,
  useToast,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { userAgent } from "next/server";

interface Participant {
  participant_id: string;
  username: string;
}

interface CompetitionResultsProps {
  competitionId: string;
}

interface Result {
  participant_id: number;
  participant_name: string;
  rank: number;
  result_time: string;
  penalties: number;
  penalty_time: string;
  time: string; // Added time property
}

const CompetitionResults = ({
  competitionId,
  penaltyTime,
  organizerId,
}: {
  competitionId: string;
  penaltyTime: string;
  organizerId: string;
}) => {
  const { data: session } = useSession();
  const [results, setResults] = useState<Result[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [newResult, setNewResult] = useState<Result>({
    participant_id: 0,
    participant_name: "",
    rank: 0,
    result_time: "",
    penalties: 0,
    penalty_time: "",
    time: "",
  });
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get<Result[]>(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/results?competition_id=${competitionId}`
        );
        const fetchedResults = response.data;

        // Handle case where there are no results
        if (!fetchedResults || fetchedResults.length === 0) {
          setNoResults(true);
          setLoading(false);
          return;
        }

        setResults(fetchedResults);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log("No results found");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchParticipants = async () => {
      try {
        const response = await axios.get<Participant[]>(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/participants?competition_id=${competitionId}`
        );

        const participantsData = response.data;

        // Fetch user details for each participant
        const userDetailsPromises = participantsData.map((participant) =>
          axios.get(
            `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/${participant.participant_id}`
          )
        );

        const userDetailsResponses = await Promise.all(userDetailsPromises);
        const participantsWithUsernames = participantsData.map(
          (participant, index) => ({
            ...participant,
            username: userDetailsResponses[index].data.username,
          })
        );

        setParticipants(participantsWithUsernames);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    fetchResults();
    fetchParticipants();
  }, [competitionId]);

  const timeToSeconds = (time: string) => {
    if (!time) return 0; // Add validation to check for undefined values
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const secondsToTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  const calculateFinalTime = (
    result_time: string,
    penalties: number,
    penaltyTime: string
  ) => {
    const resultTimeInSeconds = timeToSeconds(result_time);
    const penaltyTimeInSeconds = timeToSeconds(penaltyTime);
    if (isNaN(resultTimeInSeconds) || isNaN(penaltyTimeInSeconds)) {
      return "Invalid time";
    }
    const totalPenaltyTimeInSeconds = penalties * penaltyTimeInSeconds;
    const finalTimeInSeconds = resultTimeInSeconds + totalPenaltyTimeInSeconds;

    return secondsToTime(finalTimeInSeconds);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewResult({ ...newResult, [name]: value });
  };

  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParticipant(e.target.value);
    setNewResult({ ...newResult, participant_id: Number(e.target.value) });
  };

  const handleSaveResult = async () => {
    try {
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      };
      const body = {
        result: {
          competition_id: competitionId,
          participant_id: newResult.participant_id,
          result_time: newResult.time,
          penalties: newResult.penalties,
          rank: newResult.rank,
        },
      };
      await axios.post(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/results`,
        newResult,
        options
      );
      toast({
        title: "Result added",
        description: "The result has been added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setResults([...results, newResult]);
      setNewResult({
        participant_id: 0,
        participant_name: "",
        rank: 0,
        result_time: "",
        penalties: 0,
        penalty_time: "",
        time: "",
      });
      setSelectedParticipant("");
    } catch (error) {
      console.error("Error adding result:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the result.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteResult = async (participant_id: string) => {
    try {
      const options = {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      };
      await axios.delete(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/results/${participant_id}`,
        options
      );
      toast({
        title: "Result deleted",
        description: "The result has been deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setResults(
        results.filter(
          (result) => result.participant_id !== Number(participant_id)
        )
      );
    } catch (error) {
      console.error("Error deleting result:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the result.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isOrganizer = session?.userId === organizerId;

  return (
    <Box>
      <Text fontSize="xl" mb={4}>
        Competition Results
      </Text>
      <Box mb={4}>
        Participant
        <Select
          placeholder="Select participant"
          value={selectedParticipant}
          onChange={handleParticipantChange}
          mb={6}
        >
          {participants.map((participant) => (
            <option
              key={participant.participant_id}
              value={participant.participant_id}
            >
              {participant.username}
            </option>
          ))}
        </Select>
        Time
        <Input
          type="time"
          name="result_time"
          placeholder="Enter time (e.g., 12:34)"
          value={newResult.result_time}
          onChange={handleInputChange}
          mt={2}
          mb={6}
        />
        Number of penalties
        <Input
          name="penalties"
          placeholder="Enter penalties"
          value={newResult.penalties}
          onChange={handleInputChange}
          mt={2}
          mb={4}
        />
        <Button onClick={handleSaveResult} colorScheme="teal" mt={2} mb={4}>
          Save Result
        </Button>
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color="brand.700">Participant</Th>
            <Th color="brand.700">Rank</Th>
            <Th color="brand.700">Time</Th>
            <Th color="brand.700">Penalties</Th>
            <Th color="brand.700">Final Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {results.length === 0 ? (
            <Tr>
              <Td colSpan={5} textAlign="center">
                No results available
              </Td>
            </Tr>
          ) : (
            results.map((result) => {
              const participant = participants.find(
                (p) => p.participant_id === result.participant_id.toString()
              );
              const finalTime = calculateFinalTime(
                result.result_time,
                result.penalties,
                result.penalty_time
              );
              return (
                <Tr key={result.participant_id}>
                  <Td>{participant ? participant.username : "Unknown"}</Td>
                  <Td>{result.rank}</Td>
                  <Td>{result.result_time}</Td>
                  <Td>{result.penalties}</Td>
                  <Td>{finalTime}</Td>
                  <Td>
                    <IconButton
                      aria-label="Delete result"
                      icon={<FaTrash />}
                      colorScheme="red"
                      onClick={() =>
                        handleDeleteResult(result.participant_id.toString())
                      }
                    />
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CompetitionResults;
