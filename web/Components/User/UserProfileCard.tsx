import {
  Flex,
  Box,
  Image,
  Icon,
  chakra,
  Avatar,
  Skeleton,
  Link,
} from "@chakra-ui/react";

import { EmailIcon } from "@chakra-ui/icons";
import { FaSquareXTwitter, FaSquareInstagram } from "react-icons/fa6";
import { BiWorld } from "react-icons/bi";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

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

interface UserProfileCardProps {
  user_id: string;
  username: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user_id,
  username,
}) => {
  const { NEXT_PUBLIC_CALISNET_API_URL } = process.env;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (username) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/user/get_by_username/${username}`
        )
        .then((response) => {
          console.log(response.data);
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
  }, [NEXT_PUBLIC_CALISNET_API_URL, router, username]);

  if (loading) {
    return (
      <Flex
        bg="white"
        _dark={{
          bg: "#3e3e3e",
        }}
        p={50}
        w="full"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          w="sm"
          mx="auto"
          bg="white"
          _dark={{
            bg: "gray.800",
          }}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
          p={6}
        >
          <Skeleton height="224px" mb="4" />{" "}
          <Skeleton height="24px" mb="2" width="60%" />
          <Skeleton height="20px" mb="4" width="80%" />
          <Skeleton height="16px" mb="4" width="100%" />
          <Skeleton height="32px" mb="2" width="50%" />
          <Skeleton height="32px" mb="2" width="50%" />
          <Skeleton height="32px" mb="2" width="50%" />
        </Box>
      </Flex>
    );
  }
  console.log("User data in render:", userData);

  return (
    <Flex
      bg="white"
      _dark={{
        bg: "#3e3e3e",
      }}
      p={50}
      w="full"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        w="sm"
        mx="auto"
        bg="white"
        _dark={{
          bg: "gray.800",
        }}
        shadow="lg"
        rounded="lg"
        overflow="hidden"
      >
        {userData?.profileImageUrl ? (
          <Link href={`/user/${userData?.username}`}>
            <Image
              w="full"
              h="full"
              fit="cover"
              objectPosition="center"
              src={userData.profileImageUrl}
              alt="avatar"
              style={{
                imageRendering: "auto", // Using 'auto' for smooth rendering
                transform: "scale(1)", // Ensure no scaling is applied
              }}
              cursor="pointer"
            />
          </Link>
        ) : (
          <Flex
            w="full"
            h="full"
            alignItems="center"
            justifyContent="center"
            bg="gray.200"
          >
            <Avatar size="2xl" />
          </Flex>
        )}
        <Flex alignItems="center" px={6} py={3} bg="charcoalGray">
          <chakra.h1 color="white" fontWeight="bold" fontSize="lg">
            @{userData?.username}
          </chakra.h1>
        </Flex>
        <Box py={4} px={6}>
          <chakra.h1
            fontSize="xl"
            fontWeight="bold"
            color="gray.800"
            _dark={{
              color: "white",
            }}
          >
            {userData?.fullName}
          </chakra.h1>

          <chakra.p
            py={2}
            color="gray.700"
            _dark={{
              color: "gray.400",
            }}
          >
            {userData?.bio}
          </chakra.p>

          {userData?.socialLinks.instagram && (
            <Flex
              alignItems="center"
              mt={4}
              color="gray.700"
              _dark={{
                color: "gray.200",
              }}
            >
              <a
                href={`https://instagram.com/${userData.socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon as={FaSquareInstagram} h={8} w={8} mr={4} />
              </a>
              <chakra.h1 px={2} fontSize="md">
                @{userData?.socialLinks.instagram}
              </chakra.h1>
            </Flex>
          )}

          {userData?.socialLinks.x && (
            <Flex
              alignItems="center"
              mt={4}
              color="gray.700"
              _dark={{
                color: "gray.200",
              }}
            >
              <a
                href={`https://x.com/${userData.socialLinks.x}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon as={FaSquareXTwitter} h={8} w={8} mr={4} />
              </a>
              <chakra.h1 px={2} fontSize="md">
                @{userData?.socialLinks.x}
              </chakra.h1>
            </Flex>
          )}

          {userData?.socialLinks.email && (
            <Flex
              alignItems="center"
              mt={4}
              color="gray.700"
              _dark={{
                color: "gray.200",
              }}
            >
              <a
                href={`mailto:${userData?.socialLinks.email}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon as={EmailIcon} h={8} w={8} mr={4} />
              </a>
              <chakra.h1 px={2} fontSize="md">
                {userData?.socialLinks.email || "user@example.com"}
              </chakra.h1>
            </Flex>
          )}

          {userData?.socialLinks.website && (
            <Flex
              alignItems="center"
              mt={4}
              color="gray.700"
              _dark={{
                color: "gray.200",
              }}
            >
              <a
                href={userData?.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon as={BiWorld} h={8} w={8} mr={4} />
              </a>
              <chakra.h1 px={2} fontSize="md">
                {userData?.socialLinks.website || "https://yourwebsite.com"}
              </chakra.h1>
            </Flex>
          )}
        </Box>
      </Box>
    </Flex>
  );
};
export default UserProfileCard;
