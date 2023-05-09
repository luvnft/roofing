import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  useToast,
  HStack,
  Tooltip,
  FormControl,
  Input,
  Text,
  useDisclosure,
  VStack,
  IconButton,
  Icon,
  Card,
  CardBody,
  Skeleton
} from '@chakra-ui/react';
import { MdPostAdd, MdSearch, MdFilterList, MdFilterAlt } from 'react-icons/md';
import {
  QuoteTable,
  ConnectedQuoteDeleteAlertDialog,
  CreateQuoteForm,
  EditQuoteForm
} from '../../components';
import { TbRuler } from 'react-icons/tb';
import { useFetchQuotes, useSearchQuote, useUpdateQuote } from '../../hooks/useQuotes';
import { useServices } from '../../hooks/useServices';
import { useQuoteStatuses } from '../../hooks/useQuoteStatuses';
import { supabase } from '../../utils';
import { useQueryClient } from '@tanstack/react-query';
import useDebounce from '../../hooks/useDebounce';

function Estimates() {
  const queryClient = useQueryClient();

  // Chakra UI Hooks
  const initialRef = React.useRef();
  const toast = useToast();
  const { isOpen: isNewOpen, onOpen: onNewOpen, onClose: onNewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Custom React Hooks
  const { quotes, isLoading: quotesLoadingStateIsOn } = useFetchQuotes();
  const { services } = useServices();
  const { quoteStatuses } = useQuoteStatuses();

  // States to manage data
  const [selectedEstimateId, setSelectedEstimateId] = useState('');
  const [selectedEstimateNumber, setSelectedEstimateNumber] = useState('');
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

  const handleResetQuoteEditState = () => {
    onEditClose();
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

  const { mutate: mutateUpdateQuote, isLoading: quoteUpdateIsLoading } = useUpdateQuote(
    toast,
    handleResetQuoteEditState
  );

  const [searchQuote, setSearchQuote] = useState('');
  const [searchQuoteInput, setSearchQuoteInput] = useState('');
  const deboundedQuoteSearchTerm = useDebounce(searchQuoteInput, 100);
  const { quoteSearchResult, quoteSearchIsLoading } = useSearchQuote(deboundedQuoteSearchTerm);

  const searchEstimate = async (e) => {
    e.preventDefault();
  };

  // Update this function to handle delete functinality.
  const handleDelete = (estimateId, estimate_number) => {
    setSelectedEstimateId(estimateId);
    setSelectedEstimateNumber(estimate_number);
    onDeleteOpen();
  };

  /////////////////////////// Functions that handle edit functionality ////////////////////////////////
  const handleEditDrawer = (quote) => {
    setSelectedEditQuote({
      id: quote.id,
      quote_number: quote.quote_number,
      status_id: quote.status_id,
      service_id: quote.service_id,
      quote_date: quote.quote_date ? quote.quote_date : '',
      issue_date: quote.issue_date ? quote.issue_date : '',
      expiration_date: quote.expiration_date ? quote.expiration_date : '',
      note: quote.note,
      measurement_note: quote.measurement_note,
      cust_note: quote.cust_note
    });
    onEditOpen();
  };

  const handleEditOnChange = (e) => {
    setSelectedEditQuote({ ...selectedEditQuote, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await mutateUpdateQuote(selectedEditQuote);
  };

  return (
    <>
      <CreateQuoteForm
        initialRef={initialRef}
        isOpen={isNewOpen}
        onClose={onNewClose}
        services={services}
        quoteStatuses={quoteStatuses}
        toast={toast}
        data={quotes}
      />
      <ConnectedQuoteDeleteAlertDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onOpen={onDeleteOpen}
        toast={toast}
        itemNumber={selectedEstimateNumber}
        header={`Delete Quote`}
        entityDescription={`Quote #${selectedEstimateNumber}`}
        body={`Once you confirm you can't undo this action afterwards. There will be no way to restore the information. 🚨`}
      />
      <EditQuoteForm
        isOpen={isEditOpen}
        onClose={onEditClose}
        onOpen={onEditOpen}
        quote={selectedEditQuote}
        services={services}
        quoteStatuses={quoteStatuses}
        handleEditOnChange={handleEditOnChange}
        handleEditSubmit={handleEditSubmit}
        loadingState={quoteUpdateIsLoading}
      />
      <VStack my={'2rem'} w="100%" mx={'auto'} px={{ base: '1rem', lg: '2rem' }}>
        {/* <Box display={'flex'} marginBottom={'0rem'} justifyContent="start" w="full">
          <Link to={'/'}>
            <Button
              colorScheme={buttonColorScheme}
              ml={'1rem'}
              mb="1rem"
              leftIcon={<MdKeyboardArrowLeft size={'20px'} />}>
              Back
            </Button>
          </Link>
        </Box> */}
        <Card width="full" rounded={'xl'} shadow={'sm'} size={'lg'}>
          <CardBody>
            <HStack mb={'24px'} mx={'1rem'}>
              <Flex display={'flex'} mr={'auto'} alignItems={'center'} gap={8}>
                <Flex>
                  <Icon as={TbRuler} boxSize={'6'} my={'auto'} />
                  <Text fontSize={'2xl'} fontWeight="semibold" mx="14px">
                    Quotes
                  </Text>
                </Flex>
                <Flex>
                  <form method="GET" onSubmit={searchEstimate}>
                    <FormControl display={'flex'}>
                      <Input
                        variant={'outline'}
                        borderColor={'gray.300'}
                        value={searchQuoteInput}
                        onChange={({ target }) => setSearchQuoteInput(target.value)}
                        placeholder="Search for quotes..."
                        colorScheme="blue"
                        size={'md'}
                      />
                      <Tooltip label="Search">
                        <IconButton ml={'1rem'} type="submit" icon={<MdSearch />} />
                      </Tooltip>
                    </FormControl>
                  </form>
                </Flex>
              </Flex>
              <Flex justifyContent={'end'} gap={10}>
                <Flex gap={4}>
                  <Tooltip label="Filter">
                    <IconButton colorScheme={'gray'} icon={<MdFilterAlt />} />
                  </Tooltip>
                  <Tooltip label="Sort">
                    <IconButton colorScheme={'gray'} icon={<MdFilterList />} />
                  </Tooltip>
                  <Tooltip label="Create a new quote">
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
            {/* Table for all all quotes from DB */}
            {quotesLoadingStateIsOn === true ? (
              <Box w={'full'} h={'200px'}>
                <Skeleton h={'200px'} rounded={'xl'} />
              </Box>
            ) : (
              <>
                <QuoteTable
                  data={!searchQuoteInput ? quotes : quoteSearchResult}
                  handleDelete={handleDelete}
                  handleEditDrawer={handleEditDrawer}
                />
              </>
            )}
          </CardBody>
        </Card>
      </VStack>
    </>
  );
}

export default Estimates;
