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
  Select,
  useColorModeValue,
  Text,
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

interface Trade {
  id: number;
  tee_time: TeeTime;
  status: string;
  offered_by: {
    id: number;
    full_name: string;
  };
  offered_to: {
    id: number;
    full_name: string;
  };
}

interface TradeFormData {
  tee_time_id: number;
  offered_to_id: number;
}

const Trades: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { register, handleSubmit, reset } = useForm<TradeFormData>();

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>(
    'trades',
    async () => {
      const response = await axios.get('/api/trades');
      return response.data;
    }
  );

  const { data: teeTimes } = useQuery<TeeTime[]>('teeTimes', async () => {
    const response = await axios.get('/api/tee-times');
    return response.data;
  });

  const { data: users } = useQuery('users', async () => {
    const response = await axios.get('/api/users');
    return response.data;
  });

  const createTradeMutation = useMutation(
    async (data: TradeFormData) => {
      const response = await axios.post('/api/trades', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trades');
        toast({
          title: 'Success',
          description: 'Trade offer sent successfully',
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
          description: 'Failed to send trade offer',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const updateTradeStatusMutation = useMutation(
    async ({ id, status }: { id: number; status: string }) => {
      await axios.put(`/api/trades/${id}/status`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trades');
        toast({
          title: 'Success',
          description: 'Trade status updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update trade status',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const onSubmit = (data: TradeFormData) => {
    createTradeMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading>Trades</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            Offer Trade
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
                <Th>Tee Time</Th>
                <Th>Offered By</Th>
                <Th>Offered To</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {trades?.map((trade) => (
                <Tr key={trade.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{trade.tee_time.course.name}</Text>
                      <Text>
                        {format(new Date(trade.tee_time.date), 'PPP')} at{' '}
                        {trade.tee_time.time}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>{trade.offered_by.full_name}</Td>
                  <Td>{trade.offered_to.full_name}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(trade.status)}>
                      {trade.status}
                    </Badge>
                  </Td>
                  <Td>
                    {trade.status === 'pending' && (
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() =>
                            updateTradeStatusMutation.mutate({
                              id: trade.id,
                              status: 'accepted',
                            })
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() =>
                            updateTradeStatusMutation.mutate({
                              id: trade.id,
                              status: 'rejected',
                            })
                          }
                        >
                          Reject
                        </Button>
                      </HStack>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Offer Trade</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Tee Time</FormLabel>
                    <Select {...register('tee_time_id')}>
                      <option value="">Select a tee time</option>
                      {teeTimes?.map((teeTime) => (
                        <option key={teeTime.id} value={teeTime.id}>
                          {teeTime.course.name} -{' '}
                          {format(new Date(teeTime.date), 'PPP')} at{' '}
                          {teeTime.time}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Offer To</FormLabel>
                    <Select {...register('offered_to_id')}>
                      <option value="">Select a user</option>
                      {users?.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    isLoading={createTradeMutation.isLoading}
                  >
                    Send Trade Offer
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

export default Trades; 