module.exports = {
  siteMetadata: {
    title: `Lunch.js`,
    description: `Lunch with your js.la friends. Every month on the first Tuesday.`,
    author: `@jsla`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#f7df1e`,
        theme_color: `#f7df1e`,
        display: `minimal-ui`,
        icon: `src/images/lunch.js.png`, // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-styled-components',
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
