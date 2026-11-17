import { PolicyPage, policyMetadata } from "@/components/policy-page";

export async function generateMetadata() {
  return policyMetadata("privacy");
}

export default function Page() {
  return <PolicyPage name="privacy" />;
}
