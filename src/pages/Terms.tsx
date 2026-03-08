import DynamicPage from "@/components/DynamicPage";

const Terms = () => (
  <DynamicPage
    slug="terms"
    fallbackTitle="Terms & Conditions"
    fallbackContent="<p>Loading terms content...</p>"
  />
);

export default Terms;
