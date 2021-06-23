const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'VidCheck',
  tagline: 'Open Source platform for publishing video fact-checks',
  url: 'https://vidcheck.factly.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'factly', // Usually your GitHub org/user name.
  projectName: 'vidcheck', // Usually your repo name.
  themeConfig: {
    navbar: {
      // title: 'VidCheck',
      logo: {
        alt: 'VidCheck Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'right',
          label: 'Docs',
        },
        // {
        //     to: '/blog', 
        //     label: 'Blog',
        //     position: 'left'
        // },
        {
          href: 'https://github.com/factly/vidcheck',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'http://slack.factly.org',
          label: 'Slack',
          position: 'right',
        },        
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'About',
          items: [
            {
              label: 'Factly Media & Research',
              to: 'https://factly.in',
            },
            {
              label: 'About Us',
              to: 'https://factly.in/about',
            },
            {
              label: 'Contact',
              to: 'mailto:admin@factly.in',
            },
            {
              label: 'Privacy Policy',
              to: 'docs/privacy-policy',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Github',
              to: 'https://github.com/factly',
            },
            {
              label: 'Facebook',
              to: 'https://facebook.com/factlyindia',
            },
            {
              label: 'Twitter',
              to: 'https://twitter.com/factlyindia',
            },
            {
              label: 'Instagram',
              to: 'https://www.instagram.com/factlyindia',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Slack',
              to: 'http://slack.factly.org/',
            },
            {
              label: 'Dega',
              href: 'https://github.com/factly/dega',
            },
            {
              label: 'Dega Server',
              href: 'https://github.com/factly/dega-server',
            },
            {
              label: 'Dega Admin Portal',
              href: 'https://github.com/factly/dega-admin-portal',
            },
            // {
            //   label: 'Dega Themes',
            //   href: 'https://github.com/factly/dega-themes',
            // },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Guides',
              to: 'docs/what-is-dega',
            },
            {
              label: 'FAQ',
              to: 'docs/faq',
            },
            {
              label: 'API',
              to: 'https://degacms.com/docs/api/intro',
            },
            {
              label: 'Blog',
              to: 'blog',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Factly Media & Research.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  customFields: {
    // hero: 'Open Source. Simple. Written in React & Go.',
    hero: 'VidCheck makes video fact-checking more standardized for fact-checkers, easy to read and understand for audiences, and scalable for platforms & fact-checkers.',
  },

};
