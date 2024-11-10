import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/number-input";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { DragEndEvent as DndDragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

interface Exercise {
  exercise_id: string;
  competition_id: string;
  name: string;
  sets: number;
  reps: number;
  execution_order: number;
}

const CompetitionExercises = ({
  competitionId,
  organizerId,
}: {
  competitionId: string;
  organizerId: string;
}) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [exercise, setExercise] = useState({
    exercise_id: "",
    competition_id: competitionId,
    name: "",
    sets: "",
    reps: "",
    execution_order: "",
  });
  const { data: session } = useSession();
  const toast = useToast();

  const fetchExercises = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/exercises?competition_id=${competitionId}`
      );
      const sortedExercises = response.data.sort(
        (a: any, b: any) => a.execution_order - b.execution_order
      );
      setExercises(sortedExercises);
    } catch (error) {
      setExercises([]);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [competitionId]);

  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExercise({ ...exercise, [name]: value });
  };

  useEffect(() => {
    fetchExercises();
  }, [competitionId]);

  const resetNewExercise = () => {
    setExercise({
      exercise_id: "",
      competition_id: competitionId,
      name: "",
      sets: "1",
      reps: "1",
      execution_order: "1",
    });
  };

  const handleAddExercise = async () => {
    const body = {
      exercise: {
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        execution_order: exercise.execution_order,
        competition_id: competitionId,
      },
    };
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/exercises`,
        body,
        options
      );

      if (response?.data?.error) {
        toast({
          title: "Error adding exercise",
          description: response.data.error,
          status: "error",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
      } else if (response.status === 200) {
        toast({
          title: "Exercise added successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
        fetchExercises();
        resetNewExercise();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error adding exercise",
        status: "error",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          marginBottom: "100px",
        },
      });
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      };
      await axios.delete(
        `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/exercises/${exerciseId}`,
        options
      );
      toast({
        title: "Exercise deleted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          marginBottom: "100px",
        },
      });
      fetchExercises();
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error deleting exercise",
        status: "error",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          marginBottom: "100px",
        },
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  type DragEndEvent = DndDragEndEvent;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = exercises.findIndex(
        (exercise) => exercise.id === active.id
      );
      const newIndex = exercises.findIndex(
        (exercise) => exercise.id === over?.id
      );

      const reorderedExercises = arrayMove(exercises, oldIndex, newIndex);

      // Update the execution_order field based on the new order
      const updatedExercises = reorderedExercises.map((exercise, index) => ({
        ...exercise,
        execution_order: index + 1,
      }));

      setExercises(updatedExercises);

      // Update the execution order in the backend
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/competitions/${competitionId}`,
          { exercises: updatedExercises },
          options
        );
      } catch (error) {
        console.error("Error updating exercise order:", error);
        toast({
          title: "Error updating exercise order",
          status: "error",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            marginBottom: "100px",
          },
        });
      }
    }
  };

  const SortableItem = ({
    id,
    exercise,
    onDelete,
  }: {
    id: string;
    exercise: Exercise;
    onDelete: (id: string) => void;
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <Box
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        p={4}
        borderWidth="1px"
        borderRadius="md"
        w="100%"
        bg="brand.50"
        boxShadow="md"
        mb={4}
      >
        <Text fontSize="lg" fontWeight="bold" color="brand.700">
          {exercise.name}
        </Text>
        <Text color="brand.700">{exercise.sets} sets</Text>
        <Text color="brand.700">{exercise.reps} reps</Text>
        <Text color="brand.700">Order: {exercise.execution_order}</Text>
        <Button
          colorScheme="red"
          onClick={() => onDelete(exercise.exercise_id)}
        >
          Delete
        </Button>
      </Box>
    );
  };

  const isOrganizer = session?.userId === organizerId;

  return (
    <VStack spacing={4} align="start" w="full" alignContent={"center"}>
      {isOrganizer && (
        <>
          {isEditing ? (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              w="40%"
              bg="brand.50"
              boxShadow="md"
            >
              Exercise Name
              <Input
                placeholder="Exercise Name"
                required={true}
                name="name"
                value={exercise.name}
                onChange={handleInputChange}
                mb={2}
                w="100%"
              />
              Number of sets
              <NumberInput
                _placeholder="Sets"
                isRequired={true}
                name="sets"
                value={exercise.sets}
                min={1}
                onChange={(valueString, valueNumber) =>
                  setExercise({ ...exercise, sets: String(valueNumber) })
                }
                mb={2}
                w="25%"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              Number of repetitions
              <NumberInput
                _placeholder="Reps"
                isRequired={true}
                name="reps"
                value={exercise.reps}
                min={1}
                onChange={(valueString, valueNumber) =>
                  setExercise({ ...exercise, reps: String(valueNumber) })
                }
                mb={2}
                w="25%"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              Execution order
              <NumberInput
                _placeholder="Execution Order"
                isRequired={true}
                min={1}
                name="execution_order"
                value={exercise.execution_order}
                onChange={(valueString, valueNumber) =>
                  setExercise({
                    ...exercise,
                    execution_order: String(valueNumber),
                  })
                }
                mb={2}
                w="25%"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button
                onClick={handleAddExercise}
                colorScheme="teal"
                mb={2}
                mt={4}
              >
                Add Exercise
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  resetNewExercise();
                }}
                colorScheme="gray"
                ml={10}
                mt={2}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Button
              onClick={() => {
                setIsEditing(true);
                resetNewExercise();
              }}
              colorScheme="teal"
            >
              Add New Exercise
            </Button>
          )}
        </>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises}
          strategy={verticalListSortingStrategy}
        >
          {exercises.map((exercise, _index) => (
            <SortableItem
              key={exercise.id}
              id={exercise.id}
              exercise={exercise}
              onDelete={handleDeleteExercise}
            />
          ))}
        </SortableContext>
      </DndContext>
    </VStack>
  );
};

export default CompetitionExercises;
