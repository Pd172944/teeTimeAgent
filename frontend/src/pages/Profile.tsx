import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
  Divider,
  Text,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  handicap: number;
  preferred_courses: number[];
  notification_preferences: {
    email_notifications: boolean;
    trade_notifications: boolean;
    booking_notifications: boolean;
  };
}

interface ProfileFormData {
  full_name: string;
  handicap: number;
  email_notifications: boolean;
  trade_notifications: boolean;
  booking_notifications: boolean;
}

const Profile: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>(
    'profile',
    async () => {
      const response = await axios.get('/api/users/me');
      return response.data;
    },
    {
      onSuccess: (data) => {
        reset({
          full_name: data.full_name,
          handicap: data.handicap,
          email_notifications: data.notification_preferences.email_notifications,
          trade_notifications: data.notification_preferences.trade_notifications,
          booking_notifications: data.notification_preferences.booking_notifications,
        });
      },
    }
  );

  const updateProfileMutation = useMutation(
    async (data: ProfileFormData) => {
      const response = await axios.put('/api/users/me', {
        full_name: data.full_name,
        handicap: data.handicap,
        notification_preferences: {
          email_notifications: data.email_notifications,
          trade_notifications: data.trade_notifications,
          booking_notifications: data.booking_notifications,
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (profileLoading) {
    return null;
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Profile Settings</Heading>

        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth={1}
          borderColor={borderColor}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input value={user?.email} isReadOnly />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input {...register('full_name')} />
              </FormControl>

              <FormControl>
                <FormLabel>Handicap</FormLabel>
                <NumberInput min={0} max={54}>
                  <NumberInputField {...register('handicap')} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Divider />

              <Text fontWeight="bold">Notification Preferences</Text>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Email Notifications</FormLabel>
                <Switch {...register('email_notifications')} />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Trade Notifications</FormLabel>
                <Switch {...register('trade_notifications')} />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Booking Notifications</FormLabel>
                <Switch {...register('booking_notifications')} />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={updateProfileMutation.isLoading}
              >
                Save Changes
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile; 