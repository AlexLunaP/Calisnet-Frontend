import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Input,
  VStack,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";

interface AthletesSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Athlete {
  id: number;
  username: string;
}

const AthletesSearch: React.FC<AthletesSearchProps> = ({ isOpen, onClose }) => {
  const [searchName, setSearchName] = useState("");
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const fetchAthlete = useCallback(
    debounce((name: string) => {
      if (name.length >= 3) {
        setLoading(true);
        axios
          .get(
            `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/username/${name}`
          )
          .then((response) => {
            if (response.status === 200) {
              setAthlete(response.data);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
            setLoading(false);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              toast({
                title: "No athlete was found for that name",
                status: "error",
                duration: 5000,
                isClosable: true,
                containerStyle: {
                  marginBottom: "100px",
                },
              });
              setAthlete(null);
            } else {
              toast({
                title: "Error finding athlete",
                status: "error",
                duration: 5000,
                isClosable: true,
                containerStyle: {
                  marginBottom: "100px",
                },
              });
            }
          });
      } else {
        setAthlete(null);
      }
    }, 500),
    [toast]
  );

  useEffect(() => {
    fetchAthlete(searchName);
  }, [searchName, fetchAthlete]);

  const handleAthleteClick = (username: string) => {
    router.push(`/user/${username}`);
    setSearchName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Search Athletes</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Search by athlete name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            mb={4}
          />
          {loading ? (
            <Spinner size="lg" />
          ) : (
            <VStack spacing={4} align="start" w="full">
              {athlete ? (
                <Box
                  p={4}
                  bg="white"
                  borderRadius="md"
                  boxShadow="md"
                  w="full"
                  cursor="pointer"
                  onClick={() => handleAthleteClick(athlete.username)}
                >
                  <Text fontWeight="bold">{athlete.username}</Text>
                </Box>
              ) : (
                <Text></Text>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AthletesSearch;
