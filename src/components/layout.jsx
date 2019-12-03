/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Grommet, Box, Grid } from 'grommet';
import styled, { createGlobalStyle } from 'styled-components';
import { Normalize } from 'styled-normalize';
import theme from '../styles/theme';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    font-family: 'Open Sans', sans-serif;
  }
`;

const CustomGrommet = styled(Grommet)`
  background: linear-gradient(60deg, rgba(255, 165, 150, 0.5) 5%, rgba(255, 228, 0, 0.35));
  font-family: inherit;
`;

const AppGrid = styled(Grid)`
  min-height: 100vh;
`;

const Layout = ({ children }) => {
  return (
    <>
      <Normalize />
      <GlobalStyle />
      <CustomGrommet theme={theme}>
        <AppGrid
          fill
          rows={['auto', 'flex', 'auto']}
          columns={['flex']}
          areas={[
            { name: 'header', start: [0, 0], end: [1, 0] },
            { name: 'main', start: [0, 1], end: [1, 1] },
            { name: 'footer', start: [0, 2], end: [1, 2] },
          ]}
        >
          <Box gridArea="main" justify="center" align="center">
            {children}
          </Box>
          <Box
            gridArea="footer"
            justify="center"
            align="center"
            pad={{ horizontal: 'large', vertical: 'small' }}
          >
            © 
            {' '}
            {new Date().getFullYear()}
, Built with
            <a href="https://www.gatsbyjs.org">Gatsby</a>
          </Box>
        </AppGrid>
      </CustomGrommet>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
