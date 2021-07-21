const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'VidCheck',
  tagline: 'Open Source platform for publishing video fact-checks',
  url: 'https://vidcheck.factlylabs.com',
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
          docId: 'introduction/what-is-vidcheck',
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
          title: 'Factly Media & Research',
          items: [
            {
              label: 'About',
              to: 'docs/ecosystem/philosophy#about-factly',
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
            // {
            //   label: 'Privacy Policy',
            //   to: 'docs/privacy-policy',
            // },
          ],
        },
        {
          title: 'Factly Labs',
          items: [
            {
              label: 'About',
              to: 'docs/ecosystem/philosophy#about-factly-labs',
            },            
            {
              label: 'Github',
              to: 'https://github.com/factly',
            },
            {
              label: 'Slack',
              to: 'http://slack.factly.org/',
            },
            {
              label: 'Twitter',
              to: 'https://twitter.com/factlylabs',
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
              label: 'Github',
              to: 'https://github.com/factly',
            },
            {
              label: 'Twitter',
              to: 'https://twitter.com/factlylabs',
            },
            {
              label: 'Contributors',
              to: 'docs/contributors/introduction'
            }
          ],
        },
        {
          title: 'VidCheck',
          items: [
            {
              label: 'GitHub',
              to: 'https://github.com/factly/vidcheck',
            },
            {
              label: 'Issues',
              to: 'https://github.com/factly/vidcheck/issues',
            },
            {
              label: 'Discussions',
              to: 'https://github.com/factly/vidcheck/discussions',
            },
            {
              label: 'Managed Hosting',
              to: 'https://vidcheck.factly.org',
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
            'https://github.com/factly/vidcheck/edit/develop/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/factly/vidcheck/edit/develop/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  customFields: {
    hero: 'VidCheck makes video fact-checking more standardized for fact-checkers, easy to read and understand for audiences, and scalable for platforms & fact-checkers.',
  },

};
