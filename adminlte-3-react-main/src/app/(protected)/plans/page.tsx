import PlanList from "@app/views/plans/PlanList";

export const metadata = {
  title: "Subscription Plans | Jan Umang",
  description: "Manage system subscription plans and module access.",
};

export default function PlansPage() {
  return <PlanList />;
}
