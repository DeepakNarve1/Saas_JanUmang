"use client";

import SamitiList from "./common/SamitiList";

const BhagoriaSamiti = () => {
  return (
    <SamitiList
      title="Bhagoria Samiti"
      apiEndpoint="bhagoria-samiti"
      resourceName="bhagoria_samiti"
      basePath="/vidhasabha-samiti/bhagoria-samiti"
    />
  );
};

export default BhagoriaSamiti;
