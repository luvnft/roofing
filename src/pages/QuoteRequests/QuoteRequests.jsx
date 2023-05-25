import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Flex,
  Text,
  useToast,
  Input,
  useDisclosure,
  FormControl,
  VStack,
  HStack,
  Tooltip,
  Icon,
  Card,
  CardBody,
  Skeleton,
  Box,
  Button,
  Divider
} from '@chakra-ui/react';
import {
  EditEstimateRequestForm,
  NewEstimateRequestForm,
  QuoteRequestTable,
  ConnectedQRDeleteAlertDialog,
  PageHeader,
  LeadFilterBar
} from '../../components';
import supabase from '../../utils/supabaseClient';
import { MdSearch, MdPostAdd, MdFilterAlt, MdFilterList } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';
import { useFetchAllQuoteRequests, useUpdateQRById } from '../../hooks/useAPI/useQuoteRequests';
import { useFetchAllQRStatuses } from '../../hooks/useAPI/useQRStatuses';
import { useFetchAllCustomerTypes } from '../../hooks/useAPI/useCustomerTypes';
import { useFetchAllServices } from '../../hooks/useAPI/useServices';
import { Plus } from 'lucide-react';

const QuoteRequests = () => {
  // React Hook for managing state of quotes request
  // Chakra UI Reacr hook for toasts
  const toast = useToast();
  const { data: quoteRequests, isLoading: isQRLoading } = useFetchAllQuoteRequests();
  const { data: services } = useFetchAllServices();
  const { data: qrStatuses } = useFetchAllQRStatuses();
  // const { customerTypes } = useCustomerTypes();
  const { data: customerTypes } = useFetchAllCustomerTypes();
  const { mutate: mutateUpdateQRById } = useUpdateQRById(toast);

  // Chakra UI Modal
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isNewOpen, onOpen: onNewOpen, onClose: onNewClose } = useDisclosure();
  const initialRef = React.useRef();

  // React Use State to store data from API requests
  // const [quoteRequests, setQuoteRequests] = useState(null);
  const [searchEstimateRequestsInput, setSearchEstimateRequestsInput] = useState('');
  const [selectedEstimateRequestObject, setSelectedEstimateRequestObject] = useState({
    id: '',
    est_request_status_id: '',
    requested_date: '',
    service_type_id: '',
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
    firstName: '',
    lastName: '',
    email: '',
    customer_typeID: '',
    phone_number: ''
  });
  const [selectedEstimateRequestId, setSelectedEstimateRequestId] = useState('');

  // Search for customer quote request
  // const searchEstimateRequest = async (event) => {
  //   event.preventDefault();

  //   if (searchEstimateRequestsInput === '') {
  //     fetchQuoteRequests();
  //   } else {
  //     let { data: qrSearchResult, error } = await supabase
  //       .from('quote_request')
  //       .select(
  //         '*, services:service_type_id(*), customer_type:customer_typeID(*), estimate_request_status:est_request_status_id(*)'
  //       )
  //       .or(
  //         `firstName.ilike.%${searchEstimateRequestsInput}%,lastName.ilike.%${searchEstimateRequestsInput}%,email.ilike.%${searchEstimateRequestsInput}%,phone_number.ilike.%${searchEstimateRequestsInput}%`
  //       );

  //     if (error) {
  //       console.log(error);
  //     }
  //     // console.log(qrSearchResult);
  //     setQuoteRequests(qrSearchResult);
  //   }
  // };

  //Handles edit data
  const handleEdit = (estimate_request) => {
    // setSelectedEstimateRequestObject(estimate_request);
    setSelectedEstimateRequestObject({
      id: estimate_request.id,
      est_request_status_id: estimate_request.est_request_status_id,
      customer_typeID: estimate_request.customer_typeID,
      requested_date: estimate_request.requested_date,
      service_type_id: estimate_request.service_type_id,
      streetAddress: estimate_request.streetAddress,
      city: estimate_request.city,
      state: estimate_request.state,
      zipcode: estimate_request.zipcode,
      firstName: estimate_request.firstName,
      lastName: estimate_request.lastName,
      email: estimate_request.email,
      phone_number: estimate_request.phone_number
    });
    onEditOpen();
  };

  //Handles the cancel button in the modal form for editing QR
  const handleEditCancel = () => {
    setSelectedEstimateRequestObject({
      id: '',
      est_request_status_id: '',
      requested_date: '',
      service_type_id: '',
      streetAddress: '',
      city: '',
      state: '',
      zipcode: '',
      firstName: '',
      lastName: '',
      email: ''
    });
    onEditClose();
  };

  //Handles changes made to the fields made by the user and updates the React State
  const handleEditChange = (e) => {
    setSelectedEstimateRequestObject({
      ...selectedEstimateRequestObject,
      [e.target.name]: e.target.value
    });
    // console.log(selectedEstimateRequestObject.streetAddress)
  };

  // Handles the submition of new edited information to the database
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedQRObject = {
      id: selectedEstimateRequestObject.id,
      service_type_id: selectedEstimateRequestObject.service_type_id,
      est_request_status_id: selectedEstimateRequestObject.est_request_status_id,
      requested_date: selectedEstimateRequestObject.requested_date,
      firstName: selectedEstimateRequestObject.firstName,
      lastName: selectedEstimateRequestObject.lastName,
      streetAddress: selectedEstimateRequestObject.streetAddress,
      city: selectedEstimateRequestObject.city,
      state: selectedEstimateRequestObject.state,
      zipcode: selectedEstimateRequestObject.zipcode,
      email: selectedEstimateRequestObject.email,
      phone_number: selectedEstimateRequestObject.phone_number,
      customer_typeID: selectedEstimateRequestObject.customer_typeID,
      updated_at: new Date()
    };

    mutateUpdateQRById(updatedQRObject);
    onEditClose();
    setSelectedEstimateRequestObject({
      id: '',
      est_request_status_id: '',
      requested_date: '',
      service_type_id: '',
      streetAddress: '',
      city: '',
      state: '',
      zipcode: '',
      firstName: '',
      lastName: '',
      email: ''
    });
  };

  // Handles to determine if email alredy exist in DB to then save data as a new customer
  const handleEmailValidation = async (request) => {
    const { data: resEmail, error } = await supabase
      .from('customer')
      .select(
        'id, customer_type_id, email, phone_number, first_name, last_name, street_address, zipcode, state'
      )
      .eq('email', `${request.email}`);

    if (error) {
      console.log(error);
    }
    // console.log(resEmail.length)
    if (resEmail.length === 0) {
      // console.log('Email is not available in DB!')
      // console.log(request)
      const { error } = await supabase.from('customer').insert({
        first_name: request.firstName,
        last_name: request.lastName,
        street_address: request.streetAddress,
        city: request.city,
        state: request.state,
        zipcode: request.zipcode,
        phone_number: request.phone_number,
        email: request.email,
        customer_type_id: request.customer_typeID
      });

      if (error) {
        console.log(error);
      }

      // handleEmailValidationToastSuccess(request.email);
      toast({
        position: 'top',
        title: `New customer has been saved!`,
        description: `Customer with ${request.email} email has been saved! 🚀`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } else {
      // console.log('Email is available in DB.')
      // handleEmailValidationToastError(resEmail);
      toast({
        position: 'top',
        title: `Customer already exist!`,
        description: `${resEmail[0].email} email already exist! 👮‍♂️`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Handles alert box to user when they click to delete data
  const handleDeleteAlert = (estimateRequestId) => {
    setSelectedEstimateRequestId(estimateRequestId);
    // setSelectedEstimateRequestNumber(estimateRequestNumber);
    onDeleteOpen();
  };

  return (
    <>
      <NewEstimateRequestForm
        isOpen={isNewOpen}
        onClose={onNewClose}
        initialRef={initialRef}
        toast={toast}
        services={services}
        qrStatuses={qrStatuses}
        customerTypes={customerTypes}
      />
      <EditEstimateRequestForm
        initialRef={initialRef}
        handleSubmit={handleEditSubmit}
        isOpen={isEditOpen}
        onClose={onEditClose}
        handleEditCancel={handleEditCancel}
        objectData={selectedEstimateRequestObject}
        handleEditOnChange={handleEditChange}
        services={services}
        qrStatuses={qrStatuses}
      />
      <ConnectedQRDeleteAlertDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onOpen={onDeleteOpen}
        toast={toast}
        itemNumber={selectedEstimateRequestId}
        header={'Delete Lead'}
        entityDescription={`Lead # ${selectedEstimateRequestId}`}
        body={`Once you confirm there will be no way to restore the information. 🚨`}
      />

      <VStack my={'4'} w="100%" mx={'auto'} px={{ base: '4', lg: '8' }} gap={4}>
        {/* <Box display={'flex'} marginBottom={'0rem'} justifyContent='start' w='full'>
                    <Link to={'/'}>
                        <Button shadow={'sm'} colorScheme={buttonColorScheme} ml={'1rem'} mb='1rem' leftIcon={<MdKeyboardArrowLeft size={'20px'} />}>Back</Button>
                    </Link>
                </Box> */}
        <PageHeader
          title={'Leads'}
          subheading={'Manage your recent leads to turn them into future customers.'}
          addItemButtonText={'Add lead'}
          onOpen={onNewOpen}
        />
        <LeadFilterBar />
        <Card width="full" variant={'outline'} rounded={'lg'} size={{ base: 'md', md: 'md' }}>
          <CardBody>
            {/* Main Body for content */}
            {/* Quote Request Table to display all requests from company website */}
            {isQRLoading === true ? (
              <Box w={'full'} height={'200px'}>
                <Skeleton height={'200px'} rounded={'xl'} />
              </Box>
            ) : (
              <>
                <QuoteRequestTable
                  data={quoteRequests}
                  emailValidation={handleEmailValidation}
                  handleEdit={handleEdit}
                  handleDeleteAlert={handleDeleteAlert}
                />
              </>
            )}
          </CardBody>
        </Card>
      </VStack>
    </>
  );
};

export default QuoteRequests;
