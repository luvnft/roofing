import React, { useState } from 'react';
//import {Link, Redirect, useHistory} from 'react-router-dom';
import { useParams } from 'react-router-dom';
import supabase from '../../utils/supabaseClient.js';
import { useQuoteStatuses } from '../../hooks/useQuoteStatuses.jsx';
import {
  useFetchQuoteById,
  useUpdateQuote,
  useUpdateQuoteStatusById
} from '../../hooks/useQuotes.jsx';
import {
  EditQuoteForm,
  QuoteDetailsAddLineItemModal,
  QuoteDetailsHeader,
  QuoteDetailsMain,
  QuoteDetailsPane,
  QuoteDetailsPdfPreviewModal,
  QuoteDetailsQuickAction
} from '../../components/index.js';
import {
  Flex,
  useDisclosure,
  Container,
  useToast,
  useColorModeValue,
  Text,
  Spinner,
  Skeleton
} from '@chakra-ui/react';
import {
  useCreateQuoteLineItem,
  useDeleteQuoteLineItemById
} from '../../hooks/useQuoteLineItem.jsx';
import { useFetchAllServices } from '../../hooks/useServices.jsx';

const QuoteById = () => {
  const { id } = useParams();
  const toast = useToast();

  // Custom Hooks
  const { quoteById, isLoading: isQuoteByIdLoading } = useFetchQuoteById(id);
  const {
    data: services,
    isRoofingServicesLoading,
    isRoofingServicesError
  } = useFetchAllServices();
  const { quoteStatuses } = useQuoteStatuses();
  const { mutate: mutateUpdateQuoteStatusById, isLoading: isUpdateQuoteStatusByIdLoading } =
    useUpdateQuoteStatusById(toast, id);
  const { mutate: mutateCreateQuoteLineItem, isLoading: isCreateQuoteLineItemLoading } =
    useCreateQuoteLineItem(toast, id);
  const { mutate: mutateDeleteQuoteLineItemById, isLoading: isDeleteQuoteLineItemByIdLoading } =
    useDeleteQuoteLineItemById(toast, id);
  const { mutate: mutateUpdateQuote, isLoading: isUpdateQuoteLoading } = useUpdateQuote(toast);

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
  const [editSwitchIsOn, setEditSwitchIsOn] = useState(false);

  // React state input variables
  const [lineItemDescriptionInput, setLineItemDescriptionInput] = useState('');
  const [lineItemAmountInput, setLineItemAmountInput] = useState('');

  // Custom color configs for UX elements
  const bgColorMode = useColorModeValue('gray.100', 'gray.600');
  const paymentCardBgColor = useColorModeValue('gray.100', 'gray.600');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');

  // Handle quote status when selected in menu
  const handleQuoteStatusMenuSelection = async (status_id) => {
    if (status_id === quoteById?.status_id) {
      console.log(status_id);
      toast({
        position: 'top',
        title: `Error Updating Quote Status`,
        description: `Error: Status is already selected. Please select another status for quote.`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } else {
      mutateUpdateQuoteStatusById(status_id);
    }
  };

  //////////////////////// Functions to handle line items //////////////////////////////
  const handleLineItemDelete = async (item) => {
    mutateDeleteQuoteLineItemById(item);
  };

  const handleAddLineItemSubmit = async (e) => {
    e.preventDefault();
    mutateCreateQuoteLineItem(lineItemObject);
    onAddLineItemClose();
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
    mutateUpdateQuote(selectedEditQuote);
    onEditQuoteClose();
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

  const lineItemObject = {
    quote_id: quoteById?.quote_number,
    service_id: quoteById?.service_id,
    qty: 1,
    amount: lineItemAmountInput,
    description: lineItemDescriptionInput,
    fixed_item: true
  };

  // Convert Quote to Invoice

  // Handle adding new line item to quote
  const handlePDFDownload = () => {
    onExportPDFClose();
  };

  if (isQuoteByIdLoading === true) {
    return (
      <>
        <Container maxW={'1440px'} mt={'1rem'} mb={'2rem'}>
          <Flex gap={2} justify={'center'} px={'1rem'} py="1rem">
            {/* <Spinner size={'sm'} my={'auto'} /> */}
            <Skeleton width={'full'} height={'100vh'} rounded={'lg'} />
            {/* <Text fontSize={'xl'} fontWeight={'bold'}>
              Loading...
            </Text> */}
          </Flex>
        </Container>
      </>
    );
  }

  return (
    <Container maxW={'1400px'} mt={'1rem'} mb={'2rem'}>
      {/* <DeleteInvoiceLineServiceAlertDialog toast={handleDeleteToast} updateParentState={getInvoiceDetailsById} /> */}
      <QuoteDetailsHeader
        quoteById={quoteById}
        onExportPDFOpen={onExportPDFOpen}
        handleEditQuoteModal={handleEditQuoteModal}
      />
      <Flex px={'1rem'} gap={6} flexDir={{ base: 'column', lg: 'row' }}>
        {/* Left Section */}
        <Flex w={{ base: 'full', lg: '65%' }}>
          <QuoteDetailsMain
            quoteById={quoteById}
            paymentCardBgColor={paymentCardBgColor}
            secondaryTextColor={secondaryTextColor}
            handleLineItemDelete={handleLineItemDelete}
            editSwitchIsOn={editSwitchIsOn}
            bgColorMode={bgColorMode}
          />
        </Flex>
        {/* Right Section */}
        <Flex w={{ base: 'full', lg: '35%' }} direction={'column'} gap={4}>
          <QuoteDetailsQuickAction
            quoteById={quoteById}
            loadingQuoteStatusIsOn={isUpdateQuoteStatusByIdLoading}
            handleQuoteStatusMenuSelection={handleQuoteStatusMenuSelection}
            onAddLineItemOpen={onAddLineItemOpen}
            editSwitchIsOn={editSwitchIsOn}
            setEditSwitchIsOn={setEditSwitchIsOn}
          />
          <QuoteDetailsPane
            quoteById={quoteById}
            paymentCardBgColor={paymentCardBgColor}
            secondaryTextColor={secondaryTextColor}
          />
        </Flex>
      </Flex>
      <EditQuoteForm
        onClose={onEditQuoteClose}
        isOpen={isEditQuoteOpen}
        quote={selectedEditQuote}
        services={services}
        quoteStatuses={quoteStatuses}
        handleEditOnChange={handleEditQuoteOnChange}
        handleEditSubmit={handleEditQuoteSubmit}
      />
      {/* Export Quote PDF Preview */}
      <QuoteDetailsPdfPreviewModal
        quoteById={quoteById}
        onExportPDFClose={onExportPDFClose}
        isExportPDFOpen={isExportPDFOpen}
        handlePDFDownload={handlePDFDownload}
      />
      <QuoteDetailsAddLineItemModal
        handleAddLineItemSubmit={handleAddLineItemSubmit}
        onAddLineItemClose={onAddLineItemClose}
        isAddLineItemOpen={isAddLineItemOpen}
        setLineItemAmountInput={setLineItemAmountInput}
        setLineItemDescriptionInput={setLineItemDescriptionInput}
        loadingQuoteStatusIsOn={isUpdateQuoteStatusByIdLoading}
      />
    </Container>
  );
};

export default QuoteById;
