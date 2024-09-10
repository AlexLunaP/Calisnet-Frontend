import React, { useState } from "react";
import {
  Box,
  Text,
  Image,
  VStack,
  Link,
  HStack,
  Icon,
  Button,
  Input,
  Select,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FaCircle } from "react-icons/fa6";
import { useSession } from "next-auth/react";

const competitionStatusMapping: {
  [key: string]: { icon: IconType; color: string; text: string };
} = {
  Open: { icon: FaCircle, color: "green.500", text: "Open" },
  Started: { icon: FaCircle, color: "yellow.500", text: "Started" },
  Finished: { icon: FaCircle, color: "gray.500", text: "Finished" },
  Cancelled: { icon: FaCircle, color: "red.500", text: "Cancelled" },
};

interface CompetitionDetailsProps {
  competitionData: any;
  participants: any;
}

const CompetitionDetails = ({
  competitionData,
  participants,
}: CompetitionDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    date: competitionData.date,
    status: competitionData.status,
    location: competitionData.location,
    description: competitionData.description,
    participant_limit: competitionData.participant_limit,
    penalty_time: competitionData.penalty_time,
  });
  const { data: session } = useSession();
  const status = competitionStatusMapping[competitionData.status];
  const formattedDate = new Date(competitionData.date).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const isOrganizer = session?.userId === competitionData.organizer_id;

  return (
    <VStack
      spacing={4}
      align="start"
      bg="brand.50"
      p={4}
      borderRadius="md"
      boxShadow="md"
      w="full"
    >
      <Image
        src={competitionData.image}
        alt={competitionData.name}
        borderRadius="md"
      />
      {isEditing ? (
        <Grid templateColumns="auto 1fr" gap={4} w="full" maxW="md">
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Date:
            </Text>
          </Text>
          <Input
            name="date"
            type="date"
            value={editedData.date}
            onChange={handleInputChange}
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Status:
            </Text>
          </Text>
          <Select
            name="status"
            value={editedData.status}
            onChange={handleInputChange}
          >
            <option value="Open">Open</option>
            <option value="Started">Started</option>
            <option value="Finished">Finished</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Location:
            </Text>
          </Text>
          <Input
            name="location"
            value={editedData.location}
            onChange={handleInputChange}
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Description:
            </Text>
          </Text>
          <Input
            name="description"
            value={editedData.description}
            onChange={handleInputChange}
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Participant Limit:
            </Text>
          </Text>
          <Input
            name="participant_limit"
            type="number"
            value={editedData.participant_limit}
            onChange={handleInputChange}
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Time added per penalty:
            </Text>
          </Text>
          <Input
            name="penalty_time"
            type="number"
            value={editedData.penalty_time}
            onChange={handleInputChange}
          />
          <Flex justifyContent="space-between" w="full" gridColumn="span 2">
            <Button onClick={handleEditToggle}>Cancel</Button>
            <Button onClick={handleSave} colorScheme="teal">
              Save
            </Button>
          </Flex>
        </Grid>
      ) : (
        <>
          <Text fontSize="lg" color="brand.700">
            <Text as="span" fontWeight="bold">
              Date:
            </Text>{" "}
            {formattedDate}
          </Text>
          <HStack fontSize="lg" color="brand.700">
            <Text as="span" fontWeight="bold">
              Status:
            </Text>{" "}
            <Icon as={status.icon} color={status.color} />
            <Text>{status.text}</Text>
          </HStack>
          <Link
            fontSize="lg"
            color="brand.700"
            href={`https://www.google.com/maps/search/${competitionData.location}`}
            isExternal
          >
            <Text as="span" fontWeight="bold">
              Location:
            </Text>{" "}
            {competitionData.location}
          </Link>
          <Text fontSize="lg" color="brand.700">
            <Text as="span" fontWeight="bold">
              Description:
            </Text>{" "}
            {competitionData.description}
          </Text>
          <Text fontSize="lg" color="brand.700">
            <Text as="span" fontWeight="bold">
              Current participants:
            </Text>{" "}
            {participants.length}
            {competitionData.participant_limit !== 0 && (
              <> / {competitionData.participant_limit}</>
            )}
          </Text>
          <Text fontSize="lg" color="brand.700">
            <Text as="span" fontWeight="bold">
              Time added per penalty:
            </Text>{" "}
            {competitionData.penalty_time} seconds
          </Text>
          {isOrganizer && (
            <Button color={"teal"} onClick={handleEditToggle}>
              Edit
            </Button>
          )}
        </>
      )}
    </VStack>
  );
};

export default CompetitionDetails;
