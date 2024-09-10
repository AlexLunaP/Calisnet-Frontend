import React, { useCallback } from "react";
import { signIn } from "next-auth/react";
import Router from "next/router";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

import {
  CompetitionForm,
  CompetitionFormData,
} from "@/Components/Competition/CompetitionForm";

export default function CreateCompetition() {
  const toast = useToast();
  const { data: session } = useSession();
  const { NEXT_PUBLIC_CALISNET_API_URL } = process.env;

  const onCreateCompetition = useCallback(
    async (competitionData: CompetitionFormData) => {
      const competitionId = uuidv4();
      const body = {
        competition: {
          competition_id: competitionId,
          organizer_id: session?.userId,
          name: competitionData.name,
          description: competitionData.description,
          date: competitionData.date,
          location: competitionData.location,
          participant_limit: competitionData.participantLimit,
          penalty_time: competitionData.penaltyTime,
        },
      };
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      };

      console.log("Request Body:", body);
      console.log("Request Options:", options);

      try {
        const result = await axios.post(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competition/create/`,
          body,
          options
        );

        if (result?.data?.error) {
          toast({
            title: "Error creating competition",
            description: result.data.error,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else if (result.status === 200) {
          toast({
            title: "Competition was created",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          Router.push(`/competition/${competitionId}`);
        }
      } catch (error: any) {
        console.error("Error creating competition:", error);
        toast({
          title: "Error creating competition",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [session?.access_token, session?.userId, toast]
  );

  return <CompetitionForm onSubmitForm={onCreateCompetition} />;
}
