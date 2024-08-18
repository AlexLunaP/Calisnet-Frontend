import React from "react";
import { Box, Container } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box>
      <Header />
      <Container maxW="container.lg" py={6}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
