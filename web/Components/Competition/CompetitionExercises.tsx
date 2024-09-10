import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

const CompetitionExercises = ({
  competitionId,
  organizerId,
}: {
  competitionId: string;
  organizerId: string;
}) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    sets: "",
    reps: "",
    execution_order: "",
  });
  const { data: session } = useSession();

  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/exercise/competition/${competitionId}`
      )
      .then((response) => {
        const sortedExercises = response.data.sort(
          (a: any, b: any) => a.execution_order - b.execution_order
        );
        setExercises(sortedExercises);
      })
      .catch((error) => {
        console.error("Error fetching exercises:", error);
      });
  }, [competitionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExercise({ ...newExercise, [name]: value });
  };

  const handleAddExercise = () => {
    axios
      .post(`${process.env.NEXT_PUBLIC_CALISNET_API_URL}/exercise`, {
        ...newExercise,
        competitionId,
      })
      .then((response) => {
        setExercises([...exercises, response.data]);
        setNewExercise({
          name: "",
          description: "",
          sets: "",
          reps: "",
          execution_order: "",
        });
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error adding exercise:", error);
      });
  };

  const isOrganizer = session?.userId === organizerId;

  return (
    <VStack spacing={4} align="start" w="full">
      {exercises.map((exercise) => (
        <Box
          key={exercise.id}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          w="100%"
          bg="brand.50"
          boxShadow="md"
        >
          <Text fontSize="lg" fontWeight="bold" color="brand.700">
            {exercise.name}
          </Text>
          <Text color="brand.700">{exercise.description}</Text>
          <Text color="brand.700">
            <Text as="span" fontWeight="bold">
              Sets:
            </Text>{" "}
            {exercise.sets}
          </Text>
          <Text color="brand.700">
            <Text as="span" fontWeight="bold">
              Reps:
            </Text>{" "}
            {exercise.reps}
          </Text>
          <Text color="brand.700">
            <Text as="span" fontWeight="bold">
              Execution Order:
            </Text>{" "}
            {exercise.execution_order}
          </Text>
        </Box>
      ))}
      {isOrganizer && (
        <>
          {isEditing ? (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              w="100%"
              bg="brand.50"
              boxShadow="md"
            >
              <Input
                placeholder="Exercise Name"
                name="name"
                value={newExercise.name}
                onChange={handleInputChange}
                mb={2}
              />
              <Input
                placeholder="Description"
                name="description"
                value={newExercise.description}
                onChange={handleInputChange}
                mb={2}
              />
              <Input
                placeholder="Sets"
                name="sets"
                value={newExercise.sets}
                onChange={handleInputChange}
                mb={2}
              />
              <Input
                placeholder="Reps"
                name="reps"
                value={newExercise.reps}
                onChange={handleInputChange}
                mb={2}
              />
              <Input
                placeholder="Execution Order"
                name="execution_order"
                value={newExercise.execution_order}
                onChange={handleInputChange}
                mb={2}
              />
              <Button onClick={handleAddExercise} colorScheme="teal" mr={2}>
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            </Box>
          ) : (
            <Button onClick={() => setIsEditing(true)} colorScheme="teal">
              Add New Exercise
            </Button>
          )}
        </>
      )}
    </VStack>
  );
};

export default CompetitionExercises;
