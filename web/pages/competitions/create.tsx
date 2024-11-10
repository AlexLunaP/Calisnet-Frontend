import React, { useCallback } from "react";
import Router from "next/router";
import axios from "axios";
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
      const body = {
        competition: {
          organizer_id: session?.userId,
          name: competitionData.name,
          description: competitionData.description,
          date: competitionData.date,
          location: competitionData.location,
          participant_limit: competitionData.participantLimit,
          penalty_time: competitionData.penaltyTime,
          image: competitionData.image,
        },
      };
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      };

      try {
        const result = await axios.post(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions`,
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
            containerStyle: {
              marginBottom: "100px",
            },
          });
        } else if (result.status === 200) {
          toast({
            title: "Competition was created",
            status: "success",
            duration: 5000,
            isClosable: true,
            containerStyle: {
              marginBottom: "100px",
            },
          });
          Router.push(`/competitions/${result.data}`);
        }
      } catch (error: any) {
        console.error("Error creating competition:", error);
        toast({
          title: "Error creating competition",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
      }
    },
    [session?.access_token, session?.userId, toast]
  );

  return <CompetitionForm onSubmitForm={onCreateCompetition} />;
}
