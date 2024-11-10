import {
  Box,
  Input,
  VStack,
  Skeleton,
  SimpleGrid,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Center,
  Icon,
} from "@chakra-ui/react";
import { DateRangePicker, createStaticRanges } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import Pagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import CompetitionCard from "./CompetitionCard";
import { FaCalendar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import Fuse from "fuse.js";

interface CompetitionData {
  competition_id: string;
  organizer_id: string;
  date: string;
  description: string;
  image: string;
  location: string;
  name: string;
  participant_limit: number;
  penalty_time: number;
  status: string;
}

const CompetitionsGrid: React.FC = () => {
  const { NEXT_PUBLIC_CALISNET_API_URL } = process.env;
  const [competitions, setCompetitions] = useState<CompetitionData[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<
    CompetitionData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const filterCompetitions = useCallback(() => {
    let filtered = competitions;

    if (dateRange.startDate && dateRange.endDate) {
      filtered = competitions.filter((competition) => {
        const competitionDate = new Date(competition.date);
        return (
          dateRange.startDate &&
          competitionDate >= dateRange.startDate &&
          dateRange.endDate &&
          competitionDate <= dateRange.endDate
        );
      });
    }

    if (searchName) {
      const fuse = new Fuse(filtered, {
        keys: ["name"],
        threshold: 0.3,
      });
      filtered = fuse.search(searchName).map((result) => result.item);
    }

    setFilteredCompetitions(filtered);
  }, [competitions, dateRange, searchName]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions`)
      .then((response) => {
        setCompetitions(response.data);
        setFilteredCompetitions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching competitions:", error);
        setLoading(false);
      });
  }, [NEXT_PUBLIC_CALISNET_API_URL]);

  useEffect(() => {
    filterCompetitions();
  }, [searchName, dateRange, competitions, filterCompetitions]);

  const handleClearDateRange = () => {
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    });
    setFilteredCompetitions(competitions);
    onClose();
  };

  if (loading) {
    return <Skeleton height="100vh" />;
  }

  const itemsPerPage = 6;

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredCompetitions.length / itemsPerPage);

  // Get the current items to display
  const currentItems = filteredCompetitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const customStaticRanges = createStaticRanges([
    {
      label: "Today",
      range: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
    },
    {
      label: "This Week",
      range: () => {
        const start = new Date();
        const end = new Date();
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        return {
          startDate: start,
          endDate: end,
        };
      },
    },
    {
      label: "This Month",
      range: () => {
        const start = new Date();
        const end = new Date();
        start.setDate(1);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        return {
          startDate: start,
          endDate: end,
        };
      },
    },
  ]);

  return (
    <VStack spacing={4} align="start" w="full">
      <Box w="full" p={4} bg="gray.100" borderRadius="md" boxShadow="md">
        <Input
          placeholder="Search by competition name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          mb={4}
        />
        <Button
          onClick={onOpen}
          mb={4}
          leftIcon={<Icon as={FaCalendar} />}
          rightIcon={<Icon as={IoIosArrowDown} />}
        >
          Date
        </Button>
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Date</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Center>
                <Box width={["100%", "650px"]} height={["auto", "300px"]}>
                  <DateRangePicker
                    ranges={[{ ...dateRange, key: "selection" }]}
                    onChange={(ranges) =>
                      setDateRange({
                        startDate: ranges.selection.startDate,
                        endDate: ranges.selection.endDate,
                      })
                    }
                    inputRanges={[]}
                    staticRanges={customStaticRanges}
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="vertical"
                  />
                </Box>
              </Center>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="red"
                mr={3}
                onClick={handleClearDateRange}
                mt={5}
              >
                Clear
              </Button>
              <Button variant="ghost" onClick={onClose} mt={5}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
      <Box p={1}>
        <SimpleGrid columns={[1, 2, 3]} spacing={0}>
          {currentItems.map((competition) => (
            <CompetitionCard
              key={competition.competition_id}
              competitionId={competition.competition_id}
            />
          ))}
        </SimpleGrid>
        <Pagination
          current={currentPage}
          total={totalPages}
          onPageChange={setCurrentPage}
        />
      </Box>
    </VStack>
  );
};

export default CompetitionsGrid;
