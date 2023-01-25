import React, {useState, useEffect} from 'react';
// import { useHistory } from "react-router-dom";
import { useNavigate, Link } from 'react-router-dom';
import { useColorModeValue, useToast, Box, Flex, FormControl, Input, Button, Text, useDisclosure, VStack, TableContainer, Td, Tr, Tooltip, Th, Tbody, TableCaption, Table, Thead, HStack, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Skeleton, Avatar, Badge} from '@chakra-ui/react';
import axios from 'axios';
import swal from 'sweetalert';
import supabase from '../../utils/supabaseClient';
import formatNumber from '../../utils/formatNumber';
import { Card, CustomerOptions, EditInvoiceForm, NewInvoiceForm, Invoice, DeleteAlertDialog } from '../../components';
import { MdKeyboardArrowLeft, MdPostAdd, MdSearch, MdKeyboardArrowRight, MdEdit, MdDelete, MdFilterList, MdFilterAlt, MdToday } from 'react-icons/md';
import formatMoneyValue from '../../utils/formatMoneyValue';

function Invoices() {
    //Defining variables
    const {isOpen: isNewOpen , onOpen: onNewOpen, onClose: onNewClose } = useDisclosure();
    const {isOpen: isEditOpen , onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure()
    const initialRef = React.useRef();
    let navigate = useNavigate();
    const toast = useToast()

    //Style for Card component
    const bg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const buttonColorScheme = useColorModeValue('gray', 'gray');

    //React States to manage data
    const [invoices, getInvoices] = useState(null);
    const [customers, setCustomers] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [cuIdCaptured, setCuIdCaptured] = useState('');
    const [searchCustomer, setSearchCustomer] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [amountDue, setAmountDue] = useState('');
    const [selectInvoiceStatus, setSelectInvoiceStatus] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [selectJobTypeOption, setJobTypeOption] = useState('');
    const [searchInvoiceInput, setSearchInvoiceInput] = useState('');
    const [selectedEditInvoice, setSelectedEditInvoice] = useState(null);

    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState('');

    // Functions to program events or actions
    useEffect(() => {
        getAllInvoices();
        // getCustomers();
    }, []);

    const getAllInvoices = async() => {
        const {data: allInvoices, error} = await supabase
        .from('invoice')
        .select('*, customer:customer_id(*), invoice_status:invoice_status_id(*), service_type:service_type_id(*)')

        if(error){
            console.log(error)
        }
        getInvoices(allInvoices)
        console.log(allInvoices)
    }

    const searchInvoice = async() => {

    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        const url2 = `http://${process.env.REACT_APP_BASE_URL}:8081/api/invoices/add`
        const json = {
            customerId: cuIdCaptured,
            jobTypeId: selectJobTypeOption,
            invStatusId: selectInvoiceStatus,
            service_name: serviceName,
            inv_date: invoiceDate,
            due_date: dueDate,
            amount_due: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountDue)}`
        }
        await axios.post(url2, json)
        .then((response) => {
            console.log('I was submitted', response);
        })
        .catch((err) => {
            console.error(err);
            swal("Good job!", "You clicked the button!", "error");
        })
        console.log('Submit Function works!')
        //history.go(0);
        setJobTypeOption('');
        setSelectInvoiceStatus('');
        setServiceName('');
        setInvoiceDate('');
        setDueDate('');
        setAmountDue('');
        getAllInvoices();
    };

    const handleJobTypeInput = (e) => {
        const selectedValue = e.target.value;
        setJobTypeOption(selectedValue);
    };
    
    const handleInvoiceStatusInput = (e) => {
        const selectedValue = e.target.value;
        setSelectInvoiceStatus(selectedValue);
    };

    const handleSelectedCustomer = (selectedCustomer) => {
        // const value = e.target.value;
        // setSelectedCustomer(value)
        setSelectedCustomer({ 
            selectedCustomer: selectedCustomer || []
        })
        // console.log(selectedCustomer.value)
        const selectedCuId = selectedCustomer.value
        // console.log(selectedCustomer.e.value)
        setCuIdCaptured(selectedCuId);
        console.log(selectedCuId);
        // console.log(cuIdCaptured)
    };

    const loadOptions = async (inputText, callback) => {
        await axios.get(`http://${process.env.REACT_APP_BASE_URL}:8081/api/customers/?name=${inputText}`)
        .then((response) => {
            // const allCustomers = response.data;
            //add data to state
            // setCustomers(allCustomers);
            callback(response.data.map(customer =>({label: customer.name, value: customer.id, email: customer.email})))
        })
        .catch(error => console.error(`Error: ${error}`))
    };

    const formValidation = (value) => {
        let error
        if(!value){
            error = 'Field is required'
        } 

        return error;
    }


    const handleEditModal = (invoice) => {
        setSelectedEditInvoice(invoice)
        onEditOpen()
    }

    const handleDeleteAlert = (invoiceId, invoice_number) => {
        setSelectedInvoiceId(invoiceId);
        setSelectedInvoiceNumber(invoice_number);
        onDeleteOpen();
    }

    const handleDeleteToast = (invoice_number) => {
        toast({
            position: 'top-right',
            title: `Invoice #${invoice_number} deleted!`,
            description: "We've deleted invoice for you.",
            status: 'success',
            duration: 5000,
            isClosable: true,
        })
    }

    return (
        <>  
        <VStack my={'2rem'} w='100%' mx={'auto'} px={{base: '1rem', lg: '2rem'}}>
            {/* <Alert status='success' mb={'1rem'} flexDir={'column'} alignItems={'center'} justifyContent={'center'} textAlign={'center'} height={'200px'} rounded={'8'}>
                <AlertIcon boxSize='40px' mr={0} />
                <AlertTitle mt={4} mb={1} fontSize='lg'>Invoice Submitted!</AlertTitle>
                <AlertDescription maxWidth='sm'>New invoice saved to the server. Fire on! 👋</AlertDescription>
            </Alert> */}
            <Box display={'flex'} marginBottom={'0rem'} justifyContent='start' w='full'>
                    <Link to={'/'}>
                        <Button colorScheme={'gray'} ml={'1rem'} mb='1rem' leftIcon={<MdKeyboardArrowLeft size={'20px'}/>}>Back</Button> 
                    </Link>
                </Box>
                <Card width='full' bg={bg} borderColor={borderColor}>
                    <HStack mt={'1rem'} mb={'2rem'}>
                        <Box display={'flex'} mr={'auto'}>
                            <Text fontSize={'3xl'} fontWeight='semibold' mx='14px'>Invoices</Text>
                        </Box>
                        <Box display='flex' pr='1rem' mr={'1rem'} justifyContent={'end'} >
                            <form method='GET' onSubmit={searchInvoice}>
                                <FormControl display={'flex'}>
                                    <Input value={searchInvoiceInput} onChange={({target}) => setSearchInvoiceInput(target.value)} placeholder='Search for Invoice' colorScheme='blue' border='2px'/>
                                    <Tooltip label='Search'><Button ml={'1rem'} type='submit'><MdSearch size={'25px'}/></Button></Tooltip>
                                </FormControl>
                            </form>
                            <Tooltip label='Filter'><Button colorScheme={'gray'} ml='2rem'><MdFilterAlt size={'20px'}/></Button></Tooltip>
                            <Tooltip label='Sort'><Button colorScheme={'gray'} ml='1rem'><MdFilterList size={'20px'}/></Button></Tooltip>
                            <Tooltip label='Create New Invoice'><Button colorScheme='blue' variant='solid' onClick={onNewOpen} ml='1rem'><MdPostAdd size={'20px'}/></Button></Tooltip>
                        </Box>
                    </HStack>
                    <TableContainer>
                        {invoices ? <>
                            <Table variant={'simple'} size='sm'>
                                <TableCaption overflowX={'auto'}>Total of {invoices?.length} Invoices in our system ✌️</TableCaption>
                                <Thead>
                                    <Tr>
                                        <Th textAlign={'center'}>Invoice #</Th>
                                        <Th textAlign={'center'}>Status</Th>
                                        <Th>Service</Th>
                                        <Th>Invoice Date</Th>
                                        {/* <Th>Issue Date</Th> */}
                                        <Th>Due Date</Th>
                                        <Th>Customer</Th>
                                        {/* <Th>Customer Email</Th> */}
                                        <Th>Phone Number</Th>
                                        <Th>Total</Th>
                                        <Th textAlign={'center'}>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {/* Table Row Data Component */}
                                    {invoices?.map((invoice, index) => (
                                        <Tr key={invoice.id}>
                                            <Td textAlign={'center'}><Text fontSize={'md'} fontWeight={'bold'}>{formatNumber(invoice.invoice_number)}</Text></Td>    
                                            <Td textAlign={'center'}><Badge w={'80px'} variant={'solid'} mx={'auto'} colorScheme={invoice.invoice_status.name === 'New' ? 'green' : '' || invoice.invoice_status.name === 'Paid' ? 'blue' : '' || invoice.invoice_status.name === 'Sent' ? 'yellow' : '' || invoice.invoice_status.name === 'Overdue' ? 'red' : ''} p='1' rounded={'xl'} align='center'>{invoice.invoice_status.name}</Badge></Td>
                                            <Td><Text>{invoice.service_type.name}</Text></Td>
                                            <Td><Text>{invoice.invoice_date}</Text></Td>
                                            {/* <Td><Text>{invoice.issue_date ? invoice.issue_date : ''}</Text></Td> */}
                                            <Td><Text>{invoice.due_date}</Text></Td>
                                            {/* <Td><Flex>{invoice.customer.first_name} {invoice.customer.last_name}</Flex></Td> */}
                                            <Td>{invoice.customer.first_name && invoice.customer.last_name ? <><Flex><Link to={`/editcustomer/${invoice.customer.id}`}><Button variant={'ghost'} colorScheme={'facebook'}><Avatar size={'xs'} mr={'8px'} my={'auto'} /><Flex flexDir={'column'}><Flex fontWeight={'bold'} fontSize={'xs'}><Text marginRight={'4px'}>{invoice.customer.first_name}</Text><Text>{invoice.customer.last_name}</Text></Flex><Flex mt={'4px'} fontWeight={'light'} fontSize={'xs'}>{invoice.customer.email}</Flex></Flex></Button></Link></Flex></> : <>{invoice.customer.company_name}</>}</Td>
                                            {/* <Td><Text>{invoice.customer.email}</Text></Td> */}
                                            <Td><Text>{invoice.customer.phone_number}</Text></Td>
                                            <Td><Text>${formatMoneyValue(invoice.total ? invoice.total : 0)}</Text></Td>
                                            <Td textAlign={'center'}><Tooltip label='Edit'><Button mr={'1rem'} onClick={() => {handleEditModal(invoice)}}><MdEdit/></Button></Tooltip><Tooltip label='Delete'><Button onClick={() => {handleDeleteAlert(invoice.id, invoice.invoice_number)}} mr={'1rem'}><MdDelete/></Button></Tooltip><Link to={`/editinvoice/${invoice.invoice_number}`}><Tooltip label='Go to Invoice Details '><Button ml={'0rem'} colorScheme={'gray'} variant='solid'><MdKeyboardArrowRight size={'20px'}/></Button></Tooltip></Link></Td>
                                        </Tr>

                                    ))}
                                </Tbody>
                            </Table>
                        </> : <Skeleton height={'100px'} rounded={'md'}/>}
                    </TableContainer>
                </Card> 
                <NewInvoiceForm isNewOpen={isNewOpen} onNewClose={onNewClose} onNewOpen={onNewOpen} fetchInvoice={getAllInvoices} toast={toast}/>
                <EditInvoiceForm initialRef={initialRef} isOpen={isEditOpen} onClose={onEditClose} invoice={selectedEditInvoice}/>
                <DeleteAlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose} onOpen={onDeleteOpen} toast={handleDeleteToast} updateParentState={getAllInvoices} header={`Delete Invoice #${selectedInvoiceNumber}`} body={`Are you sure? You can't undo this action afterwards.`} tableName={'invoice'} itemId={selectedInvoiceId} itemNumber={selectedInvoiceNumber} />
        </VStack>
        </>
    )
}

export default Invoices
