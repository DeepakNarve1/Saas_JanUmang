"use client";
import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  rounded?: boolean;
}

const Image = ({
  src,
  fallbackSrc,
  rounded,
  className,
  alt,
  ...props
}: ImageProps) => {
  const [imgSrc, setImgSrc] = React.useState(src);

  const handleError = () => {
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt || ""}
      onError={handleError}
      className={`${rounded ? "rounded-full" : ""} ${className || ""}`}
    />
  );
};

export default Image;
