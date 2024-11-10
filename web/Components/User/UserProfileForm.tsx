import {
  Box,
  SimpleGrid,
  GridItem,
  Heading,
  chakra,
  Stack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  Input,
  Textarea,
  FormHelperText,
  Flex,
  Avatar,
  Icon,
  Button,
  VisuallyHidden,
  Divider,
  Select,
  Text,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

interface UserData {
  userId: string;
  username: string;
  userEmail: string;
  fullName: string;
  bio: string;
  socialLinks: {
    website: string;
    instagram: string;
    x: string;
    email: string;
  };
  profileImageUrl: string;
}

const UserProfileForm = () => {
  const { data: session, status } = useSession();
  const { NEXT_PUBLIC_CALISNET_API_URL } = process.env;
  const [userData, setUserData] = useState<UserData>({
    userId: "",
    username: "",
    userEmail: "",
    fullName: "",
    bio: "",
    socialLinks: {
      website: "",
      instagram: "",
      x: "",
      email: "",
    },
    profileImageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  interface SocialLinks {
    [key: string]: string;
  }

  const placeholders = {
    Email: "Your email address",
    X: "Your X (Twitter) username",
    Instagram: "Your Instagram username",
    Other: "URL for any other website",
  };

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    email: "",
    x: "", // formerly Twitter
    instagram: "",
    other: "",
  });

  const [profileImage, setProfileImage] = useState(
    userData?.profileImageUrl || ""
  );

  const handleInputChange = (name: string, value: string) => {
    setSocialLinks((prevLinks) => ({
      ...prevLinks,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (session) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/${session.userId}`
        )
        .then((response) => {
          const data = response.data;
          setUserData({
            userId: data.user_id || "",
            username: data.username || "",
            userEmail: data.user_email || "",
            profileImageUrl: data.profile_image_url || "",
            fullName: data.full_name || "",
            bio: data.bio || "",
            socialLinks: {
              website: data.social_links?.website || "",
              instagram: data.social_links?.instagram || "",
              x: data.social_links?.x || "",
              email: data.social_links?.email || "",
            },
          });
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          if (error.response) {
            if (error.response.status >= 400) {
              router.push("/login");
              signOut({ callbackUrl: "/login" });
            }
          }
        });
    } else {
      setLoading(false);
    }
  }, [NEXT_PUBLIC_CALISNET_API_URL, router, session]);

  useEffect(() => {
    if (userData) {
      setSocialLinks({
        email: userData.socialLinks?.email || "",
        x: userData.socialLinks?.x || "",
        instagram: userData.socialLinks?.instagram || "",
        other: userData.socialLinks?.website || "",
      });
    }
  }, [userData]);

  const handleProfileImageChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      full_name: userData?.fullName || "",
      bio: userData?.bio || "",
      social_links: socialLinks,
      profile_image_url: profileImage,
    };

    try {
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      };
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/${session?.userId}/`,
        updatedData,
        options
      );
      if (response.status === 200) {
        toast({
          title: "Profile updated",
          status: "success",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
      }
    } catch (error) {
      toast({
        title: "Error while updating profile",
        status: "error",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          marginBottom: "100px",
        },
      });
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center">
        <Box rounded="md" overflow="hidden" w="sm" mx="auto" p={6}>
          <Stack spacing={6}>
            <Skeleton height="32px" width="50%" />
            <Flex alignItems="center">
              <Skeleton boxSize="114px" borderRadius="full" />
              <Skeleton height="40px" width="100px" ml={5} />
            </Flex>
            <Skeleton height="32px" width="70%" />
            <Skeleton height="24px" />
            <Skeleton height="150px" />
            <Skeleton height="32px" width="50%" />
            <Skeleton height="32px" width="80%" />
            <Skeleton height="40px" width="100px" alignSelf="flex-end" />
          </Stack>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex justifyContent="center" alignItems="center">
      <Box rounded="md" overflow="hidden">
        <chakra.form
          method="POST"
          rounded="md"
          w={"fit-content"}
          onSubmit={handleSave}
        >
          <Stack px={6} py={7} spacing={6} rounded={"md"}>
            <FormControl>
              <FormLabel fontSize="md" fontWeight="md" color="gray.700">
                Photo
              </FormLabel>
              <Flex alignItems="center" mt={1}>
                <Avatar
                  boxSize={114}
                  bg="gray.200"
                  src={userData?.profileImageUrl}
                />
                <Button
                  ml={5}
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current!.click()}
                >
                  Change
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                />
              </Flex>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="md" fontWeight="md" color="gray.700">
                Name
              </FormLabel>
              <Input
                value={userData?.fullName || ""}
                onChange={(e) =>
                  setUserData({ ...userData, fullName: e.target.value })
                }
                placeholder="Your name"
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                mt={1}
                focusBorderColor="brand.400"
                shadow="sm"
                size="md"
                w="full"
                rounded="md"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="md" fontWeight="md" color="gray.700">
                Bio
              </FormLabel>
              <Input
                value={userData?.bio || ""}
                onChange={(e) =>
                  setUserData({ ...userData, bio: e.target.value })
                }
                as="textarea"
                placeholder="Brief description for your profile"
                mt={1}
                rows={6}
                size={"lg"}
                shadow="sm"
                focusBorderColor="brand.400"
                fontSize="md"
                w="full"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="md" fontWeight="md" color="gray.700">
                Social Links
              </FormLabel>
              {Object.entries(socialLinks).map(([name, url], index) => (
                <InputGroup size="md" key={index} mt={2}>
                  <InputLeftAddon
                    bg="gray.50"
                    color="gray.500"
                    rounded="md"
                    w={{ base: "30%", md: "100px" }}
                    fontSize={{ base: "md", md: "sm" }}
                    textAlign="center"
                  >
                    {capitalizeFirstLetter(name)}
                  </InputLeftAddon>
                  <Input
                    value={url}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                    placeholder="username"
                    focusBorderColor="brand.400"
                    rounded="md"
                    w="full"
                    fontSize={{ base: "md", md: "sm" }}
                  />
                </InputGroup>
              ))}
            </FormControl>
          </Stack>
          <Box
            _dark={{
              bg: "#121212",
            }}
            textAlign="center"
          >
            <Button
              type="submit"
              bg={"warmYellow"}
              _hover={{
                bg: "deepOrange",
              }}
              fontWeight="md"
            >
              Update
            </Button>
          </Box>
        </chakra.form>
      </Box>
    </Flex>
  );
};

export default UserProfileForm;
