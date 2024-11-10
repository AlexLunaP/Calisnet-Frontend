import React, { useCallback } from "react";
import { signIn } from "next-auth/react";
import Router from "next/router";
import { useToast } from "@chakra-ui/react";

import { LogInForm, LogInFormData } from "../Components/Login/LogInForm";

export default function LogIn() {
  const toast = useToast();

  const onLogIn = useCallback(
    async (userData: LogInFormData) => {
      const result = await signIn("credentials", {
        redirect: false,
        ...userData,
      });

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: "Please check your credentials and try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
      } else if (result?.ok) {
        toast({
          title: "Login successful",
          description: "Welcome back! Redirecting you to the home page.",
          status: "success",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
        Router.push("/");
      }
    },
    [toast]
  );

  return <LogInForm onSubmitForm={onLogIn} />;
}
