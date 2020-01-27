import React from 'react';
import { Box, Heading, Paragraph, Image, Button } from 'grommet';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import logo from '../images/lunch.js.png';

const Title = styled(Heading)`
  font-weight: 300;
  font-size: 1.85rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
`;

const Header = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: ${props => props.theme.global.edgeSize.large};

  &:before,
  &:after {
    flex: 1 1 100%;
    width: 100%;
    height: 1px;
    background-color: #c8cccf;
    content: '';
  }

  &:before {
    margin-right: ${props => props.theme.global.edgeSize.medium};
  }

  &:after {
    margin-left: ${props => props.theme.global.edgeSize.medium};
  }
`;

const Frame = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-content: center;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 50%;
`;

const Subtitle = styled(Paragraph)`
  width: 100%;
  max-width: none;
  text-transform: uppercase;
`;

const Logo = styled(Image)`
  width: 100%;
`;

const CustomButton = styled(Button)`
  display: block;
  width: 12rem;
  margin: 0 auto ${props => props.theme.global.edgeSize.small};
  font-weight: 300;
  text-align: center;
  text-transform: uppercase;

  &:hover {
    color: ${props => props.theme.global.colors['accent-1']};
    border-color: ${props => props.theme.global.colors['accent-1']};
    box-shadow: none;
    transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;
  }

  @media screen and (min-width: 768px) {
    display: inline-block;
    width: auto;
    margin: ${props => props.theme.global.edgeSize.xsmall};
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.global.edgeSize.xsmall}
    ${props => props.theme.global.edgeSize.large} ${props => props.theme.global.edgeSize.large};
  text-align: center;

  p {
    width: 100%;
  }
`;

const IndexPage = () => (
  <Layout>
    <SEO title="Lunch.js" />
    <motion.div
      initial={{
        opacity: 0,
        rotateX: '20deg',
      }}
      animate={{
        opacity: 1,
        rotateX: '0deg',
      }}
      transition={{
        delay: 0.2,
        duration: 1,
        rotateX: { type: 'spring', stiffness: 200 },
        opacity: { type: 'spring', stiffness: 100 },
      }}
    >
      <Box background="white" align="center" padding={{ vertical: 'xlarge' }}>
        <Header>
          <Frame>
            <Logo src={logo} alt="" />
          </Frame>
        </Header>
        <Content>
          <Title size="small">Lunch.JS</Title>
          <Subtitle size="small">Lunch with your JS.LA friends.</Subtitle>
          <Subtitle size="small">Every month on the first Tuesday.</Subtitle>
          <CustomButton
            data-test-id="join-button"
            fill
            label="Join a Lunch"
            primary
            href="https://github.com/jsla/lunch.js/issues"
          />
          <CustomButton
            data-test-id="new-button"
            fill
            autoCapitalize="true"
            primary
            label="Start a Lunch"
            href="https://github.com/jsla/lunch.js/issues/new"
          />
        </Content>
      </Box>
    </motion.div>
  </Layout>
);

export default IndexPage;
