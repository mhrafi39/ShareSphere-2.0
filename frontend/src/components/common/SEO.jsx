import { Helmet } from 'react-helmet-async';
import logo from '../../assets/letter-s.png';

const SEO = ({ title, description }) => {
  const defaultTitle = 'ShareSphere - Connect and Share';
  const defaultDescription = 'ShareSphere is a social platform for connecting with friends and sharing moments.';

  return (
    <Helmet>
      <title>{title ? title : defaultTitle}</title>
      <meta name="description" content={description ? description : defaultDescription} />
      <meta property="og:title" content={title ? title : defaultTitle} />
      <meta property="og:description" content={description ? description : defaultDescription} />
      <meta property="og:type" content="website" />
      <link rel="icon" type="image/png" href={logo} />
    </Helmet>
  );
};

export default SEO;
