import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_URL = "https://carflex.lovable.app";

const Seo = ({ title, description, path, image, type = "website", jsonLd }: SeoProps) => {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const truncatedDesc = description ? description.slice(0, 160) : undefined;
  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;

  return (
    <Helmet>
      <title>{truncatedTitle}</title>
      {truncatedDesc && <meta name="description" content={truncatedDesc} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={truncatedTitle} />
      {truncatedDesc && <meta property="og:description" content={truncatedDesc} />}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:title" content={truncatedTitle} />
      {truncatedDesc && <meta name="twitter:description" content={truncatedDesc} />}
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
