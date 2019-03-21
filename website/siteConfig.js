
const users = [
  {
    caption: 'Allan Hortle',
    image: '/img/docusaurus.svg',
    infoLink: 'github.com/allanhortle',
    pinned: true,
  },
];

const siteConfig = {
  title: 'Pnut',
  tagline: `A low-level React charting library built on D3`,
  url: 'https://pnut.blueflag.codes',
  baseUrl: '/',
  projectName: '',
  organizationName: 'BigDatr',
  headerLinks: [
    {doc: 'getting-started', label: 'Tutorial'},
    {doc: 'component/Chart', label: 'API'},
    {search: true}
  ],
  users,
  headerIcon: 'img/icon/logo.svg',
  favicon: 'favicon.ico',
  colors: {
    primaryColor: '#282a36',
    secondaryColor: '#1b1e2d'
  },
  copyright: `Copyright © ${new Date().getFullYear()} BigDatr`,
  highlight: {
    defaultLang: 'javascript',
    version: '9.14.2',
    theme: 'dracula',
  },
  onPageNav: 'separate',
  cleanUrl: true,
  repoUrl: 'https://github.com/bigdatr/pnut',
};

module.exports = siteConfig;
