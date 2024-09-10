import {
  SimpleGrid,
  Box,
  Skeleton,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
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

interface UserCompetitionsGridProps {
  userId: string;
}

const UserCompetitionsGrid: React.FC<UserCompetitionsGridProps> = ({
  userId,
}) => {
  const [organizedCompetitions, setOrganizedCompetitions] = useState<
    CompetitionData[]
  >([]);
  const [participatedCompetitions, setParticipatedCompetitions] = useState<
    CompetitionData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const NEXT_PUBLIC_CALISNET_API_URL = process.env.NEXT_PUBLIC_CALISNET_API_URL;

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        // Fetch competitions where the user is an organizer
        const organizerResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competition/user/${userId}`
        );
        const organizerCompetitions: CompetitionData[] = organizerResponse.data;

        // Fetch participations where the user is a participant
        const participationsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/participant/participant/${userId}`
        );

        const participations: { competition_id: string }[] =
          participationsResponse.data;

        // Extract competition IDs from participations
        const competitionIds = participations.map(
          (participation) => participation.competition_id
        );

        // Fetch competition details for each competition ID
        const participantCompetitions: CompetitionData[] = await Promise.all(
          competitionIds.map(async (competitionId) => {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competition/get/${competitionId}`
            );
            return response.data;
          })
        );

        // Combine and sort competitions by date
        const sortedOrganizedCompetitions = organizerCompetitions.sort(
          (a: CompetitionData, b: CompetitionData) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
        );

        const sortedParticipatedCompetitions = participantCompetitions.sort(
          (a: CompetitionData, b: CompetitionData) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
        );

        setOrganizedCompetitions(sortedOrganizedCompetitions);
        setParticipatedCompetitions(sortedParticipatedCompetitions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching competitions:", error);
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, [NEXT_PUBLIC_CALISNET_API_URL, userId]);

  const [organizedPage, setOrganizedPage] = useState(1);
  const [participatedPage, setParticipatedPage] = useState(1);
  const itemsPerPage = 6; // Number of items per page

  const organizedCompetitionsToDisplay = organizedCompetitions.slice(
    (organizedPage - 1) * itemsPerPage,
    organizedPage * itemsPerPage
  );

  const participatedCompetitionsToDisplay = participatedCompetitions.slice(
    (participatedPage - 1) * itemsPerPage,
    participatedPage * itemsPerPage
  );

  if (loading) {
    return <Skeleton height="100vh" />;
  }

  return (
    <Tabs>
      <TabList>
        <Tab
          sx={{
            _selected: {
              borderColor: "warmYellow",
            },
          }}
        >
          Organized
        </Tab>
        <Tab
          sx={{
            _selected: {
              borderColor: "warmYellow",
            },
          }}
        >
          Participations
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {organizedCompetitionsToDisplay.map((competition) => (
              <CompetitionCard
                key={competition.competition_id}
                competitionId={competition.competition_id}
              />
            ))}
          </SimpleGrid>
          <Box mt={4}>
            <Pagination
              current={organizedPage}
              total={Math.ceil(organizedCompetitions.length / itemsPerPage)}
              onPageChange={setOrganizedPage}
            />
          </Box>
        </TabPanel>
        <TabPanel>
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {participatedCompetitionsToDisplay.map((competition) => (
              <CompetitionCard
                key={competition.competition_id}
                competitionId={competition.competition_id}
              />
            ))}
          </SimpleGrid>
          <Box mt={4}>
            <Pagination
              current={participatedPage}
              total={Math.ceil(participatedCompetitions.length / itemsPerPage)}
              onPageChange={setParticipatedPage}
            />
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default UserCompetitionsGrid;
