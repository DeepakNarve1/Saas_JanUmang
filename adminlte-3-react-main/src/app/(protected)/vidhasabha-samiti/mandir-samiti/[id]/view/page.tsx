import SamitiView from "@app/views/vidhasabhaSamiti/common/SamitiView";

export default function ViewMandirSamiti() {
  return (
    <SamitiView
      title="Mandir Samiti"
      apiEndpoint="mandir-samiti"
      resourceName="mandir_samiti"
      basePath="/vidhasabha-samiti/mandir-samiti"
    />
  );
}
