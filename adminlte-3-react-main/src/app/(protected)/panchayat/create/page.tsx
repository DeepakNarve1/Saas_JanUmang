"use client";

import { RouteGuard } from "@app/components/RouteGuard";
import CreatePanchayat from "@app/views/Panchayat/CreatePanchayat";

const CreatePanchayatPage = () => {
  return (
    <RouteGuard requiredPermission="create_panchayats">
      <CreatePanchayat />
    </RouteGuard>
  );
};

export default CreatePanchayatPage;
