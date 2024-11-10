"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import CompetitionDTO from "@/Models/competitionDTO";
import router from "next/router";
import LocationAutocomplete from "@/Components/Location/LocationAutocomplete";

export type CompetitionFormData = {
  name: string;
  description: string;
  date: string;
  location: string;
  participantLimit: number;
  penaltyTime: number;
  image?: string;
};

interface Suggestion {
  display_name: string;
  lat: number;
  lon: number;
}

type Props = {
  onSubmitForm(data: CompetitionFormData): void;
  competition?: CompetitionDTO;
};

export const CompetitionForm: React.FC<Props> = ({
  onSubmitForm,
  competition,
}) => {
  const { handleSubmit, register, setValue, watch } =
    useForm<CompetitionFormData>();
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Suggestion | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [markerIcon, setMarkerIcon] = useState<L.Icon | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("name", event.target.value);
  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setValue("description", event.target.value);
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("date", event.target.value);
  const handleLocationChange = (address: string) => {
    setAddress(address);
    setValue("location", address);
  };
  const handleParticipantLimitChange = (valueString: string) =>
    setValue("participantLimit", parseInt(valueString));
  const handlePenaltyTimeChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => setValue("penaltyTime", valueAsNumber);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    register("name", { required: true });
    register("date", { required: true });
    register("location", { required: true });
    if (competition) {
      setValue("name", competition.name);
      setValue("date", competition.date);
      setValue("location", competition.location);
      setValue("participantLimit", competition.participantLimit);
      setValue("penaltyTime", competition.penaltyTime);
      setValue("description", competition.competitionDescription);
      setValue("image", competition.image);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competition]);

  const participantLimit = watch("participantLimit", 0);
  const penaltyTime = watch("penaltyTime", 0);

  const today = new Date().toISOString().split("T")[0];

  const handleLocationSelect = (suggestion: Suggestion) => {
    setAddress(suggestion.display_name);
    setLocation(suggestion);
    setValue("location", suggestion.display_name);
  };

  return (
    <Flex minH={"10vh"} align={"center"} justify={"center"} bg={"lightGray"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6} minH={"100vh"}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"} color={"charcoalGray"}>
            Create a new competition
          </Heading>
        </Stack>
        <Box rounded={"lg"} bg={"white"} boxShadow={"lg"} p={8}>
          <form
            onSubmit={handleSubmit((competitionData) =>
              onSubmitForm(competitionData)
            )}
          >
            <Stack spacing={4}>
              <Box>
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter competition name"
                    required={true}
                    onChange={handleNameChange}
                  />
                </FormControl>
              </Box>
              <FormControl id="date" isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  required={true}
                  onChange={handleDateChange}
                  min={today}
                />
              </FormControl>
              <FormControl id="location" isRequired>
                <FormLabel>Location</FormLabel>
                <LocationAutocomplete onSelect={handleLocationSelect} />
              </FormControl>
              <FormControl id="description" isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  as="textarea"
                  mt={1}
                  rows={6}
                  size={"lg"}
                  shadow="sm"
                  focusBorderColor="brand.400"
                  fontSize="md"
                  w="full"
                  placeholder="Enter competition description"
                  required={false}
                  onChange={handleDescriptionChange}
                />
              </FormControl>
              <FormControl id="participantLimit">
                <FormLabel>Participant limit</FormLabel>
                <NumberInput
                  min={0}
                  value={participantLimit}
                  onChange={handleParticipantLimitChange}
                >
                  <NumberInputField placeholder="Enter participant limit number" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl id="penaltyTime">
                <FormLabel>Time added per penalty (seconds)</FormLabel>
                <NumberInput
                  min={0}
                  value={penaltyTime}
                  onChange={handlePenaltyTimeChange}
                >
                  <NumberInputField placeholder="Enter participant limit number" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="md" fontWeight="md" color="gray.700">
                  Image
                </FormLabel>
                <Flex alignItems="center" mt={1}>
                  {image && (
                    <Image
                      boxSize={114}
                      src={image}
                      alt="Competition Image"
                      mr={4}
                    />
                  )}
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => fileInputRef.current!.click()}
                  >
                    Add image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </Flex>
              </FormControl>
              <Stack spacing={8} pt={2} mt={4} direction="row" justify="center">
                <Button
                  w={"fit-content"}
                  loadingText="Submitting"
                  size="lg"
                  bg={"warmYellow"}
                  color={"white"}
                  _hover={{
                    bg: "deepOrange",
                  }}
                  type="submit"
                >
                  Create competition
                </Button>
                <Button
                  w={"fit-content"}
                  size="lg"
                  bg={"gray.300"}
                  color={"black"}
                  _hover={{
                    bg: "gray.400",
                  }}
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};
