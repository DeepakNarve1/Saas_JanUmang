"use client";

import SamitiList from "./common/SamitiList";

const DpSamiti = () => {
  return (
    <SamitiList
      title="DP Samiti"
      apiEndpoint="dp-samiti"
      resourceName="dp_samiti"
      basePath="/vidhasabha-samiti/dp-samiti"
    />
  );
};

export default DpSamiti;
