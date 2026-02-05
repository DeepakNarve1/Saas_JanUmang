"use client";

import SamitiList from "./common/SamitiList";

const BoothSamiti = () => {
  return (
    <SamitiList
      title="Booth Samiti"
      apiEndpoint="booth-samiti"
      resourceName="booth_samiti"
      basePath="/vidhasabha-samiti/booth-samiti"
    />
  );
};

export default BoothSamiti;
