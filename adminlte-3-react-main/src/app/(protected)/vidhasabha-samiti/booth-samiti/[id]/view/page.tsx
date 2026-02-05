import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewBoothSamiti() {
  return (
    <SamitiView
      title="Booth Samiti"
      apiEndpoint="booth-samiti"
      resourceName="booth_samiti"
      basePath="/vidhasabha-samiti/booth-samiti"
    />
  );
}
