"use client";

import SamitiList from "./common/SamitiList";

const MandirSamiti = () => {
  return (
    <SamitiList
      title="Mandir Samiti"
      apiEndpoint="mandir-samiti"
      resourceName="mandir_samiti"
      basePath="/vidhasabha-samiti/mandir-samiti"
    />
  );
};

export default MandirSamiti;
