import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Skeleton,
} from "@chakra-ui/react";
import UserProfileCard from "@/Components/User/UserProfileCard";
import CompetitionHistoryTable from "@/Components/User/CompetitionHistoryTable";
import AchievementsTable from "@/Components/User/AchievementsTable";
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

const Profile: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/user/get_by_username/${username}`
          );
          console.log("Fetched user data:", response.data); // Log the entire response data
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
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [username]);

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

  return (
    <Box p={2}>
      <Flex justifyContent="flex-start">
        <UserProfileCard username={userData?.username ?? ""} />
      </Flex>

      {/* Tabs for Sections */}
      <Tabs variant="enclosed">
        <TabList mb="1em">
          <Tab
            sx={{
              color: "black",
            }}
          >
            Competition History
          </Tab>
          <Tab
            sx={{
              color: "black",
            }}
          >
            Achievements
          </Tab>
        </TabList>
        <TabPanels>
          {/* Competition History Section */}
          <TabPanel>
            <CompetitionHistoryTable
              username={Array.isArray(username) ? username[0] : username ?? ""}
            />
          </TabPanel>
          {/* Achievements Section */}
          <TabPanel>
            <AchievementsTable
              username={Array.isArray(username) ? username[0] : username ?? ""}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Profile;
