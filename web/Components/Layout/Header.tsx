import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Center,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import AthletesSearch from "../Athlete/AthletesSearch";

interface UserData {
  userId: string;
  username: string;
  userEmail: string;
  profileImageUrl: string;
}

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Competitions",
    href: "/competitions",
    children: [
      {
        label: "Explore Competitions",
        href: "/competitions",
      },
      {
        label: "My Competitions",
        href: "/competitions/my-competitions",
      },
      {
        label: "Create a new competition",
        href: "/competitions/create",
      },
    ],
  },
];

export default function Header() {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (session) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/users/${session.userId}`
        )
        .then((response) => {
          console.log(response);
          const data = response.data;
          setUserData({
            userId: data.user_id || "",
            username: data.username || "",
            userEmail: data.user_email || "",
            profileImageUrl: data.profile_image_url || "",
          });
        })
        .catch((error) => {
          if (error.response) {
            if (error.response.status >= 400) {
              router.push("/login");
              signOut({ callbackUrl: "/login" });
            }
          }
        });
    }
  }, [router, session]);

  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <Box>
      <Flex
        bg={"softPeach"}
        color={"gray.600"}
        minH={"40px"}
        py={{ base: 1 }}
        px={{ base: 2 }}
        pl={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={"gray.200"}
        align={"center"}
        justify={"center"}
      >
        {/* Mobile Menu Button */}
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>

        {/* Logo and Navigation */}
        <Flex
          flex={{ base: 1 }}
          justify={{ base: "flex-start", md: "flex-start" }}
          align="center"
        >
          <Flex justify="flex-start" align="center">
            <Text
              textAlign={useBreakpointValue({ base: "center", md: "left" })}
              fontFamily={"heading"}
              color={"gray.800"}
            >
              <Link href="/">
                <Image src="/logo.png" alt="Logo" width={60} height={60} />
              </Link>
            </Text>
            <Link href="/">
              <Text
                ml={2}
                fontWeight={"bold"}
                fontSize={"larger"}
                color={"gray.800"}
                fontFamily={"heading"}
                textAlign={useBreakpointValue({ base: "center", md: "left" })}
              >
                Calisnet
              </Text>
            </Link>
          </Flex>

          {/* Desktop Navigation */}
          <Flex justify="center" ml={10} display={{ base: "none", md: "flex" }}>
            <DesktopNav />
          </Flex>
          <Text
            ml={10}
            fontSize={"large"}
            fontFamily={"heading"}
            cursor="pointer"
            onClick={onModalOpen}
            _hover={{
              textDecoration: "none",
              color: "charcoalGray",
            }}
          >
            Athletes
          </Text>
          <AthletesSearch isOpen={isModalOpen} onClose={onModalClose} />
        </Flex>

        {/* Sign In / Sign Up Buttons or Profile Button */}
        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
          pr={4}
        >
          {status === "authenticated" ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar size={"sm"} src={userData?.profileImageUrl} />
              </MenuButton>
              <MenuList alignItems={"center"}>
                <br />
                <Center>
                  <Avatar size={"2xl"} src={userData?.profileImageUrl} />
                </Center>
                <br />
                <Center>
                  <Text>{session?.user?.name}</Text>
                </Center>
                <br />
                <MenuDivider />
                <MenuItem onClick={() => router.push("/settings")}>
                  Settings
                </MenuItem>
                <MenuItem
                  onClick={() => router.push(`/user/${userData?.username}`)}
                >
                  Your Profile
                </MenuItem>
                <MenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  color={"lightGray"}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Center>
                <Link href="/login" passHref>
                  <Button
                    as={"a"}
                    fontSize={"md"}
                    fontWeight={400}
                    variant={"link"}
                    mr={6}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button
                    as={"a"}
                    display={{ base: "inline-flex", md: "inline-flex" }}
                    fontSize={"md"}
                    fontWeight={600}
                    color={"white"}
                    bg={"deepOrange"}
                    mr={4}
                    _hover={{
                      bg: "warmYellow",
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </Center>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box ref={mobileNavRef}>
          <MobileNav />
        </Box>
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const linkColor = "lightGray";
  const linkHoverColor = "charcoalGray";
  const popoverContentBgColor = "white";

  const handleNavClick = (href: string) => {
    if (href === "/competitions/my-competitions" && !session) {
      router.push("/login");
    } else {
      router.push(href);
    }
  };

  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <NextLink href={navItem.href ?? "/"} passHref>
                <ChakraLink
                  p={2}
                  fontSize={"large"}
                  fontWeight={500}
                  color={linkColor}
                  _hover={{
                    textDecoration: "none",
                    color: linkHoverColor,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(navItem.href ?? "/");
                  }}
                >
                  {navItem.label}
                </ChakraLink>
              </NextLink>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={popoverContentBgColor}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <NextLink
                      href={child.href ?? "/"}
                      key={child.label}
                      passHref
                    >
                      <ChakraLink
                        role={"group"}
                        display={"block"}
                        p={2}
                        rounded={"md"}
                        _hover={{ bg: "lightOrange" }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(child.href ?? "/");
                        }}
                      >
                        <Stack direction={"row"} align={"center"}>
                          <Box>
                            <Text
                              transition={"all .3s ease"}
                              _groupHover={{ color: "charcoalGray" }}
                              fontWeight={500}
                            >
                              {child.label}
                            </Text>
                            <Text fontSize={"sm"}>{child.subLabel}</Text>
                          </Box>
                        </Stack>
                      </ChakraLink>
                    </NextLink>
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const MobileNav = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <Stack bg={"white"} p={4} display={{ md: "none" }} ref={ref}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
});

MobileNav.displayName = "MobileNav";

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Link href={href ?? "#"} passHref>
        <Box
          py={2}
          justifyContent="space-between"
          alignItems="center"
          _hover={{
            textDecoration: "none",
          }}
        >
          <Text fontWeight={600} color={"gray.600"}>
            {label}
          </Text>
          {children && (
            <Icon
              as={ChevronDownIcon}
              transition={"all .25s ease-in-out"}
              transform={isOpen ? "rotate(180deg)" : ""}
              w={6}
              h={6}
            />
          )}
        </Box>
      </Link>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={"gray.200"}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <NextLink href={child.href ?? "/"} key={child.label} passHref>
                <ChakraLink>
                  <Box py={2}>{child.label}</Box>
                </ChakraLink>
              </NextLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};
