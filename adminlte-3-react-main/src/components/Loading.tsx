export const Loading = () => {
  return (
    <div className="preloader flex flex-col justify-center items-center fixed inset-0 z-9999 bg-[#f4f6f9]">
      <img
        className="animation__shake"
        src="/img/logo.png"
        alt="JanUmangLogo"
        height={60}
        width={60}
      />
    </div>
  );
};
