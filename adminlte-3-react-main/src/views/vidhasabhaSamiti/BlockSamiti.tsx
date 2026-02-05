"use client";

import SamitiList from "./common/SamitiList";

const BlockSamiti = () => {
  return (
    <SamitiList
      title="Block Samiti"
      apiEndpoint="block-samiti"
      resourceName="block_samiti"
      basePath="/vidhasabha-samiti/block-samiti"
    />
  );
};

export default BlockSamiti;
