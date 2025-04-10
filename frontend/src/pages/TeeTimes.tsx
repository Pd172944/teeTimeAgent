import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

interface TeeTime {
  id: number;
  date: string;
  time: string;
  course: {
    id: number;
    name: string;
    location: string;
  };
  status: string;
  number_of_players: number;
}

interface Course {
  id: number;
  name: string;
  location: string;
}

interface TeeTimeFormData {
  course_id: number;
  date: string;
  time: string;
  number_of_players: number;
}

const TeeTimes: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { register, handleSubmit, reset } = useForm<TeeTimeFormData>();

  const { data: teeTimes, isLoading: teeTimesLoading } = useQuery<TeeTime[]>(
    'teeTimes',
    async () => {
      const response = await axios.get('/api/tee-times');
      return response.data;
    }
  );

  const { data: courses } = useQuery<Course[]>('courses', async () => {
    const response = await axios.get('/api/courses');
    return response.data;
  });

  const createTeeTimeMutation = useMutation(
    async (data: TeeTimeFormData) => {
      const response = await axios.post('/api/tee-times', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teeTimes');
        toast({
          title: 'Success',
          description: 'Tee time created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        reset();
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create tee time',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const deleteTeeTimeMutation = useMutation(
    async (id: number) => {
      await axios.delete(`/api/tee-times/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teeTimes');
        toast({
          title: 'Success',
          description: 'Tee time deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete tee time',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const onSubmit = (data: TeeTimeFormData) => {
    createTeeTimeMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'traded':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading>Tee Times</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            Book New Tee Time
          </Button>
        </HStack>

        <Box
          overflowX="auto"
          bg={bgColor}
          borderRadius="lg"
          borderWidth={1}
          borderColor={borderColor}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Course</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Players</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teeTimes?.map((teeTime) => (
                <Tr key={teeTime.id}>
                  <Td>{teeTime.course.name}</Td>
                  <Td>{format(new Date(teeTime.date), 'PPP')}</Td>
                  <Td>{teeTime.time}</Td>
                  <Td>{teeTime.number_of_players}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(teeTime.status)}>
                      {teeTime.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => deleteTeeTimeMutation.mutate(teeTime.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Book New Tee Time</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Course</FormLabel>
                    <Select {...register('course_id')}>
                      <option value="">Select a course</option>
                      {courses?.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      {...register('date')}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Time</FormLabel>
                    <Input
                      type="time"
                      {...register('time')}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Number of Players</FormLabel>
                    <Select {...register('number_of_players')}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    isLoading={createTeeTimeMutation.isLoading}
                  >
                    Book Tee Time
                  </Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default TeeTimes; 