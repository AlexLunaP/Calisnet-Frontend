import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  TableCaption,
  useBreakpointValue,
  Skeleton,
} from "@chakra-ui/react";
import Pagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import axios from "axios";
import Link from "next/link";

import { format } from "date-fns";
import { es } from "date-fns/locale";

const ITEMS_PER_PAGE = 5;

interface CompetitionHistoryTableProps {
  username: string;
}

interface Participation {
  participant_id: string;
  competition_id: string;
}

interface Competition {
  competition_id: string;
  date: string;
  name: string;
  penalty_time: number;
}

interface Result {
  competition_id: string;
  result_time: string;
  rank: number;
  penalties: number;
}

interface CompetitionHistoryTableProps {
  username: string;
}

const CompetitionHistoryTable: React.FC<CompetitionHistoryTableProps> = ({
  username,
}) => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [history, setHistory] = useState<
    { competition: Competition; result: Result }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [noParticipants, setNoParticipants] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Step 1: Fetch userId based on username
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/username/${username}`
        );
        const userId = userResponse.data.user_id;

        // Step 2: Fetch participations using userId
        const participationsResponse = await axios.get<Participation[]>(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/participants?participant_id=${userId}`
        );

        const participations = participationsResponse?.data;

        if (!participations || participations.length === 0) {
          setNoParticipants(true);
          setLoading(false);
          return;
        }

        // Step 3: Extract competition IDs
        const competitionIds = participations.map(
          (participation) => participation.competition_id
        );

        // Step 4: Fetch competition details
        const competitionPromises = competitionIds.map((competition_id) =>
          axios.get<Competition>(
            `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions/${competition_id}`
          )
        );
        const competitionsResponses = await Promise.all(competitionPromises);
        const competitions = competitionsResponses.map(
          (response) => response.data
        );

        // Step 5: Fetch results for the user as a participant
        const resultsResponse = await axios.get<Result[]>(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/results?participant_id=${userId}`
        );
        const results = resultsResponse?.data;

        // Step 6: Combine competition details with results
        const combinedData = results.map((result) => {
          const competition = competitions.find(
            (comp) => comp.competition_id === result.competition_id
          );
          return { competition, result: result as Result | undefined };
        });

        // Step 7: Set the combined data to state
        const validCompetitions = combinedData.filter(
          (data) => data.competition !== undefined
        ) as { competition: Competition | undefined; result: Result }[];
        setHistory(
          validCompetitions.map((data) => ({
            competition: data.competition!,
            result: data.result,
          }))
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setHistory([]);
        }
        console.error("Error fetching competition history:", error);
        setError("An error occurred while fetching competition history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [username]);

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (loading) {
    return (
      <Box>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Competition</Th>
              <Th>Rank</Th>
              <Th>Final Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <Tr key={index}>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  }

  const filteredCompetitions = history.filter((history) =>
    history.competition.date.includes(filter)
  );

  const totalPages = Math.ceil(filteredCompetitions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompetitions = filteredCompetitions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const convertTimeToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const convertSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Box>
      <Input
        placeholder="Filter by date"
        mb={4}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <Table variant="striped" colorScheme="gray" size={isMobile ? "sm" : "md"}>
        <TableCaption>Competition History</TableCaption>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Competition</Th>
            <Th>Rank</Th>
            <Th>Final Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedCompetitions.map(({ competition, result }, index) => {
            const resultTimeInSeconds = convertTimeToSeconds(
              result.result_time
            );
            const finalTimeInSeconds =
              resultTimeInSeconds + competition.penalty_time * result.penalties;
            const finalTime = convertSecondsToTime(finalTimeInSeconds);
            return (
              <Tr key={index}>
                <Td>
                  {format(new Date(competition.date), "dd MMMM yyyy", {
                    locale: es,
                  })}
                </Td>
                <Td>
                  <Link href={`/competitions/${competition.competition_id}`}>
                    {competition.name}
                  </Link>
                </Td>
                <Td>{result.rank}</Td>
                <Td>{finalTime}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Pagination
        current={currentPage}
        total={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </Box>
  );
};

export default CompetitionHistoryTable;
