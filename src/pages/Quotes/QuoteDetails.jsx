import React, { useEffect, useState, useContext, Fragment } from 'react';
import {
  Select,
  Divider,
  Badge,
  Card,
  CardBody,
  Skeleton,
  Grid,
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
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
  Container,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Image,
  TableContainer,
  Thead,
  Th,
  Tr,
  Td,
  Table,
  Tbody,
  IconButton,
  useToast,
  useColorModeValue,
  Avatar,
  Textarea
} from '@chakra-ui/react';
//import {Link, Redirect, useHistory} from 'react-router-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../../utils/supabaseClient.js';
import formatNumber from '../../utils/formatNumber.js';
import formatMoneyValue from '../../utils/formatMoneyValue.js';
import formatDate from '../../utils/formatDate.js';
import { PDFViewer, usePDF, PDFDownloadLink } from '@react-pdf/renderer';
import {
  FiArrowLeft,
  FiMoreHorizontal,
  FiEdit,
  FiShare2,
  FiSend,
  FiUploadCloud,
  FiPaperclip,
  FiClock,
  FiRefreshCw,
  FiShare,
  FiAlignLeft,
  FiCheck,
  FiX,
  FiFolder,
  FiBriefcase,
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import { MdOutlinePayments, MdPendingActions, MdTransform } from 'react-icons/md';
import { AiOutlineBars } from 'react-icons/ai';
import { BiCalendarExclamation, BiNote, BiRuler } from 'react-icons/bi';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { HiStatusOnline } from 'react-icons/hi';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { EditQuoteForm, QuoteDetailsLineItemTable, QuoteDocument } from '../../components/index.js';
import { useServices } from '../../hooks/useServices.jsx';
import { useQuoteStatuses } from '../../hooks/useQuoteStatuses.jsx';
import { useFetchQuoteById } from '../../hooks/useQuotes.jsx';
import { FileText } from 'lucide-react';

const QuoteById = (props) => {
  const { parentData } = props;
  const { id } = useParams();
  const toast = useToast();

  // Custom Hooks
  const { quoteById, isLoading } = useFetchQuoteById(id);
  const { services } = useServices();
  const { quoteStatuses } = useQuoteStatuses();

  // Modal useDisclousures
  const {
    isOpen: isAddLineItemOpen,
    onOpen: onAddLineItemOpen,
    onClose: onAddLineItemClose
  } = useDisclosure();
  const {
    isOpen: isEditQuoteOpen,
    onOpen: onEditQuoteOpen,
    onClose: onEditQuoteClose
  } = useDisclosure();
  const {
    isOpen: isExportPDFOpen,
    onOpen: onExportPDFOpen,
    onClose: onExportPDFClose
  } = useDisclosure();

  // React useState to store Objects
  const [quote, setQuote] = useState();
  const [selectedEditQuote, setSelectedEditQuote] = useState({
    id: '',
    quote_number: '',
    status_id: '',
    service_id: '',
    quote_date: '',
    issue_date: '',
    expiration_date: '',
    note: '',
    measurement_note: '',
    cust_note: ''
  });
  2;
  // React useState switches
  const [loadingQuoteStatusIsOn, setLoadingQuoteStatusIsOn] = useState(false);
  const [editSwitchIsOn, setEditSwitchIsOn] = useState(false);

  // React state input variables
  const [lineItemDescriptionInput, setLineItemDescriptionInput] = useState('');
  const [lineItemAmountInput, setLineItemAmountInput] = useState('');

  // Chakra UI states
  // const toast = useToast()

  // Custom color configs for UX elements
  const bgColorMode = useColorModeValue('gray.100', 'gray.600');
  const paymentCardBgColor = useColorModeValue('gray.100', 'gray.600');
  const paymentBorderColor = useColorModeValue('gray.200', 'gray.400');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');

  // React-Hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef();
  let navigate = useNavigate();

  // Handle quote status when selected in menu
  const handleQuoteStatusMenuSelection = async (status_id) => {
    setLoadingQuoteStatusIsOn(true);
    if (status_id === quoteById?.status_id) {
      console.log(status_id);
    } else {
      const { data, error } = await supabase
        .from('quote')
        .update({ status_id: status_id })
        .eq('quote_number', id);

      if (error) {
        console.log(error);
      }
      console.log(data);
      // await getQuoteById();
    }
    setLoadingQuoteStatusIsOn(false);
  };

  //////////////////////// Functions to handle line items //////////////////////////////
  const handleLineItemDelete = async (item) => {
    const { data, error } = await supabase.from('quote_line_item').delete().eq('id', item.id);

    if (error) {
      toast({
        position: 'top',
        title: `Error Occurend Deleting Line Item 🚨`,
        description: `Error: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
    if (data) {
      // await getQuoteById();
      toast({
        position: 'top',
        title: `Succesfully Deleted Quote Line Item`,
        description: `We were able to delete a line item with description of "${
          item.description
        }" with an amount of "${formatMoneyValue(item.amount)}" successfully 🎉`,
        duration: 5000,
        isClosable: true,
        status: 'success'
      });
    }
  };

  const handleAddLineItemSubmit = async (e) => {
    e.preventDefault();
    setLoadingQuoteStatusIsOn(true);
    const { data, error } = await supabase.from('quote_line_item').insert({
      quote_id: quote.quote_number,
      service_id: quote.service_id,
      qty: 1,
      amount: lineItemAmountInput,
      description: lineItemDescriptionInput,
      fixed_item: true
    });

    if (error) {
      toast({
        position: 'top',
        title: `Error Occured Creating Line Item`,
        description: `Error: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
    if (data) {
      // await getQuoteById();
      setLoadingQuoteStatusIsOn(false);
      onAddLineItemClose();
      toast({
        position: 'top',
        title: `Succesfully Added Line Item`,
        description: `We were able to add a line-item for quote number ${quote.quote_number} 🎉`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    }
  };

  //////////////////////////// Functions that handle quote edit functionality /////////////////////////////////////////
  const handleEditQuoteOnChange = (e) => {
    setSelectedEditQuote({ ...selectedEditQuote, [e.target.name]: e.target.value });
  };

  const handleEditQuoteModal = (quote) => {
    setSelectedEditQuote({
      id: quote.id,
      quote_number: quote.quote_number,
      status_id: quote.status_id,
      service_id: quote.service_id,
      quote_date: quote.quote_date,
      issue_date: quote.issue_date,
      expiration_date: quote.expiration_date,
      note: quote.note,
      measurement_note: quote.measurement_note,
      cust_note: quote.cust_note
    });
    onEditQuoteOpen();
  };

  const handleEditQuoteSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('quote')
      .update({
        status_id: selectedEditQuote.status_id,
        service_id: selectedEditQuote.service_id,
        quote_date: selectedEditQuote.quote_date,
        issue_date: selectedEditQuote.issue_date,
        expiration_date: selectedEditQuote.expiration_date,
        note: selectedEditQuote.note,
        measurement_note: selectedEditQuote.measurement_note,
        cust_note: selectedEditQuote.cust_note,
        updated_at: new Date()
      })
      .eq('quote_number', selectedEditQuote.quote_number);

    if (error) {
      toast({
        position: 'top',
        title: `Error Updating Quote Number ${selectedEditQuote.quote_number}`,
        description: `Error: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      onEditQuoteClose();
    }

    if (data) {
      // await getQuoteById();
      onEditQuoteClose();
      toast({
        position: 'top',
        title: `Successfully Updated Quote!`,
        description: `We've updated INV# ${selectedEditQuote.quote_number} for you 🎉`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    }

    setSelectedEditQuote({
      id: '',
      quote_number: '',
      status_id: '',
      service_id: '',
      quote_date: '',
      issue_date: '',
      expiration_date: '',
      note: '',
      measurement_note: '',
      cust_note: ''
    });
  };

  // Convert Quote to Invoice
  // Handle adding new line item to quote
  const handlePDFDownload = () => {
    onExportPDFClose();
  };

  return (
    <Container maxW={'1400px'} pt={'2rem'} pb={'4rem'}>
      {/* <DeleteInvoiceLineServiceAlertDialog toast={handleDeleteToast} updateParentState={getInvoiceDetailsById} /> */}
      <EditQuoteForm
        onClose={onEditQuoteClose}
        isOpen={isEditQuoteOpen}
        quote={selectedEditQuote}
        services={services}
        quoteStatuses={quoteStatuses}
        handleEditOnChange={handleEditQuoteOnChange}
        handleEditSubmit={handleEditQuoteSubmit}
      />

      {/* Header */}
      <Flex justify={'space-between'} mb={'1rem'} flexDir={{ base: 'row', lg: 'row' }}>
        <Flex px={'1rem'} gap={4} mb={{ base: '0rem', lg: '0' }}>
          <Link to={`/quotes`}>
            <Button variant={'outline'} border={'1px'} borderColor={'gray.300'}>
              <FiArrowLeft />
            </Button>
          </Link>
          {/* <Text my={'auto'} fontSize={'xl'} fontWeight={'bold'}>INV #{id}</Text> */}
        </Flex>
        <Flex px={'1rem'} gap={4} ml={{ base: 'auto', lg: '0' }}>
          <Menu>
            <MenuButton as={Button} variant={'outline'} border={'1px'} borderColor={'gray.300'}>
              <FiMoreHorizontal />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiEdit />} onClick={() => handleEditQuoteModal(quoteById)}>
                Edit Quote
              </MenuItem>
              <MenuItem icon={<MdOutlinePayments />}>Edit Payments</MenuItem>
              <MenuItem icon={<AiOutlineBars />}>Edit Line Items</MenuItem>
            </MenuList>
          </Menu>
          <Tooltip hasArrow label="Convert Quote to Invoice">
            <Button variant={'outline'} border={'1px'} borderColor={'gray.300'}>
              <MdTransform />
            </Button>
          </Tooltip>
          {/* <Tooltip hasArrow label="More"><Button colorScheme={'gray'}><FiMoreHorizontal/></Button></Tooltip> */}
          {/* <Tooltip hasArrow label="Share">
            <Button colorScheme={'gray'}>
              <FiShare2 />
            </Button>
          </Tooltip> */}
          {/* <Tooltip hasArrow label="Send Quote">
            <Button colorScheme={'blue'} gap={2}>
              <FiSend />
              Send Quote
            </Button>
          </Tooltip> */}
          <Button colorScheme="blue" gap="2" onClick={onExportPDFOpen}>
            <FiShare /> Export as PDF
          </Button>
        </Flex>
      </Flex>
      <Flex px={'1rem'} gap={6} flexDir={{ base: 'column', lg: 'row' }}>
        {/* Left Section */}
        <Flex w={{ base: 'full', lg: '60%' }}>
          <Card w={'full'} rounded={'xl'}>
            <CardBody>
              {/* Header with Buttons */}
              <Flex justifyContent={'flex-end'} pr={'1rem'}>
                <Tooltip hasArrow label="Upload images">
                  <Button variant={'outline'} roundedRight={'none'}>
                    <FiUploadCloud />
                  </Button>
                </Tooltip>
                <Tooltip hasArrow label="Upload documents">
                  <Button variant={'outline'} roundedLeft={'none'}>
                    <FiPaperclip />
                  </Button>
                </Tooltip>
              </Flex>
              <Flex px={'2rem'} pb="3rem">
                <Image
                  src="https://github.com/rrios4/roofing-webapp/blob/main/src/assets/LogoRR.png?raw=true"
                  maxW={'70px'}
                  p={'1'}
                  bg={'blue.500'}
                  rounded={'2xl'}
                />
                <Box ml={'2rem'}>
                  <Text fontWeight={'semibold'} fontSize={'3xl'} letterSpacing={'0px'}>
                    Quote{' '}
                    <Text as={'span'} color={'blue.400'}>
                      #
                    </Text>{' '}
                    {formatNumber(quoteById?.quote_number)}
                  </Text>
                  <Text fontSize={'sm'} fontWeight={'semibold'} textColor={'gray.500'}>
                    Expires {quoteById?.expiration_date}
                  </Text>
                </Box>
              </Flex>
              <Box px={'2rem'} mb={'3rem'}>
                <Flex mb={'1rem'}>
                  <Text w="50px" fontWeight={'bold'} textColor={'gray.500'}>
                    To
                  </Text>
                  {!quoteById ? (
                    <Skeleton
                      bg={paymentCardBgColor}
                      height={'100px'}
                      w={'250px'}
                      rounded={'xl'}
                      mx={'1rem'}
                    />
                  ) : (
                    <>
                      {quoteById?.bill_to === true ? (
                        <>
                          <Box>
                            <Text ml={'3rem'} fontWeight={'semibold'}>
                              {quoteById?.customer?.first_name} {quoteById?.customer?.last_name}
                            </Text>
                            <Text ml={'3rem'}>{quoteById?.bill_to_street_address}</Text>
                            <Text ml={'3rem'}>
                              {quoteById?.bill_to_city}, {quoteById?.bill_to_state}{' '}
                              {quoteById?.bill_to_zipcode}
                            </Text>
                            <Text ml={'3rem'} color={'blue.400'}>
                              {quoteById?.customer?.email}
                            </Text>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box>
                            <Text ml={'3rem'} fontWeight={'semibold'}>
                              {quoteById?.customer?.first_name} {quoteById?.customer?.last_name}
                            </Text>
                            <Text ml={'3rem'}>{quoteById?.customer?.street_address}</Text>
                            <Text ml={'3rem'}>
                              {quoteById?.customer?.city}, {quoteById?.customer?.state}{' '}
                              {quoteById?.customer?.zipcode}
                            </Text>
                            <Text ml={'3rem'} color={'blue.400'}>
                              {quoteById?.customer?.email}
                            </Text>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </Flex>
                <Flex mb={'1rem'}>
                  <Text w="50px" fontWeight={'bold'} textColor={'gray.500'}>
                    From
                  </Text>
                  {!quoteById ? (
                    <Skeleton
                      bg={paymentCardBgColor}
                      height={'100px'}
                      w={'250px'}
                      rounded={'xl'}
                      mx={'1rem'}
                    />
                  ) : (
                    <>
                      <Box>
                        <Text ml={'3rem'} fontWeight={'semibold'}>
                          Rios Roofing
                        </Text>
                        <Text ml={'3rem'}>150 Tallant St</Text>
                        <Text ml={'3rem'}>Houston, TX 77076</Text>
                        <Text ml={'3rem'} color={'blue.400'}>
                          rrios.roofing@gmail.com
                        </Text>
                      </Box>
                    </>
                  )}
                </Flex>
                <Flex>
                  <Text w="50px" fontWeight={'bold'} textColor={'gray.500'}>
                    Note
                  </Text>
                  {!quoteById ? (
                    <Skeleton
                      bg={paymentCardBgColor}
                      height={'20px'}
                      w={'250px'}
                      rounded={'xl'}
                      mx={'1rem'}
                    />
                  ) : (
                    <>
                      <Text ml={'3rem'} maxW="500px">
                        {quoteById?.cust_note}
                      </Text>
                    </>
                  )}
                </Flex>
              </Box>
              <Divider w={'95%'} mx={'auto'} />

              {/* Line Item Table */}
              <QuoteDetailsLineItemTable
                quoteById={quoteById}
                handleLineItemDelete={handleLineItemDelete}
                editSwitchIsOn={editSwitchIsOn}
                paymentCardBgColor={paymentCardBgColor}
                bgColorMode={bgColorMode}
              />

              <Box px={'4rem'} pb="2rem">
                <Flex mb={'2rem'} px={4} py={2}>
                  <Text fontWeight={'semibold'} textColor={secondaryTextColor}>
                    Subtotal
                  </Text>
                  <Text ml={'auto'} mr={'1rem'}>
                    ${formatMoneyValue(quoteById?.subtotal)}
                  </Text>
                </Flex>
                <Flex mb={'2rem'} bg={'blue.500'} color={'white'} px={4} py={4} rounded={'xl'}>
                  <Text fontWeight={'bold'} fontSize={'xl'}>
                    Total
                  </Text>
                  <Text ml={'auto'} fontWeight={'bold'} fontSize={'xl'}>
                    ${formatMoneyValue(quoteById?.total)}
                  </Text>
                </Flex>
              </Box>
            </CardBody>
          </Card>
        </Flex>

        {/* Right Section */}
        <Flex w={{ base: 'full', lg: '40%' }} direction={'column'} gap={4}>
          <Card rounded={'xl'}>
            <CardBody>
              <Flex px={'8px'} gap={2}>
                {/* <Text fontSize={'2xl'} fontWeight={'bold'}>${formatMoneyValue(quoteById?.amount_due)}</Text> */}
                {/* Menu Button to update status of invoice */}
                <Menu>
                  {({ isOpen }) => (
                    <>
                      <MenuButton
                        w="full"
                        isLoading={loadingQuoteStatusIsOn}
                        isActive={isOpen}
                        as={Button}
                        rightIcon={
                          isOpen ? <BsChevronDown size="10px" /> : <BsChevronUp size="10px" />
                        }>
                        {quoteById?.quote_status?.name === 'Draft' ? (
                          <>
                            <Flex gap="2">
                              <Box my="auto">
                                <FiFolder />
                              </Box>
                              {quoteById?.quote_status?.name}
                            </Flex>
                          </>
                        ) : quoteById?.quote_status?.name === 'Pending' ? (
                          <>
                            <Flex gap="2">
                              <Box my="auto">
                                <MdPendingActions />
                              </Box>
                              {quoteById?.quote_status?.name}
                            </Flex>
                          </>
                        ) : quoteById?.quote_status?.name === 'Accepted' ? (
                          <>
                            <Flex gap="2">
                              <Box my="auto">
                                <AiOutlineCheckCircle />
                              </Box>
                              {quoteById?.quote_status?.name}
                            </Flex>
                          </>
                        ) : quoteById?.quote_status?.name === 'Rejected' ? (
                          <>
                            <Flex gap="2">
                              <Box my="auto">
                                <BiCalendarExclamation />
                              </Box>
                              {quoteById?.quote_status?.name}
                            </Flex>
                          </>
                        ) : (
                          <></>
                        )}
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleQuoteStatusMenuSelection(4)}>
                          <Flex gap="2">
                            <Box my="auto">
                              <FiFolder size="20px" />
                            </Box>
                            <Text>Draft</Text>
                            {quoteById?.quote_status?.name === 'Draft' ? (
                              <Box my="auto" ml="1rem">
                                <FiCheck size="15px" />
                              </Box>
                            ) : (
                              <></>
                            )}
                          </Flex>
                        </MenuItem>
                        <MenuItem onClick={() => handleQuoteStatusMenuSelection(1)}>
                          <Flex gap="2">
                            <Box my="auto">
                              <AiOutlineCheckCircle size="20px" />
                            </Box>
                            <Text>Accepted</Text>
                            {quoteById?.quote_status?.name === 'Accepted' ? (
                              <Box my="auto" ml="1rem">
                                <FiCheck size="15px" />
                              </Box>
                            ) : (
                              <></>
                            )}
                          </Flex>
                        </MenuItem>
                        <MenuItem onClick={() => handleQuoteStatusMenuSelection(2)}>
                          <Flex gap="2">
                            <Box my="auto">
                              <MdPendingActions size="20px" />
                            </Box>
                            <Text>Pending</Text>
                            {quoteById?.quote_status?.name === 'Pending' ? (
                              <Box my="auto" ml="1rem">
                                <FiCheck size="15px" />
                              </Box>
                            ) : (
                              <></>
                            )}
                          </Flex>
                        </MenuItem>
                        <MenuItem onClick={() => handleQuoteStatusMenuSelection(3)}>
                          <Flex gap="2">
                            <Box my="auto">
                              <BiCalendarExclamation size="20px" />
                            </Box>
                            <Text>Rejected</Text>
                            {quoteById?.quote_status?.name === 'Rejected' ? (
                              <Box my="auto" ml="1rem">
                                <FiCheck size="15px" />
                              </Box>
                            ) : (
                              <></>
                            )}
                          </Flex>
                        </MenuItem>
                      </MenuList>
                    </>
                  )}
                </Menu>
                <Button w={'full'} onClick={onAddLineItemOpen}>
                  Add Line Item
                </Button>
                <Tooltip hasArrow label="Edit">
                  <IconButton
                    icon={editSwitchIsOn === true ? <FiX /> : <FiEdit />}
                    onClick={() => setEditSwitchIsOn(!editSwitchIsOn)}
                  />
                </Tooltip>
              </Flex>
            </CardBody>
          </Card>
          <Card w={'full'} rounded={'xl'}>
            <CardBody overflowY={'auto'}>
              {/* Invoice Extra Details */}
              <Box px={'1rem'} py={'8px'}>
                <Flex alignItems={'center'} gap={3} mb={'1rem'}>
                  <FiAlignLeft size={'25px'} color="gray" />
                  <Text fontSize={'2xl'} fontWeight={'semibold'} color={secondaryTextColor}>
                    Details
                  </Text>
                </Flex>
                <Flex mb={'1rem'} gap="2">
                  <Box my="auto">
                    <HiStatusOnline />
                  </Box>
                  <Text
                    w={'40%'}
                    fontWeight={'semibold'}
                    textColor={secondaryTextColor}
                    my={'auto'}>
                    Status
                  </Text>
                  {!quoteById ? (
                    <Skeleton bg={paymentCardBgColor} height={'20px'} rounded={'xl'} w={'full'} />
                  ) : (
                    <Badge
                      colorScheme={
                        quoteById?.quote_status?.name === 'Accepted'
                          ? 'green'
                          : quoteById?.quote_status?.name === 'Pending'
                          ? 'yellow'
                          : quoteById?.quote_status?.name === 'Rejected'
                          ? 'red'
                          : quoteById?.quote_status?.name === 'Draft'
                          ? 'gray'
                          : 'facebook'
                      }
                      variant={'subtle'}
                      mr={'1rem'}
                      pt={'2px'}
                      w={'80px'}
                      rounded={'xl'}
                      textAlign={'center'}>
                      {quoteById?.quote_status?.name}
                    </Badge>
                  )}
                </Flex>
                <Flex mb={'1rem'} gap="2">
                  <Box my="auto">
                    <FiBriefcase />
                  </Box>
                  <Text w={'40%'} fontWeight={'semibold'} textColor={secondaryTextColor} my="auto">
                    Service
                  </Text>
                  {!quoteById ? (
                    <Skeleton bg={paymentCardBgColor} height={'20px'} rounded={'xl'} w={'full'} />
                  ) : (
                    <Text mr={'1rem'}>{quoteById?.services?.name}</Text>
                  )}
                </Flex>
                <Flex mb={'1rem'} gap="2">
                  <Box my="auto">
                    <FiCalendar />
                  </Box>
                  <Text w={'40%'} fontWeight={'semibold'} textColor={secondaryTextColor}>
                    Quote Date
                  </Text>
                  {!quoteById ? (
                    <Skeleton bg={paymentCardBgColor} height={'20px'} rounded={'xl'} w={'full'} />
                  ) : (
                    <>
                      <Text mr={'1rem'}>{quoteById?.quote_date}</Text>
                    </>
                  )}
                </Flex>
                <Flex mb={'1rem'} gap="2">
                  <Box my="auto">
                    <FiSend />
                  </Box>
                  <Text w={'40%'} fontWeight={'semibold'} textColor={secondaryTextColor}>
                    Issue Date
                  </Text>
                  {!quoteById ? (
                    <Skeleton bg={paymentCardBgColor} height={'20px'} rounded={'xl'} w={'full'} />
                  ) : (
                    <>
                      <Text mr={'1rem'}>
                        {!quoteById.issue_date
                          ? 'Not issued yet... 🙅‍♂️'
                          : formatDate(quote.issue_date)}
                      </Text>
                    </>
                  )}
                </Flex>
                <Flex mb={'1rem'} gap="2">
                  <Box my="auto">
                    <FiUser />
                  </Box>
                  <Text
                    w={'36%'}
                    fontWeight={'semibold'}
                    textColor={secondaryTextColor}
                    my={'auto'}>
                    Customer
                  </Text>
                  {!quoteById ? (
                    <Skeleton bg={paymentCardBgColor} height={'20px'} rounded={'xl'} w={'full'} />
                  ) : (
                    <>
                      <Flex>
                        <Link to={`/editcustomer/${quoteById?.customer?.id}`}>
                          <Button variant={'ghost'}>
                            <Avatar size={'xs'} />
                            <Text my={'auto'} ml={'8px'} fontWeight={'medium'}>
                              {quoteById?.customer?.first_name} {quoteById?.customer?.last_name}
                            </Text>
                          </Button>
                        </Link>
                      </Flex>
                    </>
                  )}
                </Flex>
                <Box w="full" mb="2rem">
                  <Flex mb={'1rem'} gap={2}>
                    <Box my="auto">
                      <BiNote />
                    </Box>
                    <Text fontWeight={'semibold'} textColor={secondaryTextColor}>
                      Note
                    </Text>
                  </Flex>
                  {!quoteById ? (
                    <Skeleton bg={paymentCardBgColor} height={'20px'} rounded={'xl'} />
                  ) : (
                    <>
                      <Box bg={paymentCardBgColor} p="2" rounded="xl">
                        <Textarea
                          border="none"
                          h={'100px'}
                          isReadOnly
                          value={
                            !quoteById?.note ? 'No note for this quote... 🙅‍♂️' : quoteById?.note
                          }
                        />
                        {/* {!quoteById?.note ? '❌ No note for this invoice...' : <Text>{invoice.note}</Text>} */}
                      </Box>
                    </>
                  )}
                </Box>
                <Box w="full">
                  <Flex mb={'1rem'} gap={2}>
                    <Box my="auto">
                      <BiRuler />
                    </Box>
                    <Text fontWeight={'semibold'} textColor={secondaryTextColor}>
                      Measurements
                    </Text>
                  </Flex>
                  {!quoteById ? (
                    <Skeleton bg={paymentCardBgColor} height={'20px'} rounded={'xl'} />
                  ) : (
                    <>
                      <Box bg={paymentCardBgColor} p="2" rounded="xl">
                        <Textarea
                          border="none"
                          isReadOnly
                          value={
                            !quoteById?.measurement_note
                              ? 'No measurement information... 🙅‍♂️'
                              : quoteById?.measurement_note
                          }
                        />
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Flex>
      </Flex>
      <Modal
        onClose={onAddLineItemClose}
        isOpen={isAddLineItemOpen}
        size={'xl'}
        isCentered
        motionPreset="scale">
        <ModalOverlay />
        <form method={'POST'} onSubmit={handleAddLineItemSubmit}>
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Add Line Item</ModalHeader>
            <ModalBody>
              <Flex gap="4">
                <Box w="60%">
                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Input onChange={(e) => setLineItemDescriptionInput(e.target.value)} />
                  </FormControl>
                </Box>
                <Box w="15%">
                  <FormControl isRequired>
                    <FormLabel>Qty</FormLabel>
                    <Input value="1" disabled />
                  </FormControl>
                </Box>
                <Box w="20%">
                  <FormControl isRequired>
                    <FormLabel>Rate</FormLabel>
                    <Input value="Fixed" disabled />
                  </FormControl>
                </Box>
                <Box w="25%">
                  <FormControl isRequired>
                    <FormLabel>Amount</FormLabel>
                    <Input onChange={(e) => setLineItemAmountInput(e.target.value)} />
                  </FormControl>
                </Box>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Flex gap="4">
                <Button colorScheme="blue" type="submit" isLoading={loadingQuoteStatusIsOn}>
                  Add Line Item
                </Button>
                <Button onClick={onAddLineItemClose}>Cancel</Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
      {/* Export Quote PDF Preview */}
      <Modal
        onClose={onExportPDFClose}
        isOpen={isExportPDFOpen}
        size={'lg'}
        isCentered
        motionPreset="scale">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Flex gap="2">
              <FileText size={'25px'} />
              <Text my="auto" textAlign="middle" align="center">
                PDF Preview
              </Text>
            </Flex>
          </ModalHeader>
          <ModalBody mx="auto" p="1rem">
            <Fragment>
              <PDFViewer width={'350px'} height={'500px'}>
                <QuoteDocument quote={quoteById} />
              </PDFViewer>
            </Fragment>
          </ModalBody>
          <ModalFooter>
            <Flex gap="4">
              <PDFDownloadLink
                document={<QuoteDocument quote={quoteById} />}
                fileName={`RR-QT${formatNumber(quoteById?.quote_number)}`}>
                {({ blob, url, loading, error }) =>
                  loading ? (
                    <Button colorScheme="blue" isLoading="true">
                      Generating...
                    </Button>
                  ) : (
                    <Button colorScheme="blue" onClick={() => handlePDFDownload()}>
                      Download
                    </Button>
                  )
                }
              </PDFDownloadLink>
              <Button onClick={onExportPDFClose}>Cancel</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default QuoteById;
