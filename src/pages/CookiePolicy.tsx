import DynamicPage from "@/components/DynamicPage";

const CookiePolicy = () => (
  <DynamicPage
    slug="cookie-policy"
    fallbackTitle="Cookie Policy"
    fallbackContent="<p>Loading cookie policy content...</p>"
  />
);

export default CookiePolicy;
