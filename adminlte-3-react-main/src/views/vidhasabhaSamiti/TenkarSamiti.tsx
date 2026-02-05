"use client";

import SamitiList from "./common/SamitiList";

const TenkarSamiti = () => {
  return (
    <SamitiList
      title="Tenkar Samiti"
      apiEndpoint="tenkar-samiti"
      resourceName="tenkar_samiti"
      basePath="/vidhasabha-samiti/tenkar-samiti"
    />
  );
};

export default TenkarSamiti;
