import { PolicyPage, policyMetadata } from "@/components/policy-page";

export async function generateMetadata() {
  return policyMetadata("returns");
}

export default function Page() {
  return <PolicyPage name="returns" />;
}
