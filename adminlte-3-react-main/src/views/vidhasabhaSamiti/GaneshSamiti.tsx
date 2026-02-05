"use client";

import SamitiList from "./common/SamitiList";

const GaneshSamiti = () => {
  return (
    <SamitiList
      title="Ganesh Samiti"
      apiEndpoint="ganesh-samiti"
      resourceName="ganesh_samiti"
      basePath="/vidhasabha-samiti/ganesh-samiti"
    />
  );
};

export default GaneshSamiti;
