"use client";

import SamitiList from "./common/SamitiList";

const NirmanSamiti = () => {
  return (
    <SamitiList
      title="Nirman Samiti"
      apiEndpoint="nirman-samiti"
      resourceName="nirman_samiti"
      basePath="/vidhasabha-samiti/nirman-samiti"
    />
  );
};

export default NirmanSamiti;
