import { PolicyPage, policyMetadata } from "@/components/policy-page";

export async function generateMetadata() {
  return policyMetadata("terms");
}

export default function Page() {
  return <PolicyPage name="terms" />;
}
