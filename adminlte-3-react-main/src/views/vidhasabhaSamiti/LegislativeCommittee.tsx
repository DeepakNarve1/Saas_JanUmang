"use client";

import SamitiList from "./common/SamitiList";

const LegislativeCommittee = () => {
  return (
    <SamitiList
      title="Legislative Committee"
      apiEndpoint="legislative-committee"
      resourceName="vidhan_sabha_samiti"
      basePath="/vidhasabha-samiti/legislative-committee"
    />
  );
};

export default LegislativeCommittee;
