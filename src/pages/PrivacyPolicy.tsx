import DynamicPage from "@/components/DynamicPage";

const PrivacyPolicy = () => (
  <DynamicPage
    slug="privacy"
    fallbackTitle="Privacy Policy"
    fallbackContent="<p>Loading privacy policy content...</p>"
  />
);

export default PrivacyPolicy;
