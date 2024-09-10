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
} from "@chakra-ui/react";
import Pagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import axios from "axios";
import Link from "next/link";

import { format } from "date-fns";
import { es } from "date-fns/locale";

const ITEMS_PER_PAGE = 5;

interface AchievementsTableProps {
  username: string;
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

const AchievementsTable: React.FC<AchievementsTableProps> = ({ username }) => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [achievements, setAchievements] = useState<
    { competition: Competition; result: Result }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Step 1: Fetch userId based on username
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/user/get_by_username/${username}/`
        );
        const userId = userResponse.data.user_id;

        // Step 2: Fetch results for the user as a participant
        const resultsResponse = await axios.get<Result[]>(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/result/participant/${userId}/`
        );
        const results = resultsResponse.data;

        // Step 3: Filter results to include only those with ranks 1, 2, or 3
        const filteredResults = results.filter((result) => result.rank <= 3);

        // Step 4: Extract competition IDs
        const competitionIds = filteredResults.map(
          (result) => result.competition_id
        );

        // Step 5: Fetch competition details
        const competitionPromises = competitionIds.map((competition_id) =>
          axios.get<Competition>(
            `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competition/get/${competition_id}`
          )
        );
        const competitionsResponses = await Promise.all(competitionPromises);
        const competitions = competitionsResponses.map(
          (response) => response.data
        );

        // Step 6: Combine competition details with filtered results
        const combinedData = filteredResults.map((result) => {
          const competition = competitions.find(
            (comp) => comp.competition_id === result.competition_id
          );
          return { competition, result };
        });

        // Step 7: Set the combined data to state
        const validAchievements = combinedData.filter(
          (data) => data.competition !== undefined
        );
        setAchievements(
          validAchievements as { competition: Competition; result: Result }[]
        );
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [username]);

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredAchievements = achievements.filter((achievement) =>
    achievement.competition.date.includes(filter)
  );

  const totalPages = Math.ceil(filteredAchievements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAchievements = filteredAchievements.slice(
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
        <TableCaption>Achievements</TableCaption>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Competition</Th>
            <Th>Rank</Th>
            <Th>Final Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedAchievements.map(({ competition, result }, index) => {
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
                  <Link href={`/competition/${competition.competition_id}`}>
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

export default AchievementsTable;
