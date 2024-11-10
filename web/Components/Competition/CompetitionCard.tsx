import React, { useEffect, useState } from "react";
import { Box, Flex, Icon, chakra, Skeleton, Image } from "@chakra-ui/react";
import { useRouter } from "next/router";
import axios from "axios";
import { signOut } from "next-auth/react";
import { FaCircle, FaLocationPin, FaCalendar } from "react-icons/fa6";
import { IconType } from "react-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CompetitionData {
  competitionId: string;
  organizerId: string;
  date: string;
  description: string;
  image: string;
  location: string;
  name: string;
  participantLimit: number;
  penaltyTime: number;
  status: string;
}

interface CompetitionCardProps {
  competitionId: string;
}

const competitionStatusMapping: {
  [key: string]: { icon: IconType; color: string; text: string };
} = {
  Open: { icon: FaCircle, color: "green.500", text: "Open" },
  Started: { icon: FaCircle, color: "yellow.500", text: "Started" },
  Finished: { icon: FaCircle, color: "gray.500", text: "Finished" },
  Cancelled: { icon: FaCircle, color: "red.500", text: "Cancelled" },
};

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competitionId }) => {
  const { NEXT_PUBLIC_CALISNET_API_URL } = process.env;
  const [competitionData, setCompetitionData] =
    useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (competitionId) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions/${competitionId}`
        )
        .then((response) => {
          console.log(response.data);
          const data = response.data;
          setCompetitionData({
            competitionId: data.competition_id || "",
            organizerId: data.organizer_id || "",
            date: data.date || "",
            description: data.description || "",
            image: data.image || "",
            location: data.location || "",
            name: data.name || "",
            participantLimit: data.participant_limit || 0,
            penaltyTime: data.penalty_time || 0,
            status: data.status || "",
          });
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          if (error.response) {
            if (error.response.status >= 400) {
              router.push("/login");
              signOut({ callbackUrl: "/login" });
            }
          }
        });
    } else {
      setLoading(false);
    }
  }, [NEXT_PUBLIC_CALISNET_API_URL, router, competitionId]);

  if (loading) {
    return <Skeleton height="100vh" />;
  }

  if (!competitionData) {
    return <div>Competition not found</div>;
  }

  if (loading) {
    return (
      <Flex
        bg="white"
        _dark={{
          bg: "#3e3e3e",
        }}
        p={50}
        w="full"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          w="sm"
          mx="auto"
          bg="white"
          _dark={{
            bg: "gray.800",
          }}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
          p={6}
        >
          <Skeleton height="224px" mb="4" />{" "}
          <Skeleton height="24px" mb="2" width="60%" />
          <Skeleton height="20px" mb="4" width="80%" />
          <Skeleton height="16px" mb="4" width="100%" />
          <Skeleton height="32px" mb="2" width="50%" />
          <Skeleton height="32px" mb="2" width="50%" />
          <Skeleton height="32px" mb="2" width="50%" />
        </Box>
      </Flex>
    );
  }
  const handleCardClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const competitionId = competitionData?.competitionId || "";
    router.push(`/competitions/${competitionId}`);
  };

  const formattedDate = competitionData?.date
    ? format(new Date(competitionData.date), "dd MMMM yyyy", { locale: es })
    : "";

  return (
    <Flex
      bg="white"
      _dark={{
        bg: "#3e3e3e",
      }}
      p={50}
      w={{ base: "full", md: "sm" }}
      alignItems="center"
      justifyContent="center"
    >
      <Box
        w={{ base: "full", md: "sm" }}
        mx="auto"
        bg="white"
        _dark={{
          bg: "gray.800",
        }}
        shadow="lg"
        rounded="lg"
        overflow="hidden"
        onClick={handleCardClick}
        cursor="pointer"
        _hover={{
          transform: "scale(1.05)",
          boxShadow: "xl",
        }}
        transition="all 0.3s ease-in-out"
      >
        {competitionData?.image ? (
          <Image
            src={competitionData.image}
            alt="competition image"
            width={400}
            height={200}
            objectFit="cover"
            objectPosition="center"
          />
        ) : (
          <Image
            src="/competition_placeholder.svg"
            alt="default place image"
            width={400}
            height={200}
            objectFit="cover"
            objectPosition="center"
          />
        )}
        <Box py={4} px={6}>
          <chakra.h1
            fontSize="xl"
            fontWeight="bold"
            color="gray.800"
            _dark={{
              color: "white",
            }}
          >
            {competitionData?.name}
          </chakra.h1>

          <Flex
            alignItems="center"
            mt={4}
            color="gray.700"
            _dark={{
              color: "gray.200",
            }}
          >
            <Icon as={FaCalendar} h={6} w={6} mr={6} mb={1} />
            <chakra.p fontSize="md">{formattedDate}</chakra.p>
          </Flex>

          {competitionData?.location && (
            <Flex
              alignItems="center"
              mt={4}
              color="gray.700"
              _dark={{
                color: "gray.200",
              }}
            >
              <a
                href={`https://www.google.com/maps/search/${competitionData.location}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon as={FaLocationPin} h={6} w={6} mr={4} />
              </a>
              <chakra.h1 px={2} fontSize="md">
                {competitionData.location}
              </chakra.h1>
            </Flex>
          )}

          {competitionData?.status && (
            <Flex
              alignItems="center"
              mt={4}
              color="gray.700"
              _dark={{
                color: "gray.200",
              }}
            >
              <Icon
                as={competitionStatusMapping[competitionData.status]?.icon}
                h={6}
                w={6}
                mr={4}
                color={competitionStatusMapping[competitionData.status]?.color}
              />
              <chakra.h1 px={2} fontSize="md">
                {competitionStatusMapping[competitionData.status]?.text}
              </chakra.h1>
            </Flex>
          )}
        </Box>
      </Box>
    </Flex>
  );
};
export default CompetitionCard;
