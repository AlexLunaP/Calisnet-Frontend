import { SimpleGrid, Box, Skeleton } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Pagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import CompetitionCard from "./CompetitionCard";

interface CompetitionData {
  competition_id: string;
  organizer_id: string;
  date: string;
  description: string;
  image: string;
  location: string;
  name: string;
  participant_limit: number;
  penalty_time: number;
  status: string;
}

const CompetitionsGrid: React.FC = () => {
  const { NEXT_PUBLIC_CALISNET_API_URL } = process.env;
  const [competitions, setCompetitions] = useState<CompetitionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competition/competitions`
      )
      .then((response) => {
        const sortedCompetitions = response.data.sort(
          (a: CompetitionData, b: CompetitionData) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
        );
        setCompetitions(sortedCompetitions);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching competitions:", error);
        setLoading(false);
      });
  }, [NEXT_PUBLIC_CALISNET_API_URL]);

  if (loading) {
    return <Skeleton height="100vh" />;
  }

  const itemsPerPage = 10;

  // Calculate the total number of pages
  const totalPages = Math.ceil(competitions.length / itemsPerPage);

  // Get the current items to display
  const currentItems = competitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box p={4}>
      <SimpleGrid columns={[1, 2, 3]} spacing={10}>
        {currentItems.map((competition) => (
          <CompetitionCard
            key={competition.competition_id}
            competitionId={competition.competition_id}
          />
        ))}
      </SimpleGrid>
      <Pagination
        current={currentPage}
        total={totalPages}
        onPageChange={setCurrentPage}
      />
    </Box>
  );
};

export default CompetitionsGrid;
