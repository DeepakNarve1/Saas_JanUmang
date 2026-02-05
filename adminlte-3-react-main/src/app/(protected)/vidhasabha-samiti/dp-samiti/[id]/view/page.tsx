import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewDpSamiti() {
  return (
    <SamitiView
      title="DP Samiti"
      apiEndpoint="dp-samiti"
      resourceName="dp_samiti"
      basePath="/vidhasabha-samiti/dp-samiti"
    />
  );
}
