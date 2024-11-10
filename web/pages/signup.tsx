import React, { useCallback } from "react";
import { signIn } from "next-auth/react";
import Router from "next/router";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@chakra-ui/react";

import { SignUpForm, SignUpFormData } from "@/Components/SignUp/SignUpForm";

export default function SignUp() {
  const toast = useToast();

  const onSignUp = useCallback(
    async (userData: SignUpFormData) => {
      const body = { user: { ...userData } };
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users`,
        body
      );

      if (result.status === 200) {
        toast({
          title: "User was registered",
          status: "success",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
        Router.push("/");
        signIn("credentials", { redirect: false, ...userData });
        Router.push("/");
      } else if (result.status === 400) {
        toast({
          title: "User already exists",
          status: "error",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
      }
    },
    [toast]
  );

  return <SignUpForm onSubmitForm={onSignUp} />;
}
