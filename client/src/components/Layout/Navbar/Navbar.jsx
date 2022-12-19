import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Text,
  Flex,
  UnorderedList,
  ListItem,
  Image,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Divider,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Toggle from "./Toggle";
import { Link } from "react-router-dom";
import {
  MdDashboard,
  MdRequestPage,
  MdScheduleSend,
  MdSquareFoot,
  MdPeopleAlt,
} from "react-icons/md";
import { FiTrello, FiUsers, FiInbox, FiGrid, FiFileText } from "react-icons/fi";
import { TbRuler } from "react-icons/tb";
import { AiFillSchedule } from "react-icons/ai";
import { useAuth } from "../../../contexts/auth";

const Navbar = () => {
  const auth = useAuth();
  //Style for Card component
  const bg = useColorModeValue("white", "gray.700");
  const buttonBackground = useColorModeValue("gray.100", "gray.600");
  const tooltipBackground = useColorModeValue("gray.700", "gray.100");
  const iconColors = useColorModeValue("#454947", "white");

  const [loggedInUserData, setloggedInUserData] = useState("");
  return (
    <Flex
      zIndex={"1"}
      position="fixed"
      w={{ base: "full", lg: "6rem" }}
      h={{ base: "5rem", lg: "100vh" }}
      bg={bg}
      roundedTopRight={{ base: "0", lg: "0" }}
      roundedBottomRight={{ base: "0", lg: "0" }}
      flexDir={{ base: "row", lg: "column" }}
      shadow={"md"}
      p="0"
      m="0"
      top={{ base: "0", lg: "0" }}
    >
      <Link to="/">
        <Box
          display={"flex"}
          p="1rem"
          justifyContent={"center"}
          h={{ base: "full", lg: "auto" }}
        >
          <Box
            display="flex"
            flexDir={{ base: "column", lg: "column" }}
            h={{ base: "full", lg: "4rem" }}
            bg={"blue.500"}
            shadow="sm"
            rounded="18"
            justifyContent={{ base: "center", lg: "center" }}
            px={{ base: "0px", lg: "0rem" }}
            _hover={{ bg: "blue.600" }}
          >
            <Image
              p={{ base: "3px", lg: "4px" }}
              mx={{ base: "auto", lg: "auto" }}
              marginLeft={{ base: "0px", lg: "0" }}
              boxSize={{ base: "50px", lg: "90px" }}
              src="https://github.com/rrios4/roofing-webapp/blob/main/client/src/assets/LogoRR.png?raw=true"
            />
          </Box>
        </Box>
      </Link>
      <VStack spacing="8" color={"white"}>
        <Box
          display="flex"
          color="white"
          justifyContent="center"
          paddingTop="10px"
          paddingBottom="0px"
        >
          <Tooltip label="SimplyNex" bg="gray.500">
            <Avatar
              shadow="sm"
              size="md"
              src={
                "https://64.media.tumblr.com/073578da50f557bd56caef112e255950/b754da231bb4bd69-34/s640x960/4f8c9cf93d4f03c42d448eba0dac2a9cbb2a69e2.jpg"
              }
            />
          </Tooltip>
        </Box>
        <Text color={"GrayText"} fontSize={"10px"} fontWeight={"bold"}>
          ANALYTICS
        </Text>
        <Link to={"/"}>
          <Tooltip label="Dashboard" bg={tooltipBackground}>
            <Box p={"1"} rounded="md" _hover={{ bg: buttonBackground }}>
              {/* <MdDashboard color={iconColors} size={"28px"} /> */}
              <FiGrid color={iconColors} size={"25px"} />
            </Box>
          </Tooltip>
        </Link>
        <Text color={"GrayText"} fontSize={"10px"} fontWeight={"bold"}>
          CONTENT
        </Text>
        <Link to={"/estimate-requests"}>
          <Tooltip label="Quote Requests" bg={tooltipBackground}>
            <Box p={"1"} rounded="md" _hover={{ bg: buttonBackground }}>
              {/* <MdScheduleSend size={'30px'}/> */}
              {/* <AiFillSchedule color={iconColors} size={"28px"} /> */}
              <FiInbox color={iconColors} size="25px" />
            </Box>
          </Tooltip>
        </Link>
        <Link to={"/invoices"}>
          <Tooltip label="Invoices" bg={tooltipBackground}>
            <Box p={"1"} rounded="md" _hover={{ bg: buttonBackground }}>
              {/* <MdRequestPage color={iconColors} size={"28px"} /> */}
              <FiFileText color={iconColors} size={"25px"} />
            </Box>
          </Tooltip>
        </Link>
        <Link to={"/estimates"}>
          <Tooltip label="Quotes" bg={tooltipBackground}>
            <Box p={"1"} rounded="md" _hover={{ bg: buttonBackground }}>
              {/* <MdSquareFoot color={iconColors} size={"28px"} /> */}
              <TbRuler color={iconColors} size={"25px"} />
            </Box>
          </Tooltip>
        </Link>
        <Link to={"/customers"}>
          <Tooltip label="Customers" bg={tooltipBackground}>
            <Box p={"1"} rounded="md" _hover={{ bg: buttonBackground }}>
              {/* <MdPeopleAlt color={iconColors} size={"28px"} /> */}
              <FiUsers color={iconColors} size={"25px"} />
            </Box>
          </Tooltip>
        </Link>
      </VStack>
      <Box
        display={{ base: "none", lg: "flex" }}
        justifyContent="center"
        marginTop={{ base: "0", lg: "auto" }}
        marginLeft={{ base: "auto", lg: "0" }}
        p="0rem"
      >
        {/* <Link to='/'>
                    <Box _hover={{bg: "gray.600"}} rounded='md' p='8px' color='white'>
                        <Tooltip label='Home' bg="gray.500">
                            <HomeIcon fontSize='large' _hover={{bg: "red"}}/>
                        </Tooltip>
                    
                    </Box>
                </Link> */}
        <Box
          display={{ base: "none", lg: "flex" }}
          color="white"
          justifyContent="center"
          paddingTop="1rem"
          paddingBottom="1rem"
        >
          <Toggle />
        </Box>
      </Box>
    </Flex>
  );
};

export default Navbar;
