import React, { useCallback } from "react";
import { signIn } from "next-auth/react";
import Router from "next/router";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@chakra-ui/react";

import { SignUpForm, SignUpFormData } from "../components/SignUp/SignUpForm";

export default function SignUp() {
  const toast = useToast();

  const onSignUp = useCallback(
    async (userData: SignUpFormData) => {
      const body = { user: { userId: uuidv4(), ...userData } };
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/user/create/`,
        body
      );

      if (result?.data?.error) {
        toast({
          title: "User already exists",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else if (result?.data?.ok) {
        toast({
          title: "User was registered",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        Router.push("/");
        signIn("credentials", { redirect: false, ...userData });
        Router.push("/");
      }
    },
    [toast]
  );

  return <SignUpForm onSubmitForm={onSignUp} />;
}