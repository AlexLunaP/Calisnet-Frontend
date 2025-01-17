import React, { useState } from "react";
import {
  Box,
  Text,
  Image,
  VStack,
  HStack,
  Icon,
  Button,
  Input,
  Flex,
  Grid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FaCircle } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Select from "react-select";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const competitionStatusMapping: {
  [key: string]: { icon: IconType; color: string; text: string };
} = {
  Open: { icon: FaCircle, color: "green.500", text: "Open" },
  Started: { icon: FaCircle, color: "yellow.500", text: "Started" },
  Finished: { icon: FaCircle, color: "gray.500", text: "Finished" },
  Cancelled: { icon: FaCircle, color: "red.500", text: "Cancelled" },
};

const statusOptions = Object.entries(competitionStatusMapping).map(
  ([key, { icon, color, text }]) => ({
    value: key,
    label: (
      <HStack>
        <Icon as={icon} color={color} />
        <Text>{text}</Text>
      </HStack>
    ),
  })
);

interface CompetitionDetailsProps {
  competitionData: any;
  participants: any;
}

const CompetitionDetails = ({
  competitionData,
  participants,
}: CompetitionDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [competitionDataState, setCompetitionData] = useState(competitionData);
  const [editedData, setEditedData] = useState({
    date: competitionData?.date,
    status: competitionData?.status,
    location: competitionData?.location,
    description: competitionData?.description,
    participant_limit: competitionData?.participant_limit,
    penalty_time: competitionData?.penalty_time,
  });
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [markerIcon, setMarkerIcon] = useState<L.Icon | null>(null);
  const { data: session } = useSession();
  const status =
    competitionStatusMapping[
      competitionDataState?.status || competitionData?.status
    ];
  const formattedDate = new Date(competitionDataState?.date).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const fetchCompetitionDetails = async () => {
    if (!competitionData?.competition_id) {
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions/${competitionData.competition_id}`
      );
      setCompetitionData(response.data);
      setEditedData(response.data);
    } catch (error) {
      console.error("Error fetching competition data:", error);
      toast({
        title: "Error fetching competition data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchOrganizerDetails = async () => {
    if (!competitionData?.organizer_id) {
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/${competitionData.organizer_id}`
      );
      setOrganizer(response.data);
    } catch (error) {
      console.error("Error fetching organizer details:", error);
      toast({
        title: "Error fetching organizer details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchCompetitionDetails();
    fetchOrganizerDetails();
  }, [competitionData?.competition_id, competitionData?.organizer_id]);

  const handleInputChange = (e: {
    target?: { name: any; value: any };
    name?: any;
    value?: any;
  }) => {
    const { name, value } = e.target ? e.target : e;
    if (name === "status" && value === "Cancelled") {
      setPendingStatus(value);
      setIsAlertOpen(true);
    } else {
      setEditedData({ ...editedData, [name]: value });
    }
  };

  const toast = useToast();

  const handleSave = async () => {
    try {
      const editedDataWithId = {
        ...editedData,
        competition_id: competitionData?.competition_id,
      };
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      };
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions/${competitionData.competition_id}`,
        editedDataWithId,
        options
      );
      setIsEditing(false);
      setCompetitionData(editedDataWithId);
      toast({
        title: "Competition updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchCompetitionDetails();
    } catch (error) {
      console.error("Error updating competition:", error);
      toast({
        title: "Error updating competition",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAlertCancel = () => {
    setIsAlertOpen(false);
    setPendingStatus(null);
  };

  const handleAlertConfirm = () => {
    setIsAlertOpen(false);
    setEditedData({ ...editedData, status: pendingStatus });
    setPendingStatus(null);
  };

  const isOrganizer = session?.userId === competitionData?.organizer_id;

  useEffect(() => {
    const geocodeLocation = async (locationName: String) => {
      try {
        const response = await fetch(
          `https://us1.locationiq.com/v1/search.php?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&q=${locationName}&format=json`
        );
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          setLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });
          setLocationError(null);
        }
      } catch (error) {
        console.error("Failed to geocode location:", error);
        setLocationError("Failed to load map. Please try again later.");
      }
    };

    if (competitionData?.location) {
      geocodeLocation(competitionData?.location);
    }
  }, [competitionData?.location]);

  useEffect(() => {
    // Dynamically import L from leaflet on the client side
    import("leaflet").then((L) => {
      const icon = new L.Icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setMarkerIcon(icon);
    });
  }, []);

  const today = new Date().toISOString().split("T")[0];

  return (
    <VStack
      spacing={4}
      align="center"
      bg="brand.50"
      p={4}
      borderRadius="md"
      boxShadow="md"
      w="full"
    >
      <Image
        src={competitionData?.image ? competitionData?.image : null}
        alt={"competition image"}
        borderRadius="md"
        boxSize="400px"
        objectFit="cover"
      />
      {isEditing ? (
        <Grid
          templateColumns="auto 1fr"
          gap={4}
          w="full"
          maxW="md"
          alignItems="start"
        >
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Date:
            </Text>
          </Text>
          <Input
            name="date"
            type="date"
            value={editedData.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange({
                target: { name: "date", value: e.target.value },
              })
            }
            min={today}
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Status:
            </Text>
          </Text>
          <Select
            name="status"
            value={statusOptions.find(
              (option) => option.value === editedData.status
            )}
            onChange={(selectedOption) =>
              handleInputChange({
                name: "status",
                value: selectedOption?.value,
              })
            }
            options={statusOptions}
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Location:
            </Text>
          </Text>
          <Input
            name="location"
            value={editedData.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange({
                target: { name: "location", value: e.target.value },
              })
            }
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Description:
            </Text>
          </Text>
          <Input
            name="description"
            as="textarea"
            value={editedData.description}
            onChange={handleInputChange}
          />
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Participant Limit:
            </Text>
          </Text>
          <NumberInput
            name="participant_limit"
            min={0}
            value={editedData.participant_limit}
            onChange={(valueAsString, valueAsNumber) =>
              handleInputChange({
                target: { name: "participant_limit", value: valueAsNumber },
              })
            }
          >
            <NumberInputField placeholder="Enter participant limit" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="lg" color="brand.700" textAlign="left">
            <Text as="span" fontWeight="bold">
              Time added per penalty:
            </Text>
          </Text>
          <NumberInput
            name="penalty_time"
            min={0}
            value={editedData.penalty_time}
            onChange={(valueAsString, valueAsNumber) =>
              handleInputChange({
                target: { name: "penalty_time", value: valueAsNumber },
              })
            }
          >
            <NumberInputField placeholder="Enter time added per penalty" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Flex justifyContent="space-between" w="full" gridColumn="span 2">
            <Button onClick={handleEditToggle}>Cancel</Button>
            <Button onClick={handleSave} colorScheme="teal">
              Save
            </Button>
          </Flex>
        </Grid>
      ) : (
        <>
          <Box textAlign="start" mt={8} mb={4}>
            <Text fontSize="lg" color="brand.700">
              <Text as="span" fontWeight="bold">
                Organizer: @
              </Text>
              <a
                href={`/user/${organizer?.username}`}
                style={{ color: "black" }}
              >
                {organizer?.username}
              </a>
            </Text>
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
              <Icon as={status?.icon} color={status?.color} />
              <Text>{status?.text}</Text>
            </HStack>
            <Text fontSize="lg" color="brand.700">
              <Text as="span" fontWeight="bold">
                Description:
              </Text>{" "}
              {competitionData?.description}
            </Text>
            <Text fontSize="lg" color="brand.700">
              <Text as="span" fontWeight="bold">
                Current participants:
              </Text>{" "}
              {participants.length}
              {competitionData?.participant_limit !== 0 && (
                <> / {competitionData?.participant_limit}</>
              )}
            </Text>
            <Text fontSize="lg" color="brand.700">
              <Text as="span" fontWeight="bold">
                Time added per penalty:
              </Text>{" "}
              {competitionData?.penalty_time} seconds
            </Text>
          </Box>
          {isOrganizer && (
            <Button color={"teal"} onClick={handleEditToggle}>
              Edit
            </Button>
          )}
          <Text as="span" fontWeight="bold" mt={8}>
            Location:
          </Text>{" "}
          {competitionData?.location}
          {location && (
            <MapContainer
              center={[location.lat, location.lon]}
              zoom={13}
              style={{
                height: "500px",
                width: "100%",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[location.lat, location.lon]}
                icon={markerIcon ? markerIcon : undefined}
              />
            </MapContainer>
          )}
        </>
      )}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleAlertCancel}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Competition
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text as="span" fontSize="large">
                Are you sure you want to cancel this competition?
              </Text>
              <Text as="span" fontWeight="bold" fontSize={"large"}>
                (Participants will be notified by email)
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleAlertCancel}>
                No
              </Button>
              <Button colorScheme="red" onClick={handleAlertConfirm} ml={3}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default CompetitionDetails;
