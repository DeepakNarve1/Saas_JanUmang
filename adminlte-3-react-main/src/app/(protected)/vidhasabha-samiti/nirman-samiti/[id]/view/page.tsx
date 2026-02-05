import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewNirmanSamiti() {
  return (
    <SamitiView
      title="Nirman Samiti"
      apiEndpoint="nirman-samiti"
      resourceName="nirman_samiti"
      basePath="/vidhasabha-samiti/nirman-samiti"
    />
  );
}
