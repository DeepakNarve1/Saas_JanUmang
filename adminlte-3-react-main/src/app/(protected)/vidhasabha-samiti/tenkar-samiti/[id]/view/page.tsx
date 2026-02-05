import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewTenkarSamiti() {
  return (
    <SamitiView
      title="Tenkar Samiti"
      apiEndpoint="tenkar-samiti"
      resourceName="tenkar_samiti"
      basePath="/vidhasabha-samiti/tenkar-samiti"
    />
  );
}
