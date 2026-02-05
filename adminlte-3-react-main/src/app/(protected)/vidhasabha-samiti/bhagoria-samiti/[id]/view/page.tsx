import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewBhagoriaSamiti() {
  return (
    <SamitiView
      title="Bhagoria Samiti"
      apiEndpoint="bhagoria-samiti"
      resourceName="bhagoria_samiti"
      basePath="/vidhasabha-samiti/bhagoria-samiti"
    />
  );
}
