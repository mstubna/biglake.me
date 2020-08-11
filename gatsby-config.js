module.exports = {
  siteMetadata: {
    title: `BigLake.me`,
    description: `BigLake.me`,
  },
  plugins: [
    `gatsby-plugin-material-ui`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `fonts`,
        path: `${__dirname}/src/fonts`,
      },
    },
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        bucketName: 'biglake.me',
        protocol: 'https',
        hostname: 'biglake.me',
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `BigLake.me`,
        short_name: `BigLake.me`,
        start_url: `/`,
        background_color: `#3566ab`,
        theme_color: `#3566ab`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`,
      },
    },
  ],
}
