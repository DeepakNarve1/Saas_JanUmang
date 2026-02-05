import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewBlockSamiti() {
  return (
    <SamitiView
      title="Block Samiti"
      apiEndpoint="block-samiti"
      resourceName="block_samiti"
      basePath="/vidhasabha-samiti/block-samiti"
    />
  );
}
