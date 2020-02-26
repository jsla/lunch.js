/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Grommet, Box, Grid, Text } from 'grommet';
import styled, { createGlobalStyle } from 'styled-components';
import { Normalize } from 'styled-normalize';
import BackgroundImage from 'gatsby-background-image';
import { graphql, StaticQuery } from 'gatsby';
import theme from '../styles/theme';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    font-family: "Source Sans Pro", Helvetica, sans-serif;
  }
`;

const CustomGrommet = styled(Grommet)`
  font-family: inherit;
`;

const AppGrid = styled(Grid)`
  min-height: 100vh;
`;

const GatsbyLink = styled.a`
  color: inherit;
  text-decoration: none;
`;

const Footer = styled(Box)`
  grid-area: footer;
  justify-content: center;
  padding: ${props => props.theme.global.edgeSize.medium};
  color: #fff;
  font-size: 1rem;
  text-align: center;
  text-transform: uppercase;
`;

const BGImage = ({ children, className }) => (
  <StaticQuery
    query={graphql`
      query {
        bg: file(relativePath: { eq: "bg.jpg" }) {
          childImageSharp {
            fluid(quality: 90, maxWidth: 1920) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
        overlay: file(relativePath: { eq: "overlay.png" }) {
          childImageSharp {
            fluid(quality: 90, maxWidth: 1920) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    `}
    render={data => {
      const bg = data.bg.childImageSharp.fluid;
      const overlay = data.overlay.childImageSharp.fluid;
      const backgroundFluidImageStack = [
        overlay,
        'linear-gradient(60deg, rgba(255, 165, 150, 0.5) 5%, rgba(255, 228, 0, 0.35))',
        bg,
      ];
      return (
        <BackgroundImage tag="div" className={className} fluid={backgroundFluidImageStack}>
          {children}
        </BackgroundImage>
      );
    }}
  />
);

BGImage.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

BGImage.defaultProps = {
  children: null,
  className: null,
};

const BG = styled(BGImage)`
  background-repeat: repeat, no-repeat, no-repeat;
  background-position: top left, center center, bottom center;
  background-size: 100px 100px, cover, cover;
  background-attachment: fixed, fixed, fixed;
`;

function Layout({ children }) {
  return (
    <>
      <Normalize />
      <GlobalStyle />
      <BG>
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
            <Box gridArea="main" justify="center" align="center" as="main" margin="large">
              {children}
            </Box>
            <Footer
              gridArea="footer"
              justify="center"
              align="center"
              pad={{ horizontal: 'large', vertical: 'medium' }}
              as="footer"
            >
              <Text size="small" weight={300}>
                {`© JS.LA ${new Date().getFullYear()} | Design: HTML5 UP`}
              </Text>
              <br />
              <Text size="small" weight={300}>
                {'Built with '}
                <GatsbyLink href="https://www.gatsbyjs.org">Gatsby</GatsbyLink>
              </Text>
            </Footer>
          </AppGrid>
        </CustomGrommet>
      </BG>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
