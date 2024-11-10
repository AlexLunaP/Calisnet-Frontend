import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Spinner,
  Heading,
  Container,
  Select,
  useBreakpointValue,
  Button,
  useToast,
} from "@chakra-ui/react";
import CompetitionDetails from "@/Components/Competition/CompetitionDetails";
import CompetitionExercises from "@/Components/Competition/CompetitionExercises";
import CompetitionParticipants from "@/Components/Competition/CompetitionParticipants";
import CompetitionResults from "@/Components/Competition/CompetitionResults";
import { useSession } from "next-auth/react";

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

const CompetitionPage = () => {
  const router = useRouter();
  const { competitionId } = router.query;
  const [competitionData, setCompetitionData] =
    useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isParticipant, setIsParticipant] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const { data: session, status } = useSession();
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (competitionId) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions/${competitionId}`
        )
        .then((response) => {
          setCompetitionData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching competition data:", error);
          setLoading(false);
        });

      axios
        .get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/participants?competition_id=${competitionId}`
        )
        .then((response) => {
          const userId = session?.userId;
          setLoading(false);
          const participants = response.data;
          const isUserParticipant = participants.some(
            (participant: { participant_id: string | undefined }) =>
              participant.participant_id === userId
          );
          setParticipants(participants);
          setIsParticipant(isUserParticipant);
        })
        .catch((error) => {
          console.error("Error fetching participants data:", error);
          setLoading(false);
        });
    }
  }, [competitionId, session?.userId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!competitionData) {
    return <Box>No competition data found.</Box>;
  }

  const handleTabChange = (index: React.SetStateAction<number>) => {
    setSelectedTab(index);
  };

  const handleJoinCompetition = async () => {
    if (competitionData.status !== "Open") {
      toast({
        title: "Competition not open",
        description: "The competition is not open for joining.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          marginBottom: "100px",
        },
      });
      return;
    }

    if (participants.length >= competitionData.participant_limit) {
      toast({
        title: "Competition participant limit reached",
        description: "Participant limit reached, cannot join competition",
        status: "warning",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          marginBottom: "100px",
        },
      });
      return;
    }
    try {
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/participants`,
        {
          participant: {
            competition_id: competitionData.competition_id,
            participant_id: session?.userId,
            name: session?.user?.name,
          },
        },
        options
      );
      if (response.status === 200) {
        toast({
          title: "You're in!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsParticipant(true);
      } else {
        toast({
          title: "Error while joining competition",
          status: "error",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
      }
    } catch (error) {
      console.error("Error joining competition:", error);
      alert("An error occurred while trying to join the competition.");
    }
  };

  const handleLeaveCompetition = async () => {
    try {
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        data: {
          participant: {
            competition_id: competitionData.competition_id,
            participant_id: session?.userId,
          },
        },
      };
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/participants`,
        options
      );
      if (response.status === 200) {
        toast({
          title: "You've left the competition",
          status: "success",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
        setIsParticipant(false);
      }
    } catch (error) {
      toast({
        title: "Error while leaving competition",
        status: "error",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          marginBottom: "100px",
        },
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading
        as="h1"
        mb={10}
        textAlign="center"
        fontSize={["2xl", "3xl", "4xl"]}
      >
        {competitionData.name}
      </Heading>
      <Box textAlign="center" mb={6}>
        <Button
          colorScheme={isParticipant ? "orange" : "teal"}
          onClick={
            isParticipant ? handleLeaveCompetition : handleJoinCompetition
          }
        >
          {isParticipant ? "Leave Competition" : "Join Competition"}
        </Button>
      </Box>
      {isMobile ? (
        <>
          <Select
            value={selectedTab}
            onChange={(e) => handleTabChange(parseInt(e.target.value))}
            mb={4}
          >
            <option value={0}>Details</option>
            <option value={1}>Exercises</option>
            <option value={2}>Participants</option>
            <option value={3}>Results</option>
          </Select>
          {selectedTab === 0 && (
            <CompetitionDetails
              competitionData={competitionData}
              participants={participants}
            />
          )}
          {selectedTab === 1 && (
            <CompetitionExercises
              competitionId={
                Array.isArray(competitionId)
                  ? competitionId[0]
                  : competitionId ?? ""
              }
              organizerId={""}
            />
          )}
          {selectedTab === 2 && (
            <CompetitionParticipants
              participantsList={participants}
              participantLimit={competitionData.participant_limit}
            />
          )}
          {selectedTab === 3 && (
            <CompetitionResults
              competitionId={competitionId?.toString() ?? ""}
              penaltyTime={competitionData.penalty_time.toString()}
              participants={participants}
              organizerId={competitionData.organizer_id}
            />
          )}
        </>
      ) : (
        <Box
          overflowX="auto"
          css={{
            "&::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none" /* IE and Edge */,
            "scrollbar-width": "none" /* Firefox */,
          }}
        >
          <Tabs
            variant="enclosed"
            colorScheme="teal"
            isFitted
            index={selectedTab}
            onChange={handleTabChange}
          >
            <TabList whiteSpace="nowrap">
              <Tab mr={[2, 4, 20]} minWidth="120px">
                Details
              </Tab>
              <Tab mr={[2, 4, 20]} minWidth="120px">
                Exercises
              </Tab>
              <Tab mr={[2, 4, 20]} minWidth="120px">
                Participants
              </Tab>
              <Tab minWidth="120px">Results</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <CompetitionDetails
                  competitionData={competitionData}
                  participants={participants}
                />
              </TabPanel>
              <TabPanel>
                <CompetitionExercises
                  competitionId={
                    competitionData.competition_id?.toString() ?? ""
                  }
                  organizerId={competitionData.organizer_id}
                />
              </TabPanel>
              <TabPanel>
                <CompetitionParticipants
                  participantsList={participants}
                  participantLimit={competitionData.participant_limit}
                />
              </TabPanel>
              <TabPanel>
                <CompetitionResults
                  competitionId={competitionId?.toString() ?? ""}
                  penaltyTime={competitionData.penalty_time.toString()}
                  participants={participants}
                  organizerId={competitionData.organizer_id}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Container>
  );
};

export default CompetitionPage;
