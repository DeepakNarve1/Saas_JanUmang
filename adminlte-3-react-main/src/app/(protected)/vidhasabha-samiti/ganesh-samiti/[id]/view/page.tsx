import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewGaneshSamiti() {
  return (
    <SamitiView
      title="Ganesh Samiti"
      apiEndpoint="ganesh-samiti"
      resourceName="ganesh_samiti"
      basePath="/vidhasabha-samiti/ganesh-samiti"
    />
  );
}
