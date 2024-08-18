import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import UserDTO from "../../Models/userDTO";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  InputRightElement,
  InputGroup,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export type LogInFormData = {
  userEmail: string;
  userPassword: string;
};

type Props = {
  onSubmitForm(data: LogInFormData): void;
  user?: UserDTO;
};

export const LogInForm: React.FC<Props> = ({ onSubmitForm, user }) => {
  const { handleSubmit, register, setValue } = useForm<LogInFormData>();
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("userEmail", event.target.value);
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("userPassword", event.target.value);

  useEffect(() => {
    register("userEmail", { required: true });
    register("userPassword", { required: true });
    if (user) {
      setValue("userEmail", user.userEmail);
      setValue("userPassword", user.userPassword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"lightGray"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6} minH={"100vh"}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} color={"charcoalGray"}>
            Sign in to Calisnet
          </Heading>
        </Stack>
        <Box rounded={"lg"} bg={"white"} boxShadow={"lg"} p={8}>
          <form onSubmit={handleSubmit((userData) => onSubmitForm(userData))}>
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel color={"charcoalGray"}>Email address</FormLabel>
                <Input
                  type="email"
                  required={true}
                  onChange={handleEmailChange}
                />
              </FormControl>
              <FormControl id="password">
                <FormLabel color={"charcoalGray"}>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    required={true}
                    onChange={handlePasswordChange}
                  />
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10}>
                <Button
                  type="submit"
                  bg={"warmYellow"}
                  color={"white"}
                  _hover={{
                    bg: "deepOrange",
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};
