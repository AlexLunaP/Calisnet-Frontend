"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import Link from "next/link";
import CompetitionDTO from "@/Models/competitionDTO";
import { text } from "stream/consumers";
import router from "next/router";

export type CompetitionFormData = {
  name: string;
  description: string;
  date: string;
  location: string;
  participantLimit: number;
  penaltyTime: number;
};

type Props = {
  onSubmitForm(data: CompetitionFormData): void;
  competition?: CompetitionDTO;
};

export const CompetitionForm: React.FC<Props> = ({
  onSubmitForm,
  competition,
}) => {
  const { handleSubmit, register, setValue } = useForm<CompetitionFormData>();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("name", event.target.value);
  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setValue("description", event.target.value);
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("date", event.target.value);
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("location", event.target.value);
  const handleParticipantLimitChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setValue("participantLimit", parseInt(event.target.value));
  const handlePenaltyTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setValue("penaltyTime", parseInt(event.target.value));

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competition]);

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
                />
              </FormControl>
              <FormControl id="location" isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter competition location"
                  required={true}
                  onChange={handleLocationChange}
                />
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
              <FormControl id="partcipantLimit">
                <FormLabel>Participant limit</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter participant limit number"
                  required={false}
                  onChange={handleParticipantLimitChange}
                />
              </FormControl>
              <FormControl id="penaltyTime">
                <FormLabel>Penalty time</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter time added per penalty (seconds)"
                  required={false}
                  onChange={handlePenaltyTimeChange}
                />
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
