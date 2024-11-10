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
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { userAgent } from "next/server";

interface Participant {
  participant_id: number;
  participant_name: string;
}

interface Result {
  participant_id: number;
  participant_name: string;
  rank: number;
  result_time: string;
  penalties: number;
  penalty_time: string;
}

const CompetitionResults = ({
  competitionId,
  penaltyTime,
  participants,
  organizerId,
}: {
  competitionId: string;
  penaltyTime: string;
  participants: Participant[];
  organizerId: string;
}) => {
  const [results, setResults] = useState<Result[]>([]);
  const [newResult, setNewResult] = useState({
    participant_id: "",
    time: "",
    penalties: "",
  });
  const { data: session } = useSession();
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
          toast({
            title: "No results found for this competition",
            status: "error",
            duration: 5000,
            isClosable: true,
            containerStyle: {
              marginBottom: "100px",
            },
          });
        } else {
          toast({
            title: "Error results participants or user details",
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
      }
    };

    fetchResults();
  }, [competitionId]);

  const timeToSeconds = (time: string) => {
    if (!time || !time.includes(":")) {
      return NaN;
    }
    const [minutes, seconds] = time.split(":").map(Number);
    if (isNaN(minutes) || isNaN(seconds)) {
      return NaN;
    }
    return minutes * 60 + seconds;
  };

  const secondsToTime = (seconds: number) => {
    if (isNaN(seconds)) {
      return "Invalid time";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewResult((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddResult = () => {
    const newResultData = {
      participant_id: parseInt(newResult.participant_id),
      time: newResult.time,
      penalties: parseInt(newResult.penalties),
    };

    axios
      .post(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/results`,
        newResultData
      )
      .then((response) => {
        setResults((prev) => [...prev, response.data]);
        setNewResult({
          participant_id: "",
          time: "",
          penalties: "",
        });
      })
      .catch((error) => {
        console.error("Error adding result:", error);
      });
  };
  const isOrganizer = session?.userId === organizerId;

  return (
    <Box overflowX="auto" bg="brand.50" p={4} borderRadius="md" boxShadow="md">
      {isOrganizer && (
        <Box mb={4}>
          <Select
            placeholder="Select participant"
            name="participant_id"
            value={newResult.participant_id}
            onChange={handleInputChange}
          >
            {participants.map((participant) => (
              <option
                key={participant.participant_id}
                value={participant.participant_id}
              >
                {participant.participant_name}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Time (MM:SS)"
            name="time"
            value={newResult.time}
            onChange={handleInputChange}
            mt={2}
          />
          <Input
            placeholder="Penalties"
            name="penalties"
            value={newResult.penalties}
            onChange={handleInputChange}
            type="number"
            mt={2}
          />
          <Button onClick={handleAddResult} mt={2} colorScheme="teal">
            Add Result
          </Button>
        </Box>
      )}
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
                (p) => p.participant_id === result.participant_id
              );
              return (
                <Tr key={result.participant_id}>
                  <Td>
                    {participant ? participant.participant_name : "Unknown"}
                  </Td>
                  <Td>{result.rank}</Td>
                  <Td>{result.result_time}</Td>
                  <Td>{result.penalties}</Td>
                  <Td>{result.result_time}</Td>
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
