import { Helmet } from 'react-helmet-async';

export const SEO = ({ 
  title = 'QuickAI - AI Content & Media Assistant', 
  description = 'Create amazing content with AI tools. Generate articles, blog titles, images, remove backgrounds, and get resume reviews with QuickAI.',
  keywords = 'AI, content creation, image generation, article writer, blog titles, background removal, resume review',
  author = 'Ashutosh',
  image = '/gradientBackground.png',
  url = 'https://quickai.com'
}) => {
  const fullTitle = title.includes('QuickAI') ? title : `${title} | QuickAI`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional */}
      <meta name="theme-color" content="#3C81F6" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
