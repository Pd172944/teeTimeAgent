import React from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { useQuery } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

interface TeeTime {
  id: number;
  date: string;
  time: string;
  course: {
    name: string;
    location: string;
  };
  status: string;
}

interface Trade {
  id: number;
  tee_time: TeeTime;
  status: string;
  offered_by: {
    full_name: string;
  };
}

const Dashboard: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { data: teeTimes, isLoading: teeTimesLoading } = useQuery<TeeTime[]>(
    'teeTimes',
    async () => {
      const response = await axios.get('/api/tee-times');
      return response.data;
    }
  );

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>(
    'trades',
    async () => {
      const response = await axios.get('/api/trades');
      return response.data;
    }
  );

  const upcomingTeeTimes = teeTimes?.filter(
    (teeTime) => new Date(teeTime.date) > new Date()
  ).slice(0, 3);

  const pendingTrades = trades?.filter(
    (trade) => trade.status === 'pending'
  ).slice(0, 3);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Dashboard</Heading>

        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <Stat
            p={4}
            bg={bgColor}
            borderRadius="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Upcoming Tee Times</StatLabel>
            <StatNumber>{upcomingTeeTimes?.length || 0}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              23.36%
            </StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg={bgColor}
            borderRadius="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Pending Trades</StatLabel>
            <StatNumber>{pendingTrades?.length || 0}</StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              9.05%
            </StatHelpText>
          </Stat>

          <Stat
            p={4}
            bg={bgColor}
            borderRadius="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Total Courses</StatLabel>
            <StatNumber>12</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              12.5%
            </StatHelpText>
          </Stat>
        </Grid>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Box
            p={6}
            bg={bgColor}
            borderRadius="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md">Upcoming Tee Times</Heading>
                <Button
                  as={RouterLink}
                  to="/tee-times"
                  size="sm"
                  colorScheme="blue"
                >
                  View All
                </Button>
              </HStack>
              {upcomingTeeTimes?.map((teeTime) => (
                <Box
                  key={teeTime.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor={borderColor}
                >
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="bold">{teeTime.course.name}</Text>
                    <Text>
                      {format(new Date(teeTime.date), 'PPP')} at {teeTime.time}
                    </Text>
                    <Text color="gray.500">{teeTime.course.location}</Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>

          <Box
            p={6}
            bg={bgColor}
            borderRadius="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md">Pending Trades</Heading>
                <Button
                  as={RouterLink}
                  to="/trades"
                  size="sm"
                  colorScheme="blue"
                >
                  View All
                </Button>
              </HStack>
              {pendingTrades?.map((trade) => (
                <Box
                  key={trade.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor={borderColor}
                >
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="bold">
                      Trade offer from {trade.offered_by.full_name}
                    </Text>
                    <Text>
                      {format(new Date(trade.tee_time.date), 'PPP')} at{' '}
                      {trade.tee_time.time}
                    </Text>
                    <Text color="gray.500">{trade.tee_time.course.name}</Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </Grid>
      </VStack>
    </Container>
  );
};

export default Dashboard; 