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
import UserDTO from "../../Models/userDTO";
import { useForm } from "react-hook-form";
import Link from "next/link";

export type SignUpFormData = {
  username: string;
  userEmail: string;
  userPassword: string;
};

type Props = {
  onSubmitForm(data: SignUpFormData): void;
  user?: UserDTO;
};

export const SignUpForm: React.FC<Props> = ({ onSubmitForm, user }) => {
  const { handleSubmit, register, setValue } = useForm<SignUpFormData>();
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("userEmail", event.target.value);
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("userPassword", event.target.value);
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue("username", event.target.value);

  useEffect(() => {
    register("userEmail", { required: true });
    register("userPassword", { required: true });
    register("username", { required: true });
    if (user) {
      setValue("userEmail", user.userEmail);
      setValue("userPassword", user.userPassword);
      setValue("username", user.username);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"lightGray"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6} minH={"100vh"}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"} color={"charcoalGray"}>
            Join Calisnet
          </Heading>
        </Stack>
        <Box rounded={"lg"} bg={"white"} boxShadow={"lg"} p={8}>
          <form onSubmit={handleSubmit((userData) => onSubmitForm(userData))}>
            <Stack spacing={4}>
              <Box>
                <FormControl id="username" isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    required={true}
                    onChange={handleUsernameChange}
                  />
                </FormControl>
              </Box>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  required={true}
                  onChange={handleEmailChange}
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
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
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  bg={"warmYellow"}
                  color={"white"}
                  _hover={{
                    bg: "deepOrange",
                  }}
                  type="submit"
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={"center"}>
                  Already registered?{" "}
                  <Link href="/login" passHref>
                    <Box
                      color={"blue.400"}
                      _hover={{ textDecoration: "underline" }}
                    >
                      Sign in
                    </Box>
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};
