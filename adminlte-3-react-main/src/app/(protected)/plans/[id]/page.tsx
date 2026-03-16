"use client";
import { useParams } from "next/navigation";
import PlanView from "@app/views/plans/PlanView";

const Page = () => {
  const params = useParams();
  const id = params.id as string;

  return <PlanView id={id} />;
};

export default Page;
