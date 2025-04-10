import React from 'react';
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
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';

interface Course {
  id: number;
  name: string;
  location: string;
  website: string;
  booking_url: string;
}

interface CourseFormData {
  name: string;
  location: string;
  website: string;
  booking_url: string;
}

const Courses: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { register, handleSubmit, reset } = useForm<CourseFormData>();

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>(
    'courses',
    async () => {
      const response = await axios.get('/api/courses');
      return response.data;
    }
  );

  const createCourseMutation = useMutation(
    async (data: CourseFormData) => {
      const response = await axios.post('/api/courses', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courses');
        toast({
          title: 'Success',
          description: 'Course added successfully',
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
          description: 'Failed to add course',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const deleteCourseMutation = useMutation(
    async (id: number) => {
      await axios.delete(`/api/courses/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courses');
        toast({
          title: 'Success',
          description: 'Course deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete course',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const onSubmit = (data: CourseFormData) => {
    createCourseMutation.mutate(data);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading>Golf Courses</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            Add Course
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
                <Th>Name</Th>
                <Th>Location</Th>
                <Th>Website</Th>
                <Th>Booking URL</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses?.map((course) => (
                <Tr key={course.id}>
                  <Td>{course.name}</Td>
                  <Td>{course.location}</Td>
                  <Td>
                    <Link href={course.website} isExternal color="blue.500">
                      Visit Website
                    </Link>
                  </Td>
                  <Td>
                    <Link href={course.booking_url} isExternal color="blue.500">
                      Book Tee Time
                    </Link>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => deleteCourseMutation.mutate(course.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Golf Course</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Course Name</FormLabel>
                    <Input {...register('name')} />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input {...register('location')} />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Website</FormLabel>
                    <Input {...register('website')} type="url" />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Booking URL</FormLabel>
                    <Input {...register('booking_url')} type="url" />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    isLoading={createCourseMutation.isLoading}
                  >
                    Add Course
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

export default Courses; 