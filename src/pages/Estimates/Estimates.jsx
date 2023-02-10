import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Select,
  Spinner,
  Box,
  Flex,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Table,
  TableContainer,
  Td,
  ModalCloseButton,
  HStack,
  Tooltip,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Button,
  FormHelperText,
  Text,
  useDisclosure,
  VStack,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Skeleton,
  Badge,
  Avatar,
  IconButton,
  Icon
} from '@chakra-ui/react';
import AsyncSelect from 'react-select/async';
import supabase from '../../utils/supabaseClient';
import formatNumber from '../../utils/formatNumber';
import {
  MdKeyboardArrowLeft,
  MdPostAdd,
  MdSearch,
  MdKeyboardArrowRight,
  MdEdit,
  MdDelete,
  MdFilterList,
  MdFilterAlt
} from 'react-icons/md';
import {
  Card,
  CustomerOptions,
  Estimate,
  NewEstimateForm,
  DeleteAlertDialog
} from '../../components';
import { TbRuler } from 'react-icons/tb';

function Estimates() {
  //Defining variables
  const { isOpen: isNewOpen, onOpen: onNewOpen, onClose: onNewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const initialRef = React.useRef();

  //Define toast from chakra ui
  const toast = useToast();

  // let navigate = useNavigate();
  // const url = `http://${process.env.REACT_APP_BASE_URL}:8081/api`;

  //Style for Card component
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const buttonColorScheme = useColorModeValue('blue', 'gray');

  // States to manage data
  const [selectedEstimateId, setSelectedEstimateId] = useState('');
  const [selectedEstimateNumber, setSelectedEstimateNumber] = useState('');

  const [quotes, setQuotes] = useState(null);
  const [customers, setCustomers] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchEstimateInput, setSearchEstimateInput] = useState('');
  const [name, setCustomerName] = useState('');
  const [etDate, setEtDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [quotePrice, setQuotedPrice] = useState('');
  const [estStatus, setEstStatus] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [measurement, setMeasurement] = useState('');

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cuIdCaptured, setCuIdCaptured] = useState('');

  //React Render Hook
  useEffect(() => {
    getAllQuotes();
    // getCustomers();
  }, []);

  //Functions for API calls or handling events across UI
  const getAllQuotes = async () => {
    const { data: Quotes, error } = await supabase
      .from('quote')
      .select(`*, customer:customer_id(*), quote_status:status_id(*), services:service_id(*)`);

    if (error) {
      console.log(error);
    }

    setQuotes(Quotes);
    console.log(Quotes);
  };

  const getCustomers = async () => {
    const { data: customers, error } = await supabase
      .from('customer')
      .select('id, first_name, last_name, email');

    if (error) {
      console.log(error);
    }

    setCustomers(customers);
    console.log(customers);
  };

  const searchEstimate = async () => {};

  const handleSubmit = async (event) => {
    event.preventDefault();
    const url2 = `http://${process.env.REACT_APP_BASE_URL}:8081/api/Quotes/add`;
    const json = {
      etStatusId: estStatus,
      customerId: cuIdCaptured,
      estimate_date: etDate,
      exp_date: expDate,
      sqft_measurement: measurement,
      service_name: serviceName,
      price: `$${quotePrice}`,
      quote_price: `$${quotePrice}`
    };
    await axios
      .post(url2, json)
      .then((response) => {
        console.log('I was submitted', response);
      })
      .catch((err) => {
        console.error(err);
      });
    console.log('Submit Function works!');
    //history.go(0);
    getAllQuotes();
    setEtDate('');
    setExpDate('');
    setQuotedPrice('');
    setEstStatus('');
    setServiceName('');
    setMeasurement('');
  };

  const handleSelectedCustomer = (selectedCustomer) => {
    // const value = e.target.value;
    // setSelectedCustomer(value)
    setSelectedCustomer({
      selectedCustomer: selectedCustomer || []
    });
    // console.log(selectedCustomer.value)
    const selectedCuId = selectedCustomer.value;
    // console.log(selectedCustomer.e.value)
    setCuIdCaptured(selectedCuId);
    console.log(selectedCuId);
    // console.log(cuIdCaptured)
  };

  const handleQuotestatusInput = (e) => {
    const selectedValue = e.target.value;
    setEstStatus(selectedValue);
  };

  const loadOptions = async (inputText, callback) => {
    await axios
      .get(`http://${process.env.REACT_APP_BASE_URL}:8081/api/customers/?name=${inputText}`)
      .then((response) => {
        // const allCustomers = response.data;
        //add data to state
        // setCustomers(allCustomers);
        callback(
          response.data.map((customer) => ({
            label: customer.name,
            value: customer.id,
            email: customer.email
          }))
        );
      })
      .catch((error) => console.error(`Error: ${error}`));
  };

  const handleDelete = (estimateId, estimate_number) => {
    setSelectedEstimateId(estimateId);
    setSelectedEstimateNumber(estimate_number);
    onDeleteOpen();
  };

  const handleDeleteToast = (estimate_number) => {
    toast({
      position: 'top-right',
      title: `Estimate #${estimate_number} deleted!`,
      description: "We've deleted estimate for you.",
      status: 'success',
      duration: 5000,
      isClosable: true
    });
  };

  return (
    <>
      <VStack my={'2rem'} w="100%" mx={'auto'} px={{ base: '1rem', lg: '2rem' }}>
        <Box display={'flex'} marginBottom={'0rem'} justifyContent="start" w="full">
          <Link to={'/'}>
            <Button
              colorScheme={buttonColorScheme}
              ml={'1rem'}
              mb="1rem"
              leftIcon={<MdKeyboardArrowLeft size={'20px'} />}>
              Back
            </Button>
          </Link>
        </Box>
        <Card width="full" bg={bg} borderColor={borderColor}>
          <HStack mt={'1rem'} mb={'2rem'}>
            <Flex display={'flex'} mr={'auto'} alignItems={'center'} ml={'24px'}>
              <Icon as={TbRuler} boxSize={'7'} />
              <Text fontSize={'3xl'} fontWeight="semibold" mx="14px">
                Quotes
              </Text>
            </Flex>
            <Flex pr="1rem" mr={'1rem'} justifyContent={'end'} gap={10}>
              <form method="GET" onSubmit={searchEstimate}>
                <FormControl display={'flex'}>
                  <Input
                    value={searchEstimateInput}
                    onChange={({ target }) => setSearchEstimateInput(target.value)}
                    placeholder="Search for Request"
                    colorScheme="blue"
                    border="2px"
                  />
                  <Tooltip label="Search">
                    <IconButton ml={'1rem'} type="submit" icon={<MdSearch />} />
                  </Tooltip>
                </FormControl>
              </form>
              <Flex gap={4}>
                <Tooltip label="Filter">
                  <IconButton colorScheme={'gray'} icon={<MdFilterAlt />} />
                </Tooltip>
                <Tooltip label="Sort">
                  <IconButton colorScheme={'gray'} icon={<MdFilterList />} />
                </Tooltip>
                <Tooltip label="Create New Estimate">
                  <IconButton
                    colorScheme="blue"
                    variant="solid"
                    onClick={onNewOpen}
                    icon={<MdPostAdd />}
                  />
                </Tooltip>
              </Flex>
            </Flex>
          </HStack>
          <TableContainer overflow={'auto'}>
            {quotes ? (
              <>
                <Table variant={'simple'} size="sm">
                  <TableCaption>Total of {quotes?.length} Quotes in our system ✌️</TableCaption>
                  <Thead>
                    <Tr>
                      <Th textAlign={'center'}>Quote#</Th>
                      <Th textAlign={'center'}>Status</Th>
                      <Th>Service Type</Th>
                      <Th>Date</Th>
                      <Th>Issue Date</Th>
                      <Th>Expiration</Th>
                      <Th>Customer</Th>
                      {/* <Th textAlign={'center'}>Customer Email</Th>
                                        <Th textAlign={'center'}>Customer Number</Th> */}
                      <Th>Total</Th>
                      {/* <Th>Amount Due</Th> */}
                      <Th textAlign={'center'}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {quotes?.map((quote, index) => (
                      <Tr key={index}>
                        <Td textAlign={'center'}>
                          <Text fontWeight={'bold'} fontSize={'md'}>
                            {quote.quote_number ? formatNumber(quote.quote_number) : ''}
                          </Text>
                        </Td>
                        <Td textAlign={'center'}>
                          <Badge
                            w={'80px'}
                            variant={'subtle'}
                            mx={'auto'}
                            colorScheme={
                              quote.quote_status.name === 'New'
                                ? 'green'
                                : '' || quote.quote_status.name === 'Accepted'
                                ? 'green'
                                : '' || quote.quote_status.name === 'Pending'
                                ? 'yellow'
                                : '' || quote.quote_status.name === 'Rejected'
                                ? 'red'
                                : 'gray'
                            }
                            p="1"
                            rounded={'xl'}
                            align="center">
                            {quote.quote_status.name}
                          </Badge>
                        </Td>
                        {/* <Td textAlign={'center'}>{quote.quote_status.name === 'Sent'? <><Text color={'white'} mx={'auto'} bg={'yellow.500'} p='1' rounded={'xl'} align='center' w={'80px'}>Sent</Text></>: 'false'}</Td> */}
                        <Td>
                          <Text>{quote.services.name}</Text>
                        </Td>
                        <Td>
                          <Text>
                            {quote.quote_date
                              ? new Date(quote?.quote_date).toLocaleDateString()
                              : ''}
                          </Text>
                        </Td>
                        <Td textAlign={'center'}>
                          <Text>
                            {quote.issued_date
                              ? new Date(quote.issued_date).toLocaleDateString()
                              : ''}
                          </Text>
                        </Td>
                        <Td>
                          <Text>
                            {quote?.expiration_date
                              ? new Date(quote?.expiration_date).toLocaleDateString()
                              : ''}
                          </Text>
                        </Td>
                        <Td>
                          {quote?.customer?.first_name && quote?.customer?.last_name ? (
                            <>
                              <Flex>
                                <Link to={`/editcustomer/${quote.customer.id}`}>
                                  <Button variant={'ghost'} colorScheme={'facebook'}>
                                    <Avatar size={'xs'} mr={'8px'} my={'auto'} />
                                    <Flex flexDir={'column'}>
                                      <Flex fontWeight={'bold'} fontSize={'xs'}>
                                        <Text marginRight={'4px'}>
                                          {quote?.customer?.first_name}
                                        </Text>
                                        <Text>{quote?.customer?.last_name}</Text>
                                      </Flex>
                                      <Flex mt={'4px'} fontWeight={'light'} fontSize={'xs'}>
                                        {quote?.customer?.email}
                                      </Flex>
                                    </Flex>
                                  </Button>
                                </Link>
                              </Flex>
                            </>
                          ) : (
                            <>{quote?.customer?.company_name}</>
                          )}
                        </Td>
                        {/* <Td textAlign={'center'}><Text>{quote.customer.first_name}</Text><Text>{quote.customer.last_name}</Text></Td> */}
                        {/* <Td textAlign={'center'}><Text>{quote.customer.email}</Text></Td> */}
                        {/* <Td textAlign={'center'}><Text>{quote.customer.phone_number}</Text></Td> */}
                        <Td>
                          <Text>
                            $
                            {quote?.total
                              ? quote?.total.toLocaleString(undefined, {
                                  minimumFractionDigits: 2
                                })
                              : '0'}
                          </Text>
                        </Td>
                        <Td>
                          <Flex gap={2}>
                            <Tooltip label="Edit">
                              <IconButton icon={<MdEdit />} />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                onClick={() => {
                                  handleDelete(quote.id, quote.quote_number);
                                }}
                                icon={<MdDelete />}
                              />
                            </Tooltip>
                            <Link to={`/editestimate/${quote.id}`}>
                              <Tooltip label="Go to Estimate Details ">
                                <IconButton
                                  colorScheme={'gray'}
                                  variant="solid"
                                  icon={<MdKeyboardArrowRight />}
                                />
                              </Tooltip>
                            </Link>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            ) : (
              <Skeleton height={'100px'} rounded={'md'} />
            )}
          </TableContainer>
        </Card>
      </VStack>
      <NewEstimateForm initialRef={initialRef} isOpen={isNewOpen} onClose={onNewClose} />
      <DeleteAlertDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        updateParentState={getAllQuotes}
        toast={handleDeleteToast}
        itemId={selectedEstimateId}
        itemNumber={selectedEstimateNumber}
        tableName={'estimate'}
        header={`Delete Estimate #${selectedEstimateNumber}`}
        body={`Are you sure? You can't undo this action afterwards.`}
      />
    </>
  );
}

export default Estimates;
